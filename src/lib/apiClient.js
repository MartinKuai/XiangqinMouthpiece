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
    throw new Error(data.error || '生成失败，请稍后重试')
  }

  return data
}
