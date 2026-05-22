const intensities = ['温和可发', '有刺但不脏', '抽象整活']

function IntensitySelector({ intensity, setIntensity }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        冒犯强度
      </label>
      <div className="flex gap-2">
        {intensities.map((i) => (
          <button
            key={i}
            onClick={() => setIntensity(i)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              intensity === i
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  )
}

export default IntensitySelector
