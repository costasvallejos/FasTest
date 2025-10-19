
import { FlaskConical, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function PassingBar({ tests }) {

    let passing = 0;
    let failing = 0;
    let notRun = 0;

    for (const test of tests) {
        if (test.last_passed === true) {
            passing++;
        } else if (test.last_passed === false) {
            failing++;
        } else {
            notRun++;
        }
    }

    const totalTests = tests.length;
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-4 gap-4">
                {/* Total Tests */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Total Tests</p>
                            <p className="text-xl font-bold text-gray-900">{totalTests}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FlaskConical className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Passing */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Passing</p>
                            <p className="text-xl font-bold text-gray-900">{passing}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Failing */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Failing</p>
                            <p className="text-xl font-bold text-gray-900">{failing}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Not Run */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Not Run</p>
                            <p className="text-xl font-bold text-gray-900">{notRun}</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}