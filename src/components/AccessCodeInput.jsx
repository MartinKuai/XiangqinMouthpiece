function AccessCodeInput({ accessCode, setAccessCode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        访问码 <span className="text-gray-400">（可选）</span>
      </label>
      <input
        type="text"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        placeholder="如有访问码请填写"
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
      />
    </div>
  )
}

export default AccessCodeInput
