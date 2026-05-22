const perspectives = ['不指定', '男生视角', '女生视角']

function PerspectiveSelector({ perspective, setPerspective }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        用户视角
      </label>
      <div className="flex gap-2">
        {perspectives.map((p) => (
          <button
            key={p}
            onClick={() => setPerspective(p)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              perspective === p
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PerspectiveSelector
