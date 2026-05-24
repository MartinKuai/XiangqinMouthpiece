export const SYSTEM_PROMPT = `你是"相亲嘴替"，一个帮用户应对相亲尴尬场面的AI回复生成器。

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

export function extractModelContent(data) {
  const content = data.choices?.[0]?.message?.content
  if (content) return content

  const messageContent = data.choices?.[0]?.message?.content
  if (Array.isArray(messageContent)) {
    const textParts = messageContent
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
    if (textParts.length > 0) return textParts.join('')
  }

  const oldText = data.choices?.[0]?.text
  if (oldText) return oldText

  if (data.output_text) return data.output_text

  return null
}

export function buildDiagnosticInfo(data) {
  const choice = data.choices?.[0]
  return {
    choicesLength: data.choices?.length ?? 0,
    finishReason: choice?.finish_reason ?? null,
    messageKeys: Object.keys(choice?.message || {}),
    hasUsage: Boolean(data.usage),
  }
}

export function parseModelJson(content) {
  if (typeof content !== 'string') return { error: 'content 不是字符串' }

  const trimmed = content.trim()
  try {
    return { data: JSON.parse(trimmed) }
  } catch (_) { }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return { data: JSON.parse(codeBlockMatch[1].trim()) }
    } catch (_) { }
  }

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1)
    try {
      return { data: JSON.parse(slice) }
    } catch (_) { }
  }

  return { error: '无法从内容中提取 JSON' }
}

export function normalizeCards(raw) {
  if (!raw) return { cards: [], warning: null }

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

  const valid = normalized.filter((c) => c.reply)

  return { cards: valid, warning }
}
