import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, fetchTestById, updateTestOnSuccess, updateTestOnFailure } from '../supabase';
import { executeTest } from '../backendApi/generateTest';
import { useTestGeneration } from '../hooks/useTestGeneration';
import TestHeader from '../components/TestHeader';
import TestConfigurationPanel from '../components/TestConfigurationPanel';
import TestStepsPanel from '../components/TestStepsPanel';
import TestResultsPanel from '../components/TestResultsPanel';
import JiraIssueModal from '../components/JiraIssueModal';

function TestCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id; // If there's an ID in the URL, we're in edit mode
  const { generate, isGenerating } = useTestGeneration();

  // State management
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [steps, setSteps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [stepStatuses, setStepStatuses] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showRunButton, setShowRunButton] = useState(false);
  const [showJiraModal, setShowJiraModal] = useState(false);

  // Helper function to calculate step statuses based on test results
  const calculateStepStatuses = (success, failedStepIndex, steps) => {
    const statuses = {};

    if (success) {
      // All steps passed
      steps.forEach(step => {
        statuses[step.id] = 'passed';
      });
    } else {
      // Test failed
      steps.forEach(step => {
        if (failedStepIndex !== null && failedStepIndex !== undefined) {
          if (step.id - 1 < failedStepIndex) {
            statuses[step.id] = 'passed';
          } else if (step.id - 1 === failedStepIndex) {
            statuses[step.id] = 'failed';
          } else {
            statuses[step.id] = 'pending';
          }
        }
      });
    }

    return statuses;
  };

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

            // If test has been run before, display the last run results
            if (data.last_run_at) {
              const statuses = calculateStepStatuses(
                data.last_passed,
                data.last_error_index,
                existingSteps
              );
              setStepStatuses(statuses);

              if (data.last_passed) {
                setTestResult({
                  passed: true,
                  message: 'All test steps passed successfully!',
                  timestamp: new Date(data.last_run_at).toLocaleTimeString()
                });
              } else {
                setTestResult({
                  passed: false,
                  failedStep: data.last_error_index !== null ? data.last_error_index + 1 : undefined,
                  errorMessage: data.last_error_step || 'Test execution failed',
                  message: data.last_error_message || `Test failed${data.last_error_index !== null ? ` at step ${data.last_error_index + 1}` : ''}`,
                  timestamp: new Date(data.last_run_at).toLocaleTimeString()
                });
              }

              setShowResult(true);
            }
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

  const handleGenerate = async () => {
    if (!name.trim() || !url.trim() || !description.trim()) {
      alert('Please fill in all fields (name, URL, and description)');
      return;
    }

    if (!id) {
      alert('Test must be saved before regenerating steps');
      return;
    }

    // Clear existing UI state
    setSteps([]);
    setShowRunButton(false);
    setTestResult(null);
    setStepStatuses({});
    setShowResult(false);

    try {
      const response = await generate({
        testId: id,
        url: url.trim(),
        description: description.trim(),
      });

      // Transform test_plan array into step objects
      const regeneratedSteps = response.testPlan.map((stepText, index) => ({
        id: index + 1,
        type: 'step',
        text: stepText
      }));

      setSteps(regeneratedSteps);
      setShowRunButton(true);
    } catch (error) {
      console.error('Error regenerating test:', error);
      alert('Failed to regenerate test steps. Please try again.');
    }
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
        const statuses = calculateStepStatuses(true, null, steps);
        setStepStatuses(statuses);

        setTestResult({
          passed: true,
          message: response.output || 'All test steps passed successfully!',
          timestamp: new Date().toLocaleTimeString()
        });

        await updateTestOnSuccess(id);
      } else {
        // Test failed
        const failedStepIndex = response.failing_step_index;
        const statuses = calculateStepStatuses(false, failedStepIndex, steps);
        setStepStatuses(statuses);

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
          isGenerating={isGenerating}
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