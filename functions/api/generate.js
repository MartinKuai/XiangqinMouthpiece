import { generateMockReply } from '../_lib/providers/mock.js'
import { generateMimoReply } from '../_lib/providers/mimo.js'
import { generateDeepseekReply } from '../_lib/providers/deepseek.js'

const MAX_MESSAGE_LENGTH = 120

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const requestId = Math.random().toString(36).slice(2, 10)
  const debug = env.DEBUG_RESPONSE === 'true'

  try {
    let body
    try {
      body = await request.json()
    } catch (e) {
      return jsonResponse({ error: '请求格式错误', code: 'INVALID_REQUEST_BODY' }, 400)
    }

    const { message, scenario, perspective, intensity } = body
    const submittedCode = body.inviteCode ?? body.accessCode ?? ''

    if (!message || message.trim() === '') {
      return jsonResponse({ error: '请输入相亲对象的发言', code: 'EMPTY_MESSAGE' }, 400)
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: `输入不能超过${MAX_MESSAGE_LENGTH}字`, code: 'MESSAGE_TOO_LONG' }, 400)
    }

    const expectedCode = (env.DEMO_ACCESS_CODE || env.DEMO_INVITE_CODE || '').trim()
    if (expectedCode && submittedCode !== expectedCode) {
      return jsonResponse({ error: '访问码不正确，无法生成。', code: 'INVALID_ACCESS_CODE' }, 401)
    }

    // Determine Provider
    const providerConfig = (env.MODEL_PROVIDER || '').toLowerCase()
    let provider = providerConfig

    if (env.MOCK_API === 'true' || !provider) {
      provider = 'mock'
    }

    const params = { message, scenario, perspective, intensity, env, requestId }

    let result
    try {
      if (provider === 'mock') {
        result = await generateMockReply(params)
      } else if (provider.trim() === 'mimo') {
        provider = 'mimo' // Fix any trailing spaces
        result = await generateMimoReply(params)
      } else if (provider.trim() === 'deepseek') {
        provider = 'deepseek'
        result = await generateDeepseekReply(params)
      } else {
        console.warn(`[generate] Unknown provider: "${provider}", falling back to mock`)
        result = await generateMockReply(params)
        result.safetyNote = `[配置错误] 未知 Provider: "${provider}"，已回退到 Mock。`
      }
    } catch (e) {
      console.error(`[generate] Provider error (${provider}):`, e)
      
      // Fallback to Mock gracefully
      result = await generateMockReply(params)
      
      const errCode = e.body?.code || e.code || 'UNKNOWN_ERR'
      const errMsg = e.body?.error || e.message || String(e)
      // Add friendly user note WITH debug info since user is troubleshooting
      result.safetyNote = `请求 ${provider} 失败，已切换为演示回复。(Debug: ${errCode} - ${errMsg})`
      
      // Add debug info if enabled
      if (debug) {
        result.debug = {
          failedProvider: provider,
          errorStatus: e.status || 500,
          errorCode: e.body?.code || 'UNKNOWN_ERROR',
          errorMessage: e.body?.error || e.message || String(e)
        }
      }
    }

    return jsonResponse(result)

  } catch (error) {
    console.error('UNHANDLED_GENERATE_ERROR', { name: error?.name, message: error?.message })
    
    // Ultimate fallback
    return jsonResponse({
      cards: [
        {
          type: '系统提示',
          reply: '系统开小差了，请稍后再试。',
          styleTag: '异常兜底',
          sceneNote: '应对极端崩溃',
          riskLevel: '安全'
        }
      ],
      safetyNote: '服务异常，目前显示的是兜底回复。',
      error: '服务端生成接口异常，请稍后重试。',
      code: 'UNHANDLED_FUNCTION_ERROR',
      ...(debug && { detail: error?.message || 'Unknown error' })
    }, 200) // Return 200 so UI can still show the cards
  }
}
