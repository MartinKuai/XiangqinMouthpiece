const API_ENDPOINT = '/.netlify/functions/generate'

export async function generateReplies({ message, scenario, perspective, intensity, inviteCode }) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      scenario,
      perspective,
      intensity,
      inviteCode,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    // 抛出包含完整错误信息的对象
    const error = new Error(data.message || data.error || '生成失败，请稍后重试')
    error.code = data.code
    error.status = response.status
    throw error
  }

  return data
}
