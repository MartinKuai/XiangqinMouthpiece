import { examples } from '../data/examples.js'

function ExampleGallery({ onExampleClick }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">试试这些：</p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => onExampleClick(example)}
            className="px-3 py-1.5 text-sm bg-white border-2 border-gray-200 rounded-full hover:border-black hover:bg-gray-50 transition-all"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExampleGallery
