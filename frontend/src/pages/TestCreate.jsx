import { useState } from 'react';
import StepBlock from '../components/StepBlock';

function TestCreate() {
  // State management
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [steps, setSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Mock data for demonstration
  const mockSteps = [
    { id: 1, type: 'navigate', text: 'Navigate to /login page' },
    { id: 2, type: 'input', text: 'Enter "user@email.com" in email field' },
    { id: 3, type: 'input', text: 'Enter "password123" in password field' },
    { id: 4, type: 'click', text: 'Click "Login" button' },
    { id: 5, type: 'verify', text: 'Verify user is redirected to dashboard' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setSteps(mockSteps);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRunTest = () => {
    setIsRunning(true);
    setTestResult(null);
    // Simulate test execution
    setTimeout(() => {
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      setTestResult({
        passed,
        message: passed ? 'All test steps passed successfully!' : 'Test failed at step 3: Password field not found',
        timestamp: new Date().toLocaleTimeString()
      });
      setIsRunning(false);
    }, 2000);
  };

  const handleEditStep = (stepId) => {
    console.log('Edit step:', stepId);
    // TODO: Implement edit functionality
  };

  const handleDeleteStep = (stepId) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const handleReportToJira = () => {
    console.log('Reporting to Jira...');
    // TODO: Implement Jira reporting
    alert('Jira ticket created successfully!');
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Left Panel (40%) */}
      <div className="w-2/5 p-6 border-r border-gray-200 bg-gray-50">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Check that a user can reset their password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate Test Steps'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (60%) */}
      <div className="w-3/5 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Generated Steps Area */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Test Steps</h2>
            
            {steps.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-lg">Generate test steps to see them here</p>
                  <p className="text-sm mt-2">Enter a test description and click "Generate Test Steps"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step) => (
                  <StepBlock
                    key={step.id}
                    step={step}
                    onEdit={handleEditStep}
                    onDelete={handleDeleteStep}
                  />
                ))}
                
                <button
                  onClick={handleRunTest}
                  disabled={isRunning || steps.length === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-4"
                >
                  {isRunning ? 'Running Test...' : 'Run Test'}
                </button>
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Result</h3>
              
              <div className={`p-4 rounded-lg ${testResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{testResult.passed ? '✅' : '❌'}</span>
                  <span className={`font-medium ${testResult.passed ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.passed ? 'Test Passed' : 'Test Failed'}
                  </span>
                </div>
                <p className={`text-sm ${testResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Completed at {testResult.timestamp}
                </p>
              </div>

              {!testResult.passed && (
                <button
                  onClick={handleReportToJira}
                  className="mt-4 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  🎫 Report to Jira
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestCreate;
