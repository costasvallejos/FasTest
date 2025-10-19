import { CheckCircle, X } from 'lucide-react';

function StepBlock({ step, onEdit, onDelete, status = 'pending' }) {
  return (
    <div 
      className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-gray-650 transition-all duration-300 cursor-pointer"
      style={{
        opacity: 0,
        transform: 'translateY(-10px)',
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-200">{step.id}</span>
        </div>
        <p className="flex-1 text-gray-200 font-medium">{step.text}</p>
        <div className="flex-shrink-0">
          {status === 'passed' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : status === 'failed' ? (
            <X className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-gray-500" />
          )}
        </div>
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