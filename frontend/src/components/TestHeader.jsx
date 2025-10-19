import { ArrowLeft } from 'lucide-react';

function TestHeader({ onBack, isEditMode, onSave }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Test Suite
      </button>
      <div className="flex items-center gap-4">
        <div className="text-gray-600 text-sm">
          {isEditMode ? 'Edit Test Configuration' : 'Test Creation'}
        </div>
        {isEditMode && (
          <button
            onClick={onSave}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}

export default TestHeader;
