function StepBlock({ step, onEdit, onDelete, status = 'pending' }) {
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