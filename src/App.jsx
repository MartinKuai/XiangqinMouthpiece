import { useState } from 'react'
import Hero from './components/Hero.jsx'
import InputPanel from './components/InputPanel.jsx'
import ScenarioSelector from './components/ScenarioSelector.jsx'
import PerspectiveSelector from './components/PerspectiveSelector.jsx'
import IntensitySelector from './components/IntensitySelector.jsx'
import ExampleGallery from './components/ExampleGallery.jsx'
import ReplyCard from './components/ReplyCard.jsx'
import SafetyNotice from './components/SafetyNotice.jsx'
import AccessCodeInput from './components/AccessCodeInput.jsx'
import { generateReplies } from './lib/apiClient.js'
import { validateInput } from './lib/validators.js'

function App() {
  const [message, setMessage] = useState('')
  const [scenario, setScenario] = useState('')
  const [perspective, setPerspective] = useState('不指定')
  const [intensity, setIntensity] = useState('有刺但不脏')
  const [accessCode, setAccessCode] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
    setLoading(true)
    setCooldown(true)

    try {
      const result = await generateReplies({
        message,
        scenario,
        perspective,
        intensity,
        accessCode,
      })
      setCards(result.cards)
    } catch (err) {
      setError(err.message || '生成失败，请稍后重试')
    } finally {
      setLoading(false)
      setTimeout(() => setCooldown(false), 5000)
    }
  }

  const handleClear = () => {
    setMessage('')
    setCards([])
    setError('')
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

          <AccessCodeInput accessCode={accessCode} setAccessCode={setAccessCode} />

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
