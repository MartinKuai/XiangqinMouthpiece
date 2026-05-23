const MAX_MESSAGE_LENGTH = 120

// ── JSON 响应 helper ──────────────────────────────────────────────────────────
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

// ── 安全兜底卡片 ──────────────────────────────────────────────────────────────
function buildSafeFallbackCards() {
  return [
    {
      type: '真发版',
      reply: '我们还是好好说话吧，别把相亲聊成吵架现场。',
      styleTag: '温和化解',
      sceneNote: '用轻松语气缓和气氛，不接攻击',
      riskLevel: '适合真发',
    },
    {
      type: '阴阳版',
      reply: '这个开场挺省时间的，素质筛选一步到位。',
      styleTag: '微讽边界',
      sceneNote: '暗示对方表达不当，但不升级冲突',
      riskLevel: '看关系',
    },
    {
      type: '日常脑回路错位版',
      reply: '这句我先当成输入法事故处理。',
      styleTag: '生活类比',
      sceneNote: '用技术故障化解尴尬，不接招',
      riskLevel: '看关系',
    },
    {
      type: '抽象整活版',
      reply: '收到，已放入"不适合继续聊"文件夹。',
      styleTag: '抽象整活',
      sceneNote: '用文件管理比喻，轻松化解',
      riskLevel: '仅供整活',
    },
  ]
}

// ── 提取模型 content ──────────────────────────────────────────────────────────
function extractModelContent(data) {
  // 1. 标准 OpenAI-compatible: data.choices[0].message.content
  const content = data.choices?.[0]?.message?.content
  if (content) return content

  // 2. content 是数组（多模态 / reasoning 模型）
  const messageContent = data.choices?.[0]?.message?.content
  if (Array.isArray(messageContent)) {
    const textParts = messageContent
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
    if (textParts.length > 0) return textParts.join('')
  }

  // 3. 旧式结构: data.choices[0].text
  const oldText = data.choices?.[0]?.text
  if (oldText) return oldText

  // 4. Responses 风格兜底: data.output_text
  if (data.output_text) return data.output_text

  return null
}

// ── 安全诊断信息（不含敏感字段） ────────────────────────────────────────────
function buildDiagnosticInfo(data) {
  const choice = data.choices?.[0]
  return {
    choicesLength: data.choices?.length ?? 0,
    finishReason: choice?.finish_reason ?? null,
    messageKeys: Object.keys(choice?.message || {}),
    hasUsage: Boolean(data.usage),
  }
}

// ── 解析模型 JSON 输出 ────────────────────────────────────────────────────────
function parseModelJson(content) {
  if (typeof content !== 'string') return { error: 'content 不是字符串' }

  // 1. trim 后直接解析
  const trimmed = content.trim()
  try {
    return { data: JSON.parse(trimmed) }
  } catch (_) { /* continue */ }

  // 2. 提取 ```json ... ``` 代码块
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return { data: JSON.parse(codeBlockMatch[1].trim()) }
    } catch (_) { /* continue */ }
  }

  // 3. 从第一个 { 到最后一个 } 截取
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1)
    try {
      return { data: JSON.parse(slice) }
    } catch (_) { /* continue */ }
  }

  return { error: '无法从内容中提取 JSON' }
}

// ── 归一化卡片结构 ────────────────────────────────────────────────────────────
function normalizeCards(raw) {
  if (!raw) return { cards: [], warning: null }

  // 如果模型直接返回数组
  const arr = Array.isArray(raw) ? raw : raw.cards || []

  const normalized = arr.map((card) => ({
    type: card.type || card.label || '未知',
    reply: card.reply || card.text || card.content || '',
    styleTag: card.styleTag || card.style_tag || card.style || '',
    sceneNote: card.sceneNote || card.scene_note || card.note || '',
    riskLevel: card.riskLevel || card.risk_level || card.risk || '',
  }))

  let warning = null
  if (normalized.length < 4) {
    warning = '模型返回卡片数量不足'
  }

  // 过滤掉没有 reply 的卡片
  const valid = normalized.filter((c) => c.reply)

  return { cards: valid, warning }
}

