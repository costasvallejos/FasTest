import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import TestBar from './TestBar';

export default function TestTable({ tests = [], onDelete, onTestUpdate, searchQuery = '' }) {
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

    // Filter tests based on search query
    const filteredTests = tests.filter(test => 
        test.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedTests = [...filteredTests].sort((a, b) => {
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
            <div className="overflow-auto">
                <table className="min-w-full text-sm border-collapse">
                    {/* Table Header */}
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    <span>Test Name</span>
                                    {getSortIcon('name')}
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors w-20"
                                onClick={() => handleSort('platform')}
                            >
                                <div className="flex items-center gap-2">
                                    <span>Platform</span>
                                    {getSortIcon('platform')}
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('url')}
                            >
                                <div className="flex items-center gap-2">
                                    <span>Execution Target</span>
                                    {getSortIcon('url')}
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    <span>Status</span>
                                    {getSortIcon('status')}
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors w-20"
                                onClick={() => handleSort('lastRun')}
                            >
                                <div className="flex items-center gap-2">
                                    <span>Last Run</span>
                                    {getSortIcon('lastRun')}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {sortedTests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No tests found
                                </td>
                            </tr>
                        ) : (
                            sortedTests.map((test, index) => (
                                <TestBar key={test.id || index} test={test} onDelete={onDelete} onTestUpdate={onTestUpdate} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        {sortedTests.length}/{tests.length} matches
                        {searchQuery && ` for "${searchQuery}"`}
                    </span>
                </div>
            </div>
        </div>
    );
}
