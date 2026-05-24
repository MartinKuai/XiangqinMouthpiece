export async function generateDeepseekReply({ message, env, requestId }) {
  console.log('[deepseek] Not implemented yet', { requestId })
  
  throw {
    isExpected: true,
    status: 501,
    body: {
      error: 'DeepSeek provider 暂未接入。',
      code: 'PROVIDER_NOT_IMPLEMENTED',
    }
  }
}