// ── 合法化参数 ────────────────────────────────────────────────────────────────
function clampTemperature(raw) {
  const n = Number(raw)
  if (Number.isNaN(n) || n < 0 || n > 2) return 0.85
  return n
}

function clampMaxTokens(raw) {
  const n = Number(raw)
  if (Number.isNaN(n) || n < 200 || n > 1200) return 700
  return n
}

// ── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `你是"相亲嘴替"，一个帮用户应对相亲尴尬场面的AI回复生成器。

你的任务是：根据用户输入的相亲对象发言，生成4种不同风格的回复。

【重要前提】
用户输入的是"相亲对象说出的原话"，可能包含冒犯、辱骂、人身攻击或低素质表达。
你的任务不是复述、放大或升级这些攻击，而是生成"有边界、轻反击、不过度攻击"的回复。
如果原话过于粗鄙，请转化成更克制、更有边界的回应。

【核心风格】
低门槛、短反转、轻冒犯、别装。
- 表面平静，实际反客为主
- 不脏不骂，有点损
- 1秒内能看懂笑点
- 冒犯的是对方这句话，而不是攻击对方这个人

【允许的表达方式】
- 谐音梗、双关梗、反向理解
- 生活常识类比
- 基础数学梗（绝对值、等号、不等号、加减分、及格线、满分）
- 极简符号梗
- 日常场景类比（售后、质检、面试、打折、排队、过期、会员、清仓、说明书）

【禁止的表达方式】
- SQL、复杂代码、高阶数学、微积分、集合论
- 复杂物理化学
- 只有程序员才懂的黑话
- 任何显得"死装"的表达

【安全边界】
- 可以讽刺具体发言，但不要攻击对方这个人
- 可以轻微阴阳怪气，但不能使用脏话
- 不输出脏话、辱骂、人身攻击
- 不攻击性别、地域、年龄、长相、身材、学历、收入、职业、家庭背景
- 不输出PUA、吊着对方、情绪操控、欺骗式回复
- 不输出厌男、厌女或制造性别对立的内容
- 不生成性羞辱、荡妇羞辱、外貌羞辱、收入羞辱
- 不煽动骚扰、报复或持续纠缠
- 如果用户输入包含明显辱骂、人身攻击或低素质表达，请转化成更克制、更有边界的回应，不要升级冲突

【输出格式 - 极度重要】
你必须严格按照以下JSON格式输出。
不要输出任何其他内容。不要输出Markdown。不要输出代码块。不要输出解释。不要输出推理过程。
直接输出JSON对象，不要用\`\`\`包裹。

{
  "cards": [
    {
      "type": "真发版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (简短风格标签)",
      "sceneNote": "string (简短说明，解释为什么这样回)",
      "riskLevel": "适合真发"
    },
    {
      "type": "阴阳版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (简短风格标签)",
      "sceneNote": "string (简短说明)",
      "riskLevel": "看关系"
    },
    {
      "type": "日常脑回路错位版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (简短风格标签)",
      "sceneNote": "string (简短说明)",
      "riskLevel": "看关系"
    },
    {
      "type": "抽象整活版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (简短风格标签)",
      "sceneNote": "string (简短说明)",
      "riskLevel": "仅供整活"
    }
  ],
  "safetyNote": "string (安全提示，如果输入正常则为空字符串)"
}

【各版本说明】
- 真发版：适合真实聊天，不撕破脸，有边界但温和
- 阴阳版：有边界、有锋芒，但不骂人，让对方意识到问题
- 日常脑回路错位版：用低门槛的谐音、双关、生活常识、基础数学完成反转
- 抽象整活版：适合截图娱乐，不建议真实发送，可以更夸张

【重要】
- 每条reply尽量短，8-28个中文字
- cards 必须包含恰好 4 条
- 每条 reply 必须非空
- 如果不确定如何回复，也必须返回安全、短句、低攻击性的兜底回复
- 只输出JSON，不要输出Markdown或其他内容`

