import React, { useState } from 'react';
import { FlaskConical, Plus, X } from 'lucide-react';
import { supabase } from '../supabase';
import { generateTest } from '../backendApi/generateTest';
import logo from '../assets/logo3.png';

const HeaderTest = ({ onTestCreated, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', url: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim() || !formData.description.trim()) {
      alert('Please fill in all fields (name, URL, and description)');
      return;
    }

    // Create a temporary loading test object
    const loadingTest = {
      id: `loading-${Date.now()}`, // Temporary ID
      name: formData.name.trim(),
      target_url: formData.url.trim(),
      description: formData.description.trim(),
      status: 'Loading...',
      platform: 'Web',
      lastRun: null,
      isLoading: true
    };

    // Immediately close modal and add loading test to the list
    handleCloseModal();
    if (onTestCreated) {
      onTestCreated(loadingTest);
    }

    setIsSubmitting(true);
    try {
      console.log('Sending generateTest request', {
        target_url: formData.url.trim(),
        test_case_description: formData.description.trim(),
      });
      
      const response = await generateTest({
        target_url: formData.url.trim(),
        test_case_description: formData.description.trim(),
      });
      console.log('Generated Test Response:', response);

      const { data, error } = await supabase
        .from('tests')
        .insert([
          {
            name: formData.name.trim(),
            target_url: formData.url.trim(),
            description: formData.description.trim(),
            plan: response.test_plan,
            test_script: response.test_script,
          }
        ])
        .select();
      const supabaseResponse = data[0];
      
      console.log('Supabase Insert Response:', supabaseResponse, error);

      if (error) throw error;

      // Update the loading test with real data
      if (onTestCreated) {
        onTestCreated({
          ...supabaseResponse,
          isLoading: false,
          status: 'Not Run',
          animateIn: true // Flag to trigger slide-in animation
        });
      }
      
      // Refresh the tests list to get updated data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error creating test:', error);
      // Update the loading test to show error state
      if (onTestCreated) {
        onTestCreated({
          ...loadingTest,
          isLoading: false,
          status: 'Error',
          error: 'Failed to create test'
        });
      }
      alert('Failed to create test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Icon and Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <img src={logo} alt="Logo" className="h-20 w-48" />
          </div>

          {/* Right Section - Create Button */}
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'}}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Test</h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Test Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter test name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-black bg-white"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-black bg-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter test description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors resize-none text-black bg-white"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderTest;