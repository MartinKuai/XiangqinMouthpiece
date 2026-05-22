import { readFileSync } from 'fs'
import { resolve } from 'path'

// 读取 .env.local 文件（本地开发用）
function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch (e) {
    // .env.local 文件不存在或读取失败，忽略
  }
}

loadEnvLocal()

const MAX_MESSAGE_LENGTH = 120

// 统一 JSON 响应 helper
function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}

const SYSTEM_PROMPT = `你是"相亲嘴替"，一个帮用户应对相亲尴尬场面的AI回复生成器。

你的任务是：根据用户输入的相亲对象发言，生成4种不同风格的回复。

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
- 不攻击性别、地域、年龄、长相、身材、学历、收入、职业、家庭背景
- 不输出PUA、吊着对方、情绪操控、欺骗式回复
- 不输出厌男、厌女或制造性别对立的内容
- 不生成性羞辱、荡妇羞辱、外貌羞辱、收入羞辱
- 如果用户输入包含明显辱骂、仇恨、性骚扰、暴力或极端内容，返回安全回应，不要升级冲突

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

export const handler = async (event) => {
  // 只接受 POST
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: '只接受POST请求' })
  }

  // 解析请求体
  let body
  try {
    body = JSON.parse(event.body)
  } catch (e) {
    return jsonResponse(400, { error: '请求格式错误' })
  }

  const { message, scenario, perspective, intensity, inviteCode: submittedInviteCode } = body
  // 兼容旧字段 accessCode
  const inviteCode = submittedInviteCode ?? body.accessCode ?? ''

  // 校验输入
  if (!message || message.trim() === '') {
    return jsonResponse(400, { error: '请输入相亲对象的发言' })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(400, { error: `输入不能超过${MAX_MESSAGE_LENGTH}字` })
  }

  // 校验邀请码（使用 trim 后的值比较，避免环境变量首尾空格问题）
  const requiredInviteCode = process.env.DEMO_INVITE_CODE?.trim()
  if (requiredInviteCode && inviteCode !== requiredInviteCode) {
    return jsonResponse(401, { error: '邀请码不正确，无法生成。' })
  }

  // 读取环境变量（支持 MODEL_* 新变量和 DEEPSEEK_* 旧变量 fallback）
  const apiKey = process.env.MODEL_API_KEY || process.env.DEEPSEEK_API_KEY
  const baseUrl = (process.env.MODEL_BASE_URL || process.env.DEEPSEEK_BASE_URL || '').replace(/\/+$/, '')
  const model = process.env.MODEL_NAME || process.env.DEEPSEEK_MODEL

  if (!apiKey) {
    return jsonResponse(500, { error: '服务端模型 API Key 未配置，请设置 MODEL_API_KEY。' })
  }

  if (!baseUrl) {
    return jsonResponse(500, { error: '服务端模型 Base URL 未配置，请设置 MODEL_BASE_URL。' })
  }

  if (!model) {
    return jsonResponse(500, { error: '服务端模型名称未配置，请设置 MODEL_NAME。' })
  }

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

  try {
    // 调用 OpenAI-compatible chat completions API
    const response = await fetch(`${baseUrl}/chat/completions`, {
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
        temperature: 0.9,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText)
      return jsonResponse(502, { error: 'AI服务暂时不可用，请稍后重试' })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return jsonResponse(502, { error: 'AI返回内容为空' })
    }

    // 解析 JSON
    let result
    try {
      // 尝试直接解析
      result = JSON.parse(content)
    } catch (e) {
      // 如果直接解析失败，尝试提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析AI返回内容')
      }
    }

    // 验证返回结构
    if (!result.cards || !Array.isArray(result.cards) || result.cards.length !== 4) {
      throw new Error('AI返回格式不符合要求')
    }

    return jsonResponse(200, result)
  } catch (error) {
    console.error('Generate error:', error)
    return jsonResponse(500, { error: '生成失败，请稍后重试' })
  }
}
