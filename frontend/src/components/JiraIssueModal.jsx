import { useState, useEffect } from 'react';

function JiraIssueModal({ isOpen, onClose, onConfirm, testName, testDescription }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Update form fields when props change
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened with:', { testName, testDescription });
      setName(testName || '');
      setDescription(testDescription || '');
    }
  }, [isOpen, testName, testDescription]);

  const handleConfirm = () => {
    onConfirm({ name, description });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Jira Issue</h2>
        
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter issue name"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter issue description"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-white font-medium rounded-md transition-colors shadow-md"
            style={{ backgroundColor: '#dc2626' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            No
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 text-white font-medium rounded-md transition-colors shadow-md"
            style={{ backgroundColor: '#16a34a' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default JiraIssueModal;
