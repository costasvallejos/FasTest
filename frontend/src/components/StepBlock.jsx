function StepBlock({ step, onEdit, onDelete, status = 'pending' }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'passed':
        return {
          background: 'bg-green-50',
          border: 'border-green-200',
          showCheckmark: true
        };
      case 'failed':
        return {
          background: 'bg-red-50',
          border: 'border-red-300',
          showCheckmark: false
        };
      default:
        return {
          background: 'bg-white',
          border: 'border-gray-200',
          showCheckmark: false
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`${styles.background} border ${styles.border} rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300`}
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
        {styles.showCheckmark && (
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-600"
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
        )}
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