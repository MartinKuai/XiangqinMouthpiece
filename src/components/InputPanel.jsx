function InputPanel({ message, setMessage, onClear, error }) {
  return (
    <div className="relative">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='粘贴相亲对象刚说的那句话，比如："你工资多少？"'
        maxLength={120}
        className={`w-full h-32 p-4 pr-12 border-2 rounded-xl resize-none focus:outline-none focus:border-black transition-colors ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span className="text-sm text-gray-400">{message.length}/120</span>
        {message && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="清空"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default InputPanel
