import { Globe, CircleDashed, Wrench, Play, List, MoreHorizontal, Delete, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from "../supabase";
import { executeTest } from "../backendApi/generateTest";

export default function TestBar({ test, onDelete, onTestUpdate }) {
    const navigate = useNavigate();
    const [isRunning, setIsRunning] = useState(false);

    const handleEdit = () => {
        // Navigate to TestCreate with test ID
        navigate(`/tests/create/${test.id}`, { 
            state: { 
                testData: test,
                mode: 'edit'
            } 
        });
    };

    const handleRunTest = async () => {
        if (isRunning) return; // Prevent multiple simultaneous runs
        
        setIsRunning(true);
        
        // Update test status to loading
        if (onTestUpdate) {
            onTestUpdate(test.id, { isLoading: true, status: 'Loading...' });
        }

        try {
            const response = await executeTest({ test_id: test.id });
            
            if (response.success) {
                // Test passed
                if (onTestUpdate) {
                    onTestUpdate(test.id, { 
                        isLoading: false, 
                        last_passed: true, 
                        status: 'Passed',
                        lastRun: new Date().toISOString()
                    });
                }
            } else {
                // Test failed
                if (onTestUpdate) {
                    onTestUpdate(test.id, { 
                        isLoading: false, 
                        last_passed: false, 
                        status: 'Failed',
                        lastRun: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('Error executing test:', error);
            // Update test status to error
            if (onTestUpdate) {
                onTestUpdate(test.id, { 
                    isLoading: false, 
                    status: 'Error',
                    lastRun: new Date().toISOString()
                });
            }
        } finally {
            setIsRunning(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('tests').delete().eq('id', id);
            if (error) throw error;
            
            // Call the parent's delete function to update the state
            if (onDelete) {
                onDelete(id);
            }
        } catch (error) {
            console.error('Error deleting test:', error);
        }
    };

    // Breathing loading state with actual data
    if (test.isLoading) {
        return (
            <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                    <h3 className="text-sm font-medium text-gray-900 truncate animate-breathing">
                        {test.name || 'Test Name'}
                    </h3>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 animate-breathing">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Web</span>
                    </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700 truncate animate-breathing">
                        {test.target_url || 'https://example.com'}
                    </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border bg-blue-100 border-blue-300 w-fit">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-600">Loading...</span>
                    </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700 animate-breathing">
                        N/A
                    </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-200 rounded animate-breathing"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded animate-breathing"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded animate-breathing"></div>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap">
                <h3 className={`text-sm font-medium text-gray-900 truncate ${test.animateIn ? 'animate-slideInFade' : ''}`} style={test.animateIn ? {animationDelay: '0.1s'} : {}}>
                    {test.name || 'Test Name'}
                </h3>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className={`flex items-center gap-2 ${test.animateIn ? 'animate-slideInFade' : ''}`} style={test.animateIn ? {animationDelay: '0.2s'} : {}}>
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Web</span>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-sm text-gray-700 truncate ${test.animateIn ? 'animate-slideInFade' : ''}`} style={test.animateIn ? {animationDelay: '0.3s'} : {}}>
                    {test.target_url || 'https://example.com'}
                </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
                    test.isLoading ? 'bg-blue-100 border-blue-300' :
                    test.status === 'Error' ? 'bg-red-100 border-red-300' :
                    test.last_passed === true ? 'bg-green-100 border-green-300' :
                    test.last_passed === false ? 'bg-red-100 border-red-300' :
                    'bg-gray-100 border-gray-300'
                }`}>
                    {test.isLoading ? (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    ) : test.status === 'Error' ? (
                        <XCircle className="h-3 w-3 text-red-600" />
                    ) : test.last_passed === true ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : test.last_passed === false ? (
                        <XCircle className="h-3 w-3 text-red-600" />
                    ) : (
                        <Clock className="h-3 w-3 text-gray-600" />
                    )}
                    <span className={`text-xs font-medium ${
                        test.isLoading ? 'text-blue-600' :
                        test.status === 'Error' ? 'text-red-600' :
                        test.last_passed === true ? 'text-green-600' :
                        test.last_passed === false ? 'text-red-600' :
                        'text-gray-600'
                    }`}>
                        {test.isLoading ? 'Loading...' :
                         test.status === 'Error' ? 'Error' :
                         test.last_passed === true ? 'Passing' :
                         test.last_passed === false ? 'Failing' :
                         'Not Run'}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-700">
                    {test.last_run_at ? new Date(test.last_run_at).toLocaleString(undefined, { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }) : 'N/A'}
                </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleEdit}
                        className="p-2 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                        title="Edit test"
                    >
                        <Wrench className="h-4 w-4 text-blue-600" />
                    </button>
                    <button 
                        onClick={handleRunTest}
                        disabled={isRunning || test.isLoading}
                        className={`p-2 border border-gray-200 rounded-lg transition-colors ${
                            isRunning || test.isLoading 
                                ? 'bg-gray-100 cursor-not-allowed' 
                                : 'bg-white hover:bg-green-50'
                        }`}
                        title={isRunning || test.isLoading ? "Test is running..." : "Run test"}
                    >
                        <Play className={`h-4 w-4 ${
                            isRunning || test.isLoading 
                                ? 'text-gray-400' 
                                : 'text-green-600'
                        }`} />
                    </button>
                    <button 
                        className="p-2 bg-white hover:bg-red-50 border border-gray-200 rounded-lg transition-colors" 
                        onClick={() => handleDelete(test.id)}
                        title="Delete test"
                    >
                        <Delete className="h-4 w-4 text-red-600" />
                    </button>
                </div>
            </td>
        </tr>
    )
}