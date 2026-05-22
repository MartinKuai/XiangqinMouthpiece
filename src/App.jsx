import { useState } from 'react'
import Hero from './components/Hero.jsx'
import InputPanel from './components/InputPanel.jsx'
import ScenarioSelector from './components/ScenarioSelector.jsx'
import PerspectiveSelector from './components/PerspectiveSelector.jsx'
import IntensitySelector from './components/IntensitySelector.jsx'
import ExampleGallery from './components/ExampleGallery.jsx'
import ReplyCard from './components/ReplyCard.jsx'
import SafetyNotice from './components/SafetyNotice.jsx'
import InviteCodeInput from './components/InviteCodeInput.jsx'
import { generateReplies } from './lib/apiClient.js'
import { validateInput } from './lib/validators.js'

function App() {
  const [message, setMessage] = useState('')
  const [scenario, setScenario] = useState('')
  const [perspective, setPerspective] = useState('不指定')
  const [intensity, setIntensity] = useState('有刺但不脏')
  const [inviteCode, setInviteCode] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fallbackMsg, setFallbackMsg] = useState('')
  const [cooldown, setCooldown] = useState(false)

  const handleExampleClick = (example) => {
    setMessage(example)
  }

  const handleGenerate = async () => {
    const validationError = validateInput(message)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setFallbackMsg('')
    setLoading(true)
    setCooldown(true)

    try {
      const result = await generateReplies({
        message,
        scenario,
        perspective,
        intensity,
        inviteCode,
      })
      setCards(result.cards)
      // 如果是安全兜底，显示轻提示（不是红色错误）
      if (result.fallback && result.message) {
        setFallbackMsg(result.message)
      }
    } catch (err) {
      // 根据错误类型展示不同提示
      if (err.status === 401) {
        setError('邀请码不正确，无法生成。')
      } else if (err.code === 'CONTENT_SAFETY_BLOCKED' || err.code === 'MODEL_REFUSED') {
        setError(err.message || '这句话可能触发内容安全策略，建议把原话改成场景描述后再试。')
      } else if (err.code === 'MODEL_ERROR' || err.code === 'EMPTY_RESPONSE') {
        setError(err.message || '模型暂时无法处理这类输入，建议换一种描述方式再试。')
      } else if (err.code === 'RATE_LIMITED') {
        setError('请求过于频繁，请稍后再试。')
      } else if (err.code === 'SERVICE_CONFIG_ERROR') {
        setError('服务暂时不可用，请稍后再试。')
      } else {
        setError('服务暂时不可用，请稍后再试。')
      }
    } finally {
      setLoading(false)
      setTimeout(() => setCooldown(false), 5000)
    }
  }

  const handleClear = () => {
    setMessage('')
    setCards([])
    setError('')
    setFallbackMsg('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Hero />

        <div className="mt-8 space-y-6">
          <ExampleGallery onExampleClick={handleExampleClick} />

          <InputPanel
            message={message}
            setMessage={setMessage}
            onClear={handleClear}
            error={error}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScenarioSelector scenario={scenario} setScenario={setScenario} />
            <PerspectiveSelector perspective={perspective} setPerspective={setPerspective} />
            <IntensitySelector intensity={intensity} setIntensity={setIntensity} />
          </div>

          <InviteCodeInput inviteCode={inviteCode} setInviteCode={setInviteCode} />

          <button
            onClick={handleGenerate}
            disabled={loading || cooldown}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              loading || cooldown
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
            }`}
          >
            {loading ? '正在生成...' : cooldown ? '请稍候...' : '救救这场相亲'}
          </button>
        </div>

        {cards.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">生成结果</h2>
            {fallbackMsg && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                {fallbackMsg}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card, index) => (
                <ReplyCard key={index} card={card} />
              ))}
            </div>
          </div>
        )}

        <SafetyNotice />

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>相亲嘴替 - AI整活回复生成器</p>
          <p className="mt-1">本工具偏娱乐表达，不构成真实恋爱建议或心理咨询</p>
        </footer>
      </div>
    </div>
  )
}

export default App
