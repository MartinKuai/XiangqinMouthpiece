function Hero() {
  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-black tracking-tight">
        相亲嘴替
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600">
        输入一句相亲对象的离谱发言，让AI替你体面发疯。
      </p>
      <p className="mt-2 text-sm text-gray-500">
        不骂人，不破防，但也不惯着。
      </p>
      <div className="mt-4 inline-block px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-sm">
        ⚠️ 本工具偏娱乐表达，不构成真实恋爱建议或心理咨询
      </div>
    </div>
  )
}

export default Hero
