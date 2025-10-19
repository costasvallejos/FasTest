function FormFieldsContainer({ children }) {
  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm" style={{ height: '450px' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default FormFieldsContainer;
