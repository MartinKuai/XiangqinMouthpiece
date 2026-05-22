import { scenarios } from '../data/scenarios.js'

function ScenarioSelector({ scenario, setScenario }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        场景标签
      </label>
      <select
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
      >
        <option value="">不指定场景</option>
        {scenarios.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ScenarioSelector
