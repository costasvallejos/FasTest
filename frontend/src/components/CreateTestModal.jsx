import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 w-[500px] max-w-2xl mx-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-200 z-50">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
            Create New Test
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            Configure your test case details below.
          </Dialog.Description>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com or Auto-detected"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium"
              >
                Create Test
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </Dialog.Close>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function X(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" {...props}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
