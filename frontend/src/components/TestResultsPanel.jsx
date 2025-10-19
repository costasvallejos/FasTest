import { CheckCircle2 } from 'lucide-react';

function TestResultsPanel({
  testResult,
  isRunning,
  showResult,
  onReportToJira
}) {
  return (
    <div className="w-1/3 p-6 bg-white overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Result</h2>

      {!testResult && !isRunning && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 shadow-sm opacity-50 flex flex-col items-center justify-center h-[500px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-gray-600 font-medium text-lg">Screenshot will appear here</p>
          </div>
          <p className="text-gray-500 text-sm text-center">Test results and screenshots will show in this area</p>
        </div>
      )}

      {isRunning && (
        <div
          className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200 transition-all duration-500 ease-in-out opacity-100 h-[500px] flex flex-col items-center justify-center"
          style={{
            opacity: 0,
            transform: 'translateY(-10px)',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Running test...</p>
            <p className="text-gray-500 text-sm">Executing Playwright tests</p>
          </div>
        </div>
      )}

      {testResult && !testResult.passed && showResult && (
        <>
          <div
            className="bg-red-50 rounded-lg border border-red-300 p-4 transition-all duration-700 ease-out flex flex-col"
            style={{
              opacity: 0,
              transform: 'translateY(-10px)',
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <div className="flex items-center gap-2 mb-3 text-red-600">
              <span className="text-2xl">❌</span>
              <span className="font-semibold">Test Failed at Step {testResult.failedStep}</span>
            </div>
            <img
              src={testResult.screenshot}
              alt="Failure screenshot"
              className="w-full rounded border border-gray-300 mb-3 flex-1 object-contain"
            />
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
              onClick={onReportToJira}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
            >
              🎫 Report to Jira
            </button>
          </div>
        </>
      )}

      {testResult && testResult.passed && showResult && (
        <div
          className="bg-green-50 rounded-lg p-8 text-center border border-green-300 transition-all duration-700 ease-out h-[500px] flex flex-col items-center justify-center"
          style={{
            opacity: 0,
            transform: 'translateY(-10px)',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2
              className="w-16 h-16 text-green-600"
              style={{
                transform: showResult ? 'scale(1)' : 'scale(0.8)',
                transition: 'transform 0.5s ease-out 0.2s'
              }}
            />
            <p className="text-green-600 font-semibold text-xl">All tests passed!</p>
            <p className="text-gray-500 text-sm">Completed at {testResult.timestamp}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestResultsPanel;
