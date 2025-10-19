function StepsContainer({ children }) {
  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden" style={{ height: '450px' }}>
      <div className="h-full overflow-y-auto p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

export default StepsContainer;
