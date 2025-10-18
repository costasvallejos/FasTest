import { Globe, CircleDashed, Wrench, Play, List, MoreHorizontal, Delete } from 'lucide-react';
import { supabase } from "../supabase";

export default function TestBar({ test, onDelete }) {

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

    return (
        <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0">
            <div className="px-6 py-4 flex items-center gap-4">
                {/* Test Name - 30% width */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                        {test.name || 'Test Name'}
                    </h3>
                </div>

                {/* Platform - 12% width */}
                <div className="flex-shrink-0 w-20">
                    <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Web</span>
                    </div>
                </div>

                {/* Execution Target - 25% width */}
                <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 truncate">
                        {test.url || 'https://example.com'}
                    </span>
                </div>

                {/* Status - 15% width */}
                <div className="flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2.5 py-1 border border-gray-300">
                        <CircleDashed className="h-3 w-3 text-gray-600" />
                        <span className="text-xs text-gray-600">Not Run</span>
                    </div>
                </div>

                {/* Last Run - 12% width */}
                <div className="flex-shrink-0 w-20">
                    <span className="text-sm text-gray-700">N/A</span>
                </div>

                {/* Actions - 16% width */}
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <Wrench className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <Play className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors" onClick={() => handleDelete(test.id)}>
                        <Delete className="h-4 w-4 text-red-600" />
                    </button>
                </div>
            </div>
        </div>
    )
}