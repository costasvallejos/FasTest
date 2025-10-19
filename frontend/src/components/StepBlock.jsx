function StepBlock({ step, onEdit, onDelete, status = 'pending' }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'passed':
        return (
          <div className="flex-shrink-0 w-6 h-6 rounded-full border border-green-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="flex-shrink-0 w-6 h-6 rounded-full border border-red-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
      style={{
        opacity: 0,
        transform: 'translateY(-10px)',
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-purple-700">{step.id}</span>
        </div>
        <p className="flex-1 text-gray-800 font-medium text-sm leading-relaxed">{step.text}</p>
        {getStatusIcon()}
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default StepBlock;