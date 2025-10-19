import { useState, useEffect } from 'react';
import { createJiraIssue } from '../backendApi/createJiraIssue';
import { X } from 'lucide-react';

function JiraIssueModal({ isOpen, onClose, onConfirm, testName, testDescription, testUrl, testSteps }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update form fields when props change
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened with:', { testName, testDescription, testUrl, testSteps });

      // Format the issue name
      const formattedName = testName ? `E2E Test Fail: ${testName}` : '';

      // Format the description with test details
      let formattedDescription = '';

      if (testName) {
        formattedDescription += `The E2E test "${testName}" is failing.\n\n`;
      }

      if (testUrl) {
        formattedDescription += `URL: ${testUrl}\n\n`;
      }

      if (testDescription) {
        formattedDescription += `Original Description:\n${testDescription}\n\n`;
      }

      if (testSteps && testSteps.length > 0) {
        formattedDescription += `Reproduction Steps:\n`;
        testSteps.forEach((step, index) => {
          formattedDescription += `${index + 1}. ${step.text}\n`;
        });
      }

      setName(formattedName);
      setDescription(formattedDescription.trim());
      setError(null);
      setSuccess(null);
      setIsLoading(false);
    }
  }, [isOpen, testName, testDescription, testUrl, testSteps]);

  const handleConfirm = async () => {
    if (!name.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await createJiraIssue({
        summary: name,
        description: description,
        issue_type: 'Bug',
      });

      setSuccess({
        issueKey: response.issue_key,
        issueUrl: response.issue_url,
      });

      if (onConfirm) {
        onConfirm(response);
      }
    } catch (err) {
      console.error('Failed to create Jira issue:', err);
      setError(err.message || 'Failed to create Jira issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-[500px] max-w-2xl mx-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-200 relative">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Jira Issue</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <p className="font-medium">Issue created successfully!</p>
            <p className="mt-1">
              <a href={success.issueUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {success.issueKey}
              </a>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                console.log('Name changed:', e.target.value);
                setName(e.target.value);
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700"
              placeholder={"E2E Test Fail: \"Test Name\""}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                console.log('Description changed:', e.target.value);
                setDescription(e.target.value);
              }}
              disabled={isLoading}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-600"
              placeholder="Test failure details, URL, and reproduction steps will be auto-filled..."
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2"
            style={{ borderColor: '#dc2626', color: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.15)')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)')}
          >
            No
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2"
            style={{ borderColor: '#16a34a', color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(22, 163, 74, 0.15)')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(22, 163, 74, 0.1)')}
          >
            {isLoading ? 'Creating...' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JiraIssueModal;
