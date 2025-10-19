import { ArrowLeft } from 'lucide-react';
import logo from '../assets/logo3.png';

function TestHeader({ onBack }) {
  return (
    <div className="relative flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Test Suite
      </button>
      {/* Centered Logo */}
      <img src={logo} alt="Logo" className="absolute left-1/2 -translate-x-1/2 h-16 md:h-20 w-auto" />
      <div className="flex items-center gap-4">
        <div className="text-gray-600 text-sm">
          Test Configuration
        </div>
      </div>
    </div>
  );
}

export default TestHeader;
