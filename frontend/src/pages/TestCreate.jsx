import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import StepBlock from '../components/StepBlock';

function TestCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const testData = location.state?.testData;
  const isEditMode = !!id; // If there's an ID in the URL, we're in edit mode
  
  // State management
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [steps, setSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [stepStatuses, setStepStatuses] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showRunButton, setShowRunButton] = useState(false);

  // Autofill form when editing an existing test
  useEffect(() => {
    if (testData && isEditMode) {
      setName(testData.name || '');
      setDescription(testData.description || '');
      setUrl(testData.url || testData.target_url || '');
      
      // Load existing test steps from database
      if (testData.plan && Array.isArray(testData.plan)) {
        const existingSteps = testData.plan.map((stepText, index) => ({
          id: index + 1,
          type: 'step',
          text: stepText
        }));
        setSteps(existingSteps);
        setShowRunButton(true); // Show run button since steps already exist
      }
    }
  }, [testData, isEditMode]);

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
    setSteps([]); // Clear existing steps
    setShowRunButton(false);
    setTestResult(null);
    setStepStatuses({});
    setShowResult(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      
      // Animate steps appearing one by one with smooth cascading effect
      const mockSteps = [
        { id: 1, type: 'navigate', text: 'Navigate to /login page' },
        { id: 2, type: 'input', text: 'Enter "user@email.com" in email field' },
        { id: 3, type: 'input', text: 'Enter "password123" in password field' },
        { id: 4, type: 'click', text: 'Click "Login" button' },
        { id: 5, type: 'verify', text: 'Verify user is redirected to dashboard' }
      ];
      
      // Add steps one by one with smooth timing
      mockSteps.forEach((step, index) => {
        setTimeout(() => {
          setSteps(prev => [...prev, step]);
        }, index * 150); // 150ms delay for smoother cascading
      });
      
      // Show Run Test button after all steps are loaded with a slight delay
      setTimeout(() => {
        setShowRunButton(true);
      }, mockSteps.length * 150 + 100);
    }, 1500);
  };

  const handleRunTest = () => {
    setIsRunning(true);
    setTestResult(null);
    setStepStatuses({}); // Reset step statuses
    setShowResult(false); // Hide result initially
    
    // Simulate test execution
    setTimeout(() => {
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      if (passed) {
        // All steps passed
        const allPassed = {};
        steps.forEach(step => {
          allPassed[step.id] = 'passed';
        });
        setStepStatuses(allPassed);
        
        setTestResult({
          passed: true,
          message: 'All test steps passed successfully!',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        // Some steps failed - stop at the failed step
        const stepStatuses = {};
        const failedStep = 3; // Mock failed step
        steps.forEach(step => {
          if (step.id < failedStep) {
            stepStatuses[step.id] = 'passed';
          } else if (step.id === failedStep) {
            stepStatuses[step.id] = 'failed';
          } else {
            stepStatuses[step.id] = 'pending';
          }
        });
        setStepStatuses(stepStatuses);
        
        setTestResult({
          passed: false,
          failedStep: failedStep,
          screenshot: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Test+Failed+Screenshot',
          errorMessage: 'Password field not found - element selector changed',
          message: 'Test failed at step 3: Password field not found',
          timestamp: new Date().toLocaleTimeString()
        });
      }
      setIsRunning(false);
      // Show result with a slight delay for smoother transition
      setTimeout(() => setShowResult(true), 100);
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

  const handleSaveTest = async () => {
    if (!isEditMode || !id) return;
    
    try {
      const stepTexts = steps.map(step => step.text);
      
      const { error } = await supabase
        .from('tests')
        .update({
          name: name,
          description: description,
          url: url,
          plan: stepTexts
        })
        .eq('id', id);

      if (error) throw error;
      
      alert('Test updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating test:', error);
      alert('Failed to update test. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Test Suite
        </button>
        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm">
            {isEditMode ? 'Edit Test Configuration' : 'Test Creation'}
          </div>
          {isEditMode && (
            <button
              onClick={handleSaveTest}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Test Configuration Panel (33.33%) */}
        <div className="w-1/3 p-6 border-r border-gray-700 bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Test Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter test name"
                className="w-full p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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

        {/* Test Steps Panel (33.33%) */}
        <div className="w-1/3 p-6 border-r border-gray-700 bg-gray-900 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Test Steps</h2>
              
          {steps.length === 0 ? (
            <div className="space-y-3">
              {/* Empty placeholder step blocks - enough to fill the height */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-200">1</span>
                  </div>
                  <p className="flex-1 text-gray-200 font-medium">Step will appear here...</p>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-200">2</span>
                  </div>
                  <p className="flex-1 text-gray-200 font-medium">Step will appear here...</p>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-200">3</span>
                  </div>
                  <p className="flex-1 text-gray-200 font-medium">Step will appear here...</p>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-200">4</span>
                  </div>
                  <p className="flex-1 text-gray-200 font-medium">Step will appear here...</p>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-200">5</span>
                  </div>
                  <p className="flex-1 text-gray-200 font-medium">Step will appear here...</p>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-gray-400 text-sm">Generate test steps to see them here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step) => (
                <StepBlock
                  key={step.id}
                  step={step}
                  status={stepStatuses[step.id] || 'pending'}
                  onEdit={handleEditStep}
                  onDelete={handleDeleteStep}
                />
              ))}
              
              {showRunButton && (
                <div 
                  style={{
                    opacity: 0,
                    transform: 'translateY(-10px)',
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <button
                    onClick={handleRunTest}
                    disabled={isRunning || steps.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg mt-4 transition-all duration-300 shadow-lg"
                  >
                    {isRunning ? 'Running Test...' : 'Run Test'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Results Panel (33.33%) */}
        <div className="w-1/3 p-6 bg-gray-900 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Test Result</h2>
              
          {!testResult && !isRunning && (
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-8 shadow-sm opacity-50 flex flex-col items-center justify-center h-[500px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
                <p className="text-gray-200 font-medium text-lg">Screenshot will appear here</p>
              </div>
              <p className="text-gray-400 text-sm text-center">Test results and screenshots will show in this area</p>
            </div>
          )}
          
          {isRunning && (
            <div 
              className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700 transition-all duration-500 ease-in-out opacity-100 h-[500px] flex flex-col items-center justify-center"
              style={{
                opacity: 0,
                transform: 'translateY(-10px)',
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-gray-300 text-lg font-medium">Running test...</p>
                <p className="text-gray-400 text-sm">Executing Playwright tests</p>
              </div>
            </div>
          )}
          
          {testResult && !testResult.passed && showResult && (
            <>
              <div 
                className="bg-gray-800 rounded-lg border border-red-600 p-4 transition-all duration-700 ease-out h-[500px] flex flex-col"
                style={{
                  opacity: 0,
                  transform: 'translateY(-10px)',
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <span className="text-2xl">❌</span>
                  <span className="font-semibold">Test Failed at Step {testResult.failedStep}</span>
                </div>
                <img 
                  src={testResult.screenshot} 
                  alt="Failure screenshot"
                  className="w-full rounded border border-gray-600 mb-3 flex-1 object-cover"
                />
                <p className="text-sm text-gray-300 mb-4">{testResult.errorMessage}</p>
              </div>
              
              <div 
                className="mt-4"
                style={{
                  opacity: 0,
                  transform: 'translateY(-10px)',
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  animationDelay: '0.2s'
                }}
              >
                <button
                  onClick={handleReportToJira}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  🎫 Report to Jira
                </button>
              </div>
            </>
          )}
          
          {testResult && testResult.passed && showResult && (
            <div 
              className="bg-gray-800 rounded-lg p-8 text-center border border-green-600 transition-all duration-700 ease-out h-[500px] flex flex-col items-center justify-center"
              style={{
                opacity: 0,
                transform: 'translateY(-10px)',
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 
                  className="w-16 h-16 text-green-400"
                  style={{
                    transform: showResult ? 'scale(1)' : 'scale(0.8)',
                    transition: 'transform 0.5s ease-out 0.2s'
                  }}
                />
                <p className="text-green-400 font-semibold text-xl">All tests passed!</p>
                <p className="text-gray-400 text-sm">Completed at {testResult.timestamp}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestCreate;