export async function generateMockReply({ message, requestId, env }) {
  console.log('[generate] Using Mock API', { requestId })

  return {
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
    safetyNote: '（Mock模式提示）当前处于演示模式，未连接真实模型。'
  }
}
