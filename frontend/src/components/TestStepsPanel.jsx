import { CheckCircle } from 'lucide-react';
import StepBlock from './StepBlock';

function TestStepsPanel({
  steps,
  stepStatuses,
  showRunButton,
  isRunning,
  isGenerating,
  onEditStep,
  onDeleteStep,
  onRunTest
}) {
  return (
    <div className="w-1/3 p-6 border-r border-gray-200 bg-white overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Steps</h2>

      {isGenerating ? (
        <div className="space-y-3">
          {/* Skeleton loading state */}
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
            <p className="text-gray-600 text-sm font-medium">Regenerating test, this could take a while...</p>
          </div>
        </div>
      ) : steps.length === 0 ? (
        <div className="space-y-3">
          {/* Empty placeholder step blocks */}
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm opacity-50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">{num}</span>
                </div>
                <p className="flex-1 text-gray-600 font-medium">Step will appear here...</p>
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">Generate test steps to see them here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step) => (
            <StepBlock
              key={step.id}
              step={step}
              status={stepStatuses[step.id] || 'pending'}
              onEdit={onEditStep}
              onDelete={onDeleteStep}
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
                onClick={onRunTest}
                disabled={isRunning || steps.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg mt-4 transition-all duration-300 shadow-lg"
              >
                {isRunning ? 'Running Test...' : 'Run Test'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TestStepsPanel;
