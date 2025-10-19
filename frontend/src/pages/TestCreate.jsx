import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, fetchTestById, updateTestOnSuccess, updateTestOnFailure } from '../supabase';
import { executeTest } from '../backendApi/generateTest';
import TestHeader from '../components/TestHeader';
import TestConfigurationPanel from '../components/TestConfigurationPanel';
import TestStepsPanel from '../components/TestStepsPanel';
import TestResultsPanel from '../components/TestResultsPanel';
import JiraIssueModal from '../components/JiraIssueModal';

function TestCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [showJiraModal, setShowJiraModal] = useState(false);

  // Fetch test data when editing an existing test
  useEffect(() => {
    async function loadTestData() {
      if (isEditMode && id) {
        try {
          const data = await fetchTestById(id);
          setName(data.name || '');
          setDescription(data.description || '');
          setUrl(data.url || data.target_url || '');

          // Load existing test steps from database
          if (data.plan && Array.isArray(data.plan)) {
            const existingSteps = data.plan.map((stepText, index) => ({
              id: index + 1,
              type: 'step',
              text: stepText
            }));
            setSteps(existingSteps);
            setShowRunButton(true);
          }
        } catch (error) {
          console.error('Error loading test:', error);
          alert('Failed to load test data. Please try again.');
          navigate('/');
        }
      }
    }

    loadTestData();
  }, [id, isEditMode, navigate]);

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

  const handleRunTest = async () => {
    if (!id) {
      alert('Test must be saved before running');
      return;
    }

    setIsRunning(true);
    setTestResult(null);
    setStepStatuses({});
    setShowResult(false);

    try {
      const response = await executeTest({ test_id: id });

      if (response.success) {
        // All steps passed
        const allPassed = {};
        steps.forEach(step => {
          allPassed[step.id] = 'passed';
        });
        setStepStatuses(allPassed);

        setTestResult({
          passed: true,
          message: response.output || 'All test steps passed successfully!',
          timestamp: new Date().toLocaleTimeString()
        });

        await updateTestOnSuccess(id);
      } else {
        // Test failed
        const stepStatuses = {};
        const failedStepIndex = response.failing_step_index;

        steps.forEach(step => {
          if (failedStepIndex !== null && failedStepIndex !== undefined) {
            if (step.id - 1 < failedStepIndex) {
              stepStatuses[step.id] = 'passed';
            } else if (step.id - 1 === failedStepIndex) {
              stepStatuses[step.id] = 'failed';
            } else {
              stepStatuses[step.id] = 'pending';
            }
          }
        });
        setStepStatuses(stepStatuses);

        setTestResult({
          passed: false,
          failedStep: failedStepIndex !== null ? failedStepIndex + 1 : undefined,
          errorMessage: response.failing_step || 'Test execution failed',
          message: response.output || `Test failed${failedStepIndex !== null ? ` at step ${failedStepIndex + 1}` : ''}`,
          timestamp: new Date().toLocaleTimeString()
        });

        // Update database with failure information
        await updateTestOnFailure(id, {
          errorMessage: response.output,
          errorStep: response.failing_step,
          errorIndex: response.failing_step_index
        });

        // Show Jira modal when test fails
        setShowJiraModal(true);
      }

      setIsRunning(false);
      setTimeout(() => setShowResult(true), 100);
    } catch (error) {
      console.error('Error executing test:', error);
      setIsRunning(false);
      alert('Failed to execute test. Please try again.');
    }
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

  const handleJiraModalClose = () => {
    setShowJiraModal(false);
  };

  const handleJiraModalConfirm = (issueData) => {
    console.log('Creating Jira issue:', issueData);
    // TODO: Implement actual Jira API call
    alert(`Jira issue created: ${issueData.name}`);
    setShowJiraModal(false);
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

      <JiraIssueModal
        isOpen={showJiraModal}
        onClose={handleJiraModalClose}
        onConfirm={handleJiraModalConfirm}
        testName={name}
        testDescription={description}
      />
      {showJiraModal && console.log('Modal props:', { showJiraModal, name, description })}
    </div>
  );
}

export default TestCreate;