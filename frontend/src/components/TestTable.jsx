import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import TestBar from './TestBar';

export default function TestTable({ tests = [], onDelete }) {
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <ChevronUp className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'asc' 
            ? <ChevronUp className="h-4 w-4 text-gray-600" />
            : <ChevronDown className="h-4 w-4 text-gray-600" />;
    };

    const sortedTests = [...tests].sort((a, b) => {
        if (!sortField) return 0;

        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle different field types
        if (sortField === 'name') {
            aValue = a.name || '';
            bValue = b.name || '';
        } else if (sortField === 'platform') {
            aValue = a.platform || 'Web';
            bValue = b.platform || 'Web';
        } else if (sortField === 'url') {
            aValue = a.url || '';
            bValue = b.url || '';
        } else if (sortField === 'status') {
            aValue = a.status || 'Not Run';
            bValue = b.status || 'Not Run';
        } else if (sortField === 'lastRun') {
            aValue = a.lastRun || '';
            bValue = b.lastRun || '';
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="px-6 py-3 flex items-center gap-4">
                    {/* Test Name Header */}
                    <div 
                        className="flex-1 min-w-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                        onClick={() => handleSort('name')}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Test Name</span>
                            {getSortIcon('name')}
                        </div>
                    </div>

                    {/* Platform Header */}
                    <div 
                        className="flex-shrink-0 w-20 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                        onClick={() => handleSort('platform')}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Platform</span>
                            {getSortIcon('platform')}
                        </div>
                    </div>

                    {/* Execution Target Header */}
                    <div 
                        className="flex-1 min-w-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                        onClick={() => handleSort('url')}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Execution Target</span>
                            {getSortIcon('url')}
                        </div>
                    </div>

                    {/* Status Header */}
                    <div 
                        className="flex-shrink-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                        onClick={() => handleSort('status')}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Status</span>
                            {getSortIcon('status')}
                        </div>
                    </div>

                    {/* Last Run Header */}
                    <div 
                        className="flex-shrink-0 w-20 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                        onClick={() => handleSort('lastRun')}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Last Run</span>
                            {getSortIcon('lastRun')}
                        </div>
                    </div>

                    {/* Actions Header */}
                    <div className="flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-700">Actions</span>
                    </div>
                </div>
            </div>

            {/* Table Body */}
            <div>
                {sortedTests.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <p className="text-gray-500">No tests found</p>
                    </div>
                ) : (
                    sortedTests.map((test, index) => (
                        <TestBar key={test.id || index} test={test} onDelete={onDelete} />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        {sortedTests.length}/{sortedTests.length} matches
                    </span>
                </div>
            </div>
        </div>
    );
}
