import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import TestHeader from '../components/TestHeader';
import TestConfigurationPanel from '../components/TestConfigurationPanel';
import TestStepsPanel from '../components/TestStepsPanel';
import TestResultsPanel from '../components/TestResultsPanel';

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
    <div className="flex flex-col h-screen w-screen bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
      <TestHeader
        onBack={() => navigate('/')}
        isEditMode={isEditMode}
        onSave={handleSaveTest}
      />

      <div className="flex-1 flex">
        <TestConfigurationPanel
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          url={url}
          setUrl={setUrl}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        <TestStepsPanel
          steps={steps}
          stepStatuses={stepStatuses}
          showRunButton={showRunButton}
          isRunning={isRunning}
          onEditStep={handleEditStep}
          onDeleteStep={handleDeleteStep}
          onRunTest={handleRunTest}
        />

        <TestResultsPanel
          testResult={testResult}
          isRunning={isRunning}
          showResult={showResult}
          onReportToJira={handleReportToJira}
        />
      </div>
    </div>
  );
}

export default TestCreate;