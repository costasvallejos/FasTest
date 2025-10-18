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
      navigate: 'bg-blue-600 border-blue-400 text-white',
      input: 'bg-purple-600 border-purple-400 text-white',
      click: 'bg-orange-600 border-orange-400 text-white',
      verify: 'bg-green-600 border-green-400 text-white',
      wait: 'bg-yellow-600 border-yellow-400 text-white',
      default: 'bg-gray-600 border-gray-400 text-white'
    };
    return colors[type] || colors.default;
  };

  return (
    <div className={`${getColorClasses(step.type)} border rounded-lg p-4 mb-3`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon(step.type)}</span>
        <p className="flex-1 text-gray-800">{step.text}</p>
        <button 
          onClick={() => onEdit(step.id)} 
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(step.id)} 
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default StepBlock;
