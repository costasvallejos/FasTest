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
      navigate: 'bg-blue-50 border-blue-200',
      input: 'bg-purple-50 border-purple-200',
      click: 'bg-orange-50 border-orange-200',
      verify: 'bg-green-50 border-green-200',
      wait: 'bg-yellow-50 border-yellow-200',
      default: 'bg-gray-50 border-gray-200'
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
