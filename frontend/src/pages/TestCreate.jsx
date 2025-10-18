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
      if (passed) {
        setTestResult({
          passed: true,
          message: 'All test steps passed successfully!',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setTestResult({
          passed: false,
          failedStep: 3,
          screenshot: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Test+Failed+Screenshot',
          errorMessage: 'Password field not found - element selector changed',
          message: 'Test failed at step 3: Password field not found',
          timestamp: new Date().toLocaleTimeString()
        });
      }
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
    <div className="flex h-screen w-screen bg-gray-900">
      {/* Left Panel (40%) */}
      <div className="w-2/5 p-6 border-r border-gray-700 bg-gray-800">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Test Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Check that a user can reset their password"
                  className="w-full p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  className="w-full p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Test Steps'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (60%) */}
      <div className="w-3/5 p-6 overflow-y-auto bg-gray-900">
        <div className="flex gap-6 h-full">
          {/* Left: Step Blocks Column */}
          <div className="w-1/2">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Test Steps</h2>
            
            {steps.length === 0 ? (
              <div className="text-gray-400 text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-lg">Generate test steps to see them here</p>
                <p className="text-sm mt-2">Enter a test description and click "Generate Test Steps"</p>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg mt-4 transition-all duration-200 shadow-lg"
                >
                  {isRunning ? 'Running Test...' : 'Run Test'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Screenshot/Result Column */}
          <div className="w-1/2">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Test Result</h2>
            
            {!testResult && !isRunning && (
              <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400 border-2 border-dashed border-gray-600">
                <div className="text-4xl mb-4">📸</div>
                <p>Screenshot will appear here if test fails</p>
              </div>
            )}
            
            {isRunning && (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-300">Running test...</p>
              </div>
            )}
            
            {testResult && !testResult.passed && (
              <div className="bg-gray-800 rounded-lg border border-red-600 p-4">
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <span className="text-2xl">❌</span>
                  <span className="font-semibold">Test Failed at Step {testResult.failedStep}</span>
                </div>
                <img 
                  src={testResult.screenshot} 
                  alt="Failure screenshot"
                  className="w-full rounded border border-gray-600 mb-3"
                />
                <p className="text-sm text-gray-300 mb-4">{testResult.errorMessage}</p>
                <button
                  onClick={handleReportToJira}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  🎫 Report to Jira
                </button>
              </div>
            )}
            
            {testResult && testResult.passed && (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-green-600">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-green-400 font-semibold text-lg">All tests passed!</p>
                <p className="text-gray-400 text-sm mt-2">Completed at {testResult.timestamp}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestCreate;