// ── 主函数 ────────────────────────────────────────────────────────────────────
export async function onRequestPost(context) {
  try {
    const { request, env } = context

    const requestId = Math.random().toString(36).slice(2, 10)
    const debug = env.DEBUG_RESPONSE === 'true'

    // ── 解析请求体 ──────────────────────────────────────────────────────────
    let body
    try {
      body = await request.json()
    } catch (e) {
      return jsonResponse({ error: '请求格式错误', code: 'INVALID_REQUEST_BODY' }, 400)
    }

    const { message, scenario, perspective, intensity } = body
    const submittedCode = body.inviteCode ?? body.accessCode ?? ''

    // ── 输入校验 ────────────────────────────────────────────────────────────
    if (!message || message.trim() === '') {
      return jsonResponse({ error: '请输入相亲对象的发言', code: 'EMPTY_MESSAGE' }, 400)
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: `输入不能超过${MAX_MESSAGE_LENGTH}字`, code: 'MESSAGE_TOO_LONG' }, 400)
    }

    // ── 访问码校验 ──────────────────────────────────────────────────────────
    const expectedCode = (env.DEMO_ACCESS_CODE || env.DEMO_INVITE_CODE || '').trim()
    if (expectedCode && submittedCode !== expectedCode) {
      return jsonResponse({ error: '访问码不正确，无法生成。', code: 'INVALID_ACCESS_CODE' }, 401)
    }

    // ── 环境变量与 Mock 校验 ──────────────────────────────────────────────────
    const apiKey = env.MODEL_API_KEY
    const baseUrl = (env.MODEL_BASE_URL || '').replace(/\/+$/, '')
    const modelName = env.MODEL_NAME

    // 优先判断是否启用 Mock，或者缺少必要的环境变量时退化为 Mock
    const isMock = env.MOCK_API === 'true' || !apiKey || !baseUrl || !modelName

    if (isMock) {
      console.log('[generate] Using Mock API', { requestId, reason: env.MOCK_API === 'true' ? 'MOCK_API=true' : 'Missing Env' })
      return jsonResponse({
        cards: [
          {
            type: '真发版',
            reply: '刚好够花，你也是来对账的吗？',
            styleTag: '温和化解',
            sceneNote: '用轻松反问化解查户口',
            riskLevel: '适合真发'
          },
          {
            type: '阴阳版',
            reply: '怎么，你打算给我发工资吗？',
            styleTag: '微讽边界',
            sceneNote: '暗示对方管得宽，不客气',
            riskLevel: '看关系'
          },
          {
            type: '日常脑回路错位版',
            reply: '稍等，我问下我财务（指我妈）。',
            styleTag: '生活类比',
            sceneNote: '假装听不懂，用荒谬的理由糊弄',
            riskLevel: '看关系'
          },
          {
            type: '抽象整活版',
            reply: '我工资？我每天去寺庙功德箱里进货。',
            styleTag: '抽象整活',
            sceneNote: '纯纯离谱，让对话无法进行',
            riskLevel: '仅供整活'
          }
        ],
        safetyNote: '注意：当前为 Mock 数据，未请求真实大模型。'
      })
    }

    // TODO: 后续可将下方真实调用逻辑拆分到 functions/_lib/providers/mimo.js
    // TODO: switch by MODEL_PROVIDER=mimo/deepseek

    const temperature = clampTemperature(env.MODEL_TEMPERATURE)
    const maxTokens = clampMaxTokens(env.MODEL_MAX_TOKENS)

    // ── 构建用户消息 ────────────────────────────────────────────────────────
    let userMessage = `【用户输入】\n${message}`
    if (scenario) userMessage += `\n\n【场景】\n${scenario}`
    if (perspective && perspective !== '不指定') userMessage += `\n\n【用户视角】\n${perspective}`
    if (intensity) userMessage += `\n\n【冒犯强度】\n${intensity}`

    const endpoint = `${baseUrl}/chat/completions`

    console.log('[generate] request', {
      requestId,
      messageLength: message.length,
      model: modelName,
      temperature,
      maxTokens,
    })

    // ── 调用 Mimo ───────────────────────────────────────────────────────────
    let upstreamResponse
    try {
      upstreamResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      })
    } catch (fetchError) {
      console.error('[generate] fetch error', { requestId, message: fetchError.message })
      return jsonResponse({
        error: '无法连接模型服务。',
        code: 'MIMO_FETCH_ERROR',
        detail: fetchError.message,
      }, 502)
    }

    console.log('[generate] upstream response', {
      requestId,
      status: upstreamResponse.status,
      ok: upstreamResponse.ok,
    })

    // ── 读取上游文本 ────────────────────────────────────────────────────────
    const upstreamText = await upstreamResponse.text()

    // ── 上游非 2xx ──────────────────────────────────────────────────────────
    if (!upstreamResponse.ok) {
      console.error('[generate] upstream error', {
        requestId,
        status: upstreamResponse.status,
        model: modelName,
      })
      return jsonResponse({
        error: '模型服务返回错误。',
        code: 'MIMO_HTTP_ERROR',
        detail: `status: ${upstreamResponse.status}`,
      }, 502)
    }

    // ── 上游文本为空 ────────────────────────────────────────────────────────
    if (!upstreamText || upstreamText.trim() === '') {
      console.error('[generate] empty upstream text', { requestId, model: modelName })
      return jsonResponse({
        error: '模型服务返回空响应。',
        code: 'MIMO_EMPTY_UPSTREAM_TEXT',
      }, 502)
    }

    // ── 上游文本不是 JSON ────────────────────────────────────────────────────
    let upstreamData
    try {
      upstreamData = JSON.parse(upstreamText)
    } catch (e) {
      console.error('[generate] upstream invalid json', {
        requestId,
        model: modelName,
        textLength: upstreamText.length,
      })
      return jsonResponse({
        error: '模型服务响应不是有效 JSON。',
        code: 'MIMO_UPSTREAM_INVALID_JSON',
      }, 502)
    }

    // ── 提取模型 content ────────────────────────────────────────────────────
    const content = extractModelContent(upstreamData)

    if (!content) {
      const diag = buildDiagnosticInfo(upstreamData)
      console.error('[generate] empty response', {
        requestId,
        model: modelName,
        ...diag,
      })
      const resp = {
        error: '模型服务未返回有效内容。',
        code: 'MIMO_EMPTY_RESPONSE',
      }
      if (debug) {
        resp.debug = {
          model: modelName,
          upstreamStatus: upstreamResponse.status,
          ...diag,
        }
      }
      return jsonResponse(resp, 502)
    }

    // ── 解析模型 JSON ────────────────────────────────────────────────────────
    const parseResult = parseModelJson(content)

    if (parseResult.error) {
      console.error('[generate] model json parse failed', {
        requestId,
        model: modelName,
        reason: parseResult.error,
        contentLength: content.length,
      })
      const resp = {
        error: '模型返回内容无法解析。',
        code: 'MODEL_OUTPUT_INVALID_JSON',
      }
      if (debug) {
        resp.debug = {
          model: modelName,
          upstreamStatus: upstreamResponse.status,
          contentPreview: content.slice(0, 300),
        }
      }
      return jsonResponse(resp, 500)
    }

    // ── 归一化卡片 ──────────────────────────────────────────────────────────
    const { cards, warning } = normalizeCards(parseResult.data)

    if (cards.length === 0) {
      console.error('[generate] no valid cards', {
        requestId,
        model: modelName,
      })
      const resp = {
        error: '模型返回内容不符合预期结构。',
        code: 'MODEL_OUTPUT_INVALID_SCHEMA',
      }
      if (debug) {
        resp.debug = {
          model: modelName,
          upstreamStatus: upstreamResponse.status,
          contentPreview: content.slice(0, 300),
        }
      }
      return jsonResponse(resp, 500)
    }

    // ── 构建最终响应 ────────────────────────────────────────────────────────
    const result = {
      cards,
      safetyNote: parseResult.data.safetyNote || '',
    }
    if (warning) result.warning = warning
    if (debug) {
      result.debug = {
        model: modelName,
        upstreamStatus: upstreamResponse.status,
        cardsCount: cards.length,
      }
    }

    console.log('[generate] success', { requestId, model: modelName, cardsCount: cards.length })
    return jsonResponse(result)
  } catch (error) {
    console.error('UNHANDLED_GENERATE_ERROR', {
      name: error?.name,
      message: error?.message,
    })
    return jsonResponse({
      error: '服务端生成接口异常，请稍后重试。',
      code: 'UNHANDLED_FUNCTION_ERROR',
      detail: error?.message || 'Unknown error',
    }, 500)
  }
}
