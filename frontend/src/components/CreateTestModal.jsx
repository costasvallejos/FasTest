import React, { useState } from "react";

export default function CreateTestModal({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: "",
    platform: "Web",
    executionTarget: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Create test with:", formData);
    onOpenChange(false);
    setFormData({ name: "", platform: "Web", executionTarget: "" });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-[500px] max-w-2xl mx-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-200 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Test</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
              placeholder="Enter test name"
              required
            />
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              id="platform"
              value={formData.platform}
              onChange={(e) => handleChange("platform", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
            >
              <option value="Web">Web</option>
              <option value="iOS">iOS</option>
              <option value="Android">Android</option>
            </select>
          </div>

          <div>
            <label htmlFor="executionTarget" className="block text-sm font-medium text-gray-700 mb-1">
              Execution Target
            </label>
            <input
              id="executionTarget"
              type="text"
              value={formData.executionTarget}
              onChange={(e) => handleChange("executionTarget", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
              placeholder="https://example.com or Auto-detected"
              required
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 font-medium rounded-md transition-colors border-2"
              style={{ borderColor: '#dc2626', color: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.15)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.15)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 font-medium rounded-md transition-colors border-2"
              style={{ borderColor: '#16a34a', color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.15)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(22, 163, 74, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(22, 163, 74, 0.15)'}
            >
              Create Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function X({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
