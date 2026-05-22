import { useState } from 'react'

function ReplyCard({ card }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.reply)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case '适合真发':
        return 'bg-green-100 text-green-800 border-green-300'
      case '看关系':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case '仅供整活':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm card-animate">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{card.type}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRiskColor(card.riskLevel)}`}>
            {card.riskLevel}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <p className="text-gray-800 leading-relaxed">{card.reply}</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="px-2 py-0.5 bg-gray-100 rounded">{card.styleTag}</span>
        <span>·</span>
        <span>{card.sceneNote}</span>
      </div>
    </div>
  )
}

export default ReplyCard
