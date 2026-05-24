import {
  SYSTEM_PROMPT,
  extractModelContent,
  buildDiagnosticInfo,
  parseModelJson,
  normalizeCards
} from '../normalizeResponse.js'

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

export async function generateMimoReply({ message, scenario, perspective, intensity, env, requestId }) {
  const apiKey = env.MODEL_API_KEY
  const baseUrl = (env.MODEL_BASE_URL || '').replace(/\/+$/, '')
  const modelName = env.MODEL_NAME

  // 1. 如果真实模型环境变量不完整，由于当前处于 MiMo provider 下，需明确返回错误对象
  if (!apiKey || !baseUrl || !modelName) {
    console.error('[mimo] Missing configuration', { apiKey: !!apiKey, baseUrl: !!baseUrl, modelName: !!modelName })
    throw {
      isExpected: true,
      status: 500,
      body: {
        error: '服务端模型 API 配置不完整，请在 Cloudflare Pages 检查环境变量。',
        code: 'MISSING_MIMO_ENV'
      }
    }
  }

  const temperature = clampTemperature(env.MODEL_TEMPERATURE)
  const maxTokens = clampMaxTokens(env.MODEL_MAX_TOKENS)

  let userMessage = `【用户输入】\n${message}`
  if (scenario) userMessage += `\n\n【场景】\n${scenario}`
  if (perspective && perspective !== '不指定') userMessage += `\n\n【用户视角】\n${perspective}`
  if (intensity) userMessage += `\n\n【冒犯强度】\n${intensity}`

  const endpoint = `${baseUrl}/chat/completions`

  console.log('[mimo] request', {
    requestId,
    model: modelName,
    temperature,
    maxTokens,
  })

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
    console.error('[mimo] fetch error', { requestId, message: fetchError.message })
    throw {
      isExpected: true,
      status: 502,
      body: {
        error: '无法连接模型服务。',
        code: 'MIMO_FETCH_ERROR',
        detail: fetchError.message,
      }
    }
  }

  const upstreamText = await upstreamResponse.text()

  if (!upstreamResponse.ok) {
    console.error('[mimo] upstream error', { requestId, status: upstreamResponse.status, model: modelName })
    throw {
      isExpected: true,
      status: 502,
      body: {
        error: '模型服务返回错误。',
        code: 'MIMO_HTTP_ERROR',
        detail: `status: ${upstreamResponse.status}`,
      }
    }
  }

  if (!upstreamText || upstreamText.trim() === '') {
    throw {
      isExpected: true,
      status: 502,
      body: {
        error: '模型服务返回空响应。',
        code: 'MIMO_EMPTY_UPSTREAM_TEXT',
      }
    }
  }

  let upstreamData
  try {
    upstreamData = JSON.parse(upstreamText)
  } catch (e) {
    throw {
      isExpected: true,
      status: 502,
      body: {
        error: '模型服务响应不是有效 JSON。',
        code: 'MIMO_UPSTREAM_INVALID_JSON',
      }
    }
  }

  const content = extractModelContent(upstreamData)

  const debug = env.DEBUG_RESPONSE === 'true'

  if (!content) {
    const diag = buildDiagnosticInfo(upstreamData)
    const body = {
      error: '模型服务未返回有效内容。',
      code: 'MIMO_EMPTY_RESPONSE',
    }
    if (debug) {
      body.debug = { model: modelName, upstreamStatus: upstreamResponse.status, ...diag }
    }
    throw { isExpected: true, status: 502, body }
  }

  const parseResult = parseModelJson(content)

  if (parseResult.error) {
    const body = {
      error: '模型返回内容无法解析。',
      code: 'MODEL_OUTPUT_INVALID_JSON',
    }
    if (debug) {
      body.debug = { model: modelName, upstreamStatus: upstreamResponse.status, contentPreview: content.slice(0, 300) }
    }
    throw { isExpected: true, status: 500, body }
  }

  const { cards, warning } = normalizeCards(parseResult.data)

  if (cards.length === 0) {
    const body = {
      error: '模型返回内容不符合预期结构。',
      code: 'MODEL_OUTPUT_INVALID_SCHEMA',
    }
    if (debug) {
      body.debug = { model: modelName, upstreamStatus: upstreamResponse.status, contentPreview: content.slice(0, 300) }
    }
    throw { isExpected: true, status: 500, body }
  }

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

  console.log('[mimo] success', { requestId, model: modelName, cardsCount: cards.length })
  return result
}
