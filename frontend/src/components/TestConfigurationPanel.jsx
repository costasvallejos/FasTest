function TestConfigurationPanel({
  name,
  description,
  url,
  isGenerating,
  onGenerate
}) {
  return (
    <div className="w-1/3 p-6 border-r border-gray-200 bg-white">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Configuration</h2>

      <div className="space-y-4">
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Name
          </label>
          <div className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
            {name || 'No test name'}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Description
          </label>
          <div className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 min-h-[80px]">
            {description || 'No description'}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page URL
          </label>
          <div className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
            {url || 'No URL'}
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isGenerating ? 'Regenerating...' : 'Regenerate Test Steps'}
        </button>
      </div>
    </div>
  );
}

export default TestConfigurationPanel;
