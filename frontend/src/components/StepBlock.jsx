function StepBlock({ step, onEdit, onDelete }) {
  const getIcon = (type) => {
    const icons = { 
      navigate: '🌐', 
      input: '⌨️', 
      click: '👆', 
      verify: '✓',
      wait: '⏱️',
      default: '📝' 
    };
    return icons[type] || icons.default;
  };

  const getColorClasses = (type) => {
    const colors = {
      navigate: 'bg-blue-100',
      input: 'bg-purple-100',
      click: 'bg-orange-100',
      verify: 'bg-green-100',
      wait: 'bg-yellow-100',
      default: 'bg-gray-100'
    };
    return colors[type] || colors.default;
  };

  return (
    <div className={`${getColorClasses(step.type)} border-2 border-gray-400 p-4 shadow-sm transform hover:scale-105 transition-all duration-200 cursor-pointer relative`} 
         style={{
           clipPath: 'polygon(calc(50% - 10px) 0%, calc(50% + 10px) 0%, calc(50% + 10px) 6px, 100% 6px, 100% 100%, 0% 100%, 0% 6px, calc(50% - 10px) 6px)',
           marginBottom: '-6px'
         }}>
      {/* Bottom tab that extends to next block */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-2 bg-gray-900 rounded-t-full"></div>
      
      <div className="flex items-center gap-3">
        <span className="text-2xl text-gray-700">{getIcon(step.type)}</span>
        <p className="flex-1 text-gray-800 font-medium text-lg">{step.text}</p>
      </div>
    </div>
  );
}

export default StepBlock;
