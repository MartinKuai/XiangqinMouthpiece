const MAX_MESSAGE_LENGTH = 120

// JSON 响应 helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

// 安全兜底卡片
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

// 安全兜底响应
function safeFallbackResponse() {
  return jsonResponse({
    fallback: true,
    code: 'SAFE_FALLBACK',
    message: '这句有点冲，已切换为克制版回复。',
    cards: buildSafeFallbackCards(),
    safetyNote: '已避免复述脏话、人身攻击或升级冲突。',
  })
}

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

【输出要求】
请严格按照以下JSON格式输出，不要输出任何其他内容：

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
- 不要长篇说教
- 不要输出解释性大段文字
- sceneNote要短，只解释为什么这样回
- 只输出JSON，不要输出Markdown或其他内容`

// 合法化 temperature（0~2）
function clampTemperature(raw) {
  const n = Number(raw)
  if (Number.isNaN(n) || n < 0 || n > 2) return 0.85
  return n
}

// 合法化 max_tokens（200~1200）
function clampMaxTokens(raw) {
  const n = Number(raw)
  if (Number.isNaN(n) || n < 200 || n > 1200) return 700
  return n
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context

    // 生成请求 ID（用于日志追踪，不含敏感信息）
    const requestId = Math.random().toString(36).slice(2, 10)

    // 解析请求体
    let body
    try {
      body = await request.json()
    } catch (e) {
      return jsonResponse({ error: '请求格式错误' }, 400)
    }

    const { message, scenario, perspective, intensity } = body
    // 兼容前端 inviteCode 和 accessCode 两种字段名
    const submittedCode = body.inviteCode ?? body.accessCode ?? ''

    // 输入校验
    if (!message || message.trim() === '') {
      return jsonResponse({ error: '请输入相亲对象的发言' }, 400)
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: `输入不能超过${MAX_MESSAGE_LENGTH}字` }, 400)
    }

    // 访问码校验（兼容 DEMO_ACCESS_CODE 和 DEMO_INVITE_CODE）
    const expectedCode = (env.DEMO_ACCESS_CODE || env.DEMO_INVITE_CODE || '').trim()
    if (expectedCode && submittedCode !== expectedCode) {
      return jsonResponse({ error: '访问码不正确，无法生成。' }, 401)
    }

    // 读取环境变量并校验
    const apiKey = env.MODEL_API_KEY
    const baseUrl = (env.MODEL_BASE_URL || '').replace(/\/+$/, '')
    const model = env.MODEL_NAME

    if (!apiKey) {
      return jsonResponse({
        error: '服务端模型 API Key 未配置。',
        code: 'MISSING_API_KEY',
      }, 500)
    }

    if (!baseUrl) {
      return jsonResponse({
        error: '服务端模型 Base URL 未配置。',
        code: 'MISSING_BASE_URL',
      }, 500)
    }

    if (!model) {
      return jsonResponse({
        error: '服务端模型名称未配置。',
        code: 'MISSING_MODEL_NAME',
      }, 500)
    }

    const temperature = clampTemperature(env.MODEL_TEMPERATURE)
    const maxTokens = clampMaxTokens(env.MODEL_MAX_TOKENS)

    // 构建用户消息
    let userMessage = `【用户输入】\n${message}`
    if (scenario) {
      userMessage += `\n\n【场景】\n${scenario}`
    }
    if (perspective && perspective !== '不指定') {
      userMessage += `\n\n【用户视角】\n${perspective}`
    }
    if (intensity) {
      userMessage += `\n\n【冒犯强度】\n${intensity}`
    }

    // 调用 Mimo OpenAI-compatible API
    const endpoint = `${baseUrl}/chat/completions`

    console.log('[generate] request', {
      requestId,
      messageLength: message.length,
      model,
      temperature,
      maxTokens,
    })

    let response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      })
    } catch (fetchError) {
      console.error('[generate] fetch error', fetchError.message)
      return jsonResponse({
        error: '无法连接模型服务。',
        code: 'MIMO_FETCH_ERROR',
        detail: fetchError.message,
      }, 502)
    }

    // 处理上游非 2xx 响应
    if (!response.ok) {
      let errorMsg = ''
      try {
        const errorData = await response.json()
        errorMsg = errorData?.error?.message || ''
      } catch (e) {
        // 忽略 JSON 解析失败
      }

      // 内容安全拒绝
      if (response.status === 400 && (errorMsg.includes('safety') || errorMsg.includes('content') || errorMsg.includes('filter') || errorMsg.includes('reject'))) {
        return jsonResponse({
          error: '这类输入可能触发内容安全策略',
          code: 'CONTENT_SAFETY_BLOCKED',
          message: '这句话包含明显辱骂或人身攻击，模型可能拒绝生成。你可以把原话改成场景描述后再试，例如："对方用脏话骂我，我想礼貌但有边界地回一句。"',
        }, 400)
      }

      console.error('[generate] upstream error', response.status, response.statusText)
      return jsonResponse({
        error: '模型服务返回错误。',
        code: 'MIMO_HTTP_ERROR',
        detail: `status: ${response.status}`,
      }, 502)
    }

    // 解析上游响应
    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error('[generate] upstream json parse error', e.message)
      return jsonResponse({
        error: '模型服务返回格式错误。',
        code: 'MIMO_UPSTREAM_PARSE_ERROR',
      }, 502)
    }

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.log('[generate] empty response', { requestId })
      return jsonResponse({
        error: '模型服务未返回有效内容。',
        code: 'MIMO_EMPTY_RESPONSE',
      }, 502)
    }

    // 解析 JSON
    let result
    try {
      result = JSON.parse(content)
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0])
        } catch (e2) {
          console.log('[generate] fallback', { requestId, reason: 'JSON parse failed after extraction' })
          return jsonResponse({
            error: '模型返回内容无法解析。',
            code: 'MODEL_OUTPUT_INVALID_JSON',
          }, 500)
        }
      } else {
        console.log('[generate] fallback', { requestId, reason: 'no JSON found in response' })
        return jsonResponse({
          error: '模型返回内容无法解析。',
          code: 'MODEL_OUTPUT_INVALID_JSON',
        }, 500)
      }
    }

    // 验证返回结构
    if (!result.cards || !Array.isArray(result.cards) || result.cards.length !== 4) {
      console.log('[generate] fallback', { requestId, reason: 'invalid cards structure' })
      return jsonResponse({
        error: '模型返回内容无法解析。',
        code: 'MODEL_OUTPUT_INVALID_SCHEMA',
      }, 500)
    }

    console.log('[generate] success', { requestId })
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
