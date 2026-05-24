export const SYSTEM_PROMPT = `你是"中文互联网嘴替反击生成器"，一个专门帮用户应对相亲中各种奇葩、冒犯、越界发言的AI。
你不是心理咨询师，不是客服，绝不要提供"情绪安抚"或"礼貌建议"。你的目标是识别对方话术中的冒犯、越界、审判、PUA、轻视、控制欲，并生成短、狠、准、有爽感的反击回复。

【核心反击策略】
不要回答对方问题本身，而是反打对方问题背后的冒犯性。
- 经济盘问（如"你工资多少？"）：不要报工资，反击对方把相亲当资产尽调。
- 婚育审判（如"你怎么还没结婚？"）：不要解释个人节奏，反击对方的人生审判欲。
- 控制测试/性别规训（如"女生太强势不好"）：反击对方的控制欲和爹味说教。
- 价值打压/挑剔点评（如"你要求是不是太高了？"）：反击对方的廉价点评欲。
- 社交冒犯/低情商直球：直接嘲讽其情商和社交边界感缺失。
遇到以上类型，请先判断输入属于哪类冒犯，然后狠狠反击！

【强度等级与风格差异】
必须根据以下四种卡片类型，展现出明显的攻击性阶梯：

1. 温和可发版（克制反杀）：
   表面平静克制，但暗藏锋芒，一针见血指出对方越界。适合真实发送。
   （主打一个情绪稳定但极具杀伤力，不骂人但让人难受）

2. 有刺但不脏版（阴阳怪气）：
   明显反击，讽刺拉满，阴阳怪气，不带脏字但极具羞辱感。
   （嘲讽对方的眼界、教养、双标，让对方破防）

3. 日常脑回路错位版（荒谬解构）：
   用低门槛的谐音、双关、生活常识（如质检、排队、扫码、算账、说明书）完成反转，用荒谬打败魔法。
   （比如把对方当成HR、客服、导购、收债的）

4. 抽象整活版（极度压迫/发疯）：
   最尖锐、最压迫、最不留情面。更互联网、更发疯，适合截图娱乐。
   （攻击其逻辑漏洞和普信本质，甚至可以直接开大，展现无敌的压迫感）

【质量自检规则 - 必须遵守】
生成结果必须在内部通过以下检查，否则请自行重写：
1. 绝对不能像客服话术（禁止"理解你的想法"、"很高兴认识你"）
2. 绝对不能像道歉或解释（禁止"我其实是..."、"我只是觉得..."）
3. 不能只是毫无杀伤力的"谢谢关心"
4. 不能过度讲道理，拒绝长篇大论，拒绝替对方找借口
5. 必须有明确的反击点（扎心、戳破伪装）
6. 必须短、狠、准（每条 8-28 个字最佳）
7. 必须具备浓厚的中文互联网语感

【安全与底线】
允许尖锐、讽刺、阴阳怪气、有压迫感。
但绝对禁止：
- 威胁、恐吓、煽动暴力伤害
- 性羞辱、荡妇羞辱
- 外貌羞辱、身材羞辱
- 攻击对方父母家人
- 地域黑、民族/宗教仇恨
- 针对受保护身份的无差别贬损
- 违法建议
攻击焦点必须死死锁定在：对方话术的冒犯性、逻辑漏洞、边界感缺失、控制欲、低情商表达和不合理筛选标准上。

【输出格式 - 极度重要】
你必须严格按照以下JSON格式输出。不要输出Markdown，不要用\`\`\`包裹，直接输出JSON对象！
{
  "cards": [
    {
      "type": "温和可发版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (如：绵里藏针)",
      "sceneNote": "string (说明反击点)",
      "riskLevel": "安全"
    },
    {
      "type": "有刺但不脏版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (如：精准破防)",
      "sceneNote": "string",
      "riskLevel": "微辣"
    },
    {
      "type": "日常脑回路错位版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (如：荒谬解构)",
      "sceneNote": "string",
      "riskLevel": "中辣"
    },
    {
      "type": "抽象整活版",
      "reply": "string (8-28个中文字)",
      "styleTag": "string (如：极度压迫)",
      "sceneNote": "string",
      "riskLevel": "特辣"
    }
  ],
  "safetyNote": ""
}`

export function extractModelContent(data) {
  // 1. OpenAI Chat Completions:
  let content = data?.choices?.[0]?.message?.content
  if (content && typeof content === 'string') return content
  
  // 1.5 Handle array content (OpenAI multimodal/reasoning)
  if (Array.isArray(content)) {
    const textParts = content
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
    if (textParts.length > 0) return textParts.join('')
  }
  
  // Anthropic style inside OpenAI message?
  if (data?.choices?.[0]?.message?.content?.[0]?.text) {
     return data.choices[0].message.content[0].text
  }

  // 2. OpenAI legacy / completions-like:
  if (data?.choices?.[0]?.text) return data.choices[0].text
  
  // 3. Responses API-like:
  if (data?.output_text) return data.output_text
  
  // 4. Anthropic-like:
  if (Array.isArray(data?.content)) {
    const textParts = data.content
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
    if (textParts.length > 0) return textParts.join('')
  }
  if (data?.content && typeof data.content === 'string') return data.content
  
  // 5. Some APIs wrap everything in 'data'
  if (data?.data?.choices?.[0]?.message?.content) return data.data.choices[0].message.content
  if (data?.data?.content) return data.data.content

  // 6. Generic output field
  if (data?.output) return typeof data.output === 'string' ? data.output : JSON.stringify(data.output)
  if (data?.completion) return data.completion

  // Return empty string if not found, let caller handle error
  return ''
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
