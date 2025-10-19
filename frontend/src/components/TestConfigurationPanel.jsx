import FormFieldsContainer from './FormFieldsContainer';
import ButtonContainer from './ButtonContainer';

function TestConfigurationPanel({
  name,
  setName,
  description,
  setDescription,
  url,
  setUrl,
  isGenerating,
  onGenerate
}) {
  return (
    <div className="w-1/3 p-6 border-r border-gray-200 bg-white flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Configuration</h2>

      <FormFieldsContainer>
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter test name"
              className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Check that a user can reset their password"
              className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
              rows={3}
            />
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/login"
              className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>
      </FormFieldsContainer>

      <ButtonContainer>
        <button
          onClick={onGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isGenerating ? 'Regenerating...' : 'Regenerate Test Steps'}
        </button>
      </ButtonContainer>
    </div>
  );
}

export default TestConfigurationPanel;
