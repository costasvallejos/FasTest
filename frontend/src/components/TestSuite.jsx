import {useState, useEffect} from "react";
import HeaderTest from "./HeaderTest";
import TestTable from "./TestTable";
import { supabase } from "../supabase";

export default function TestSuite() {

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDeleteTest = (testId) => {
        setTests(prevTests => prevTests.filter(test => test.id !== testId));
    };

    const handleTestCreated = (newTest) => {
        setTests(prevTests => [...prevTests, newTest]);
    };

    useEffect(() => {
        const fetchTests = async () => {
            try {
                console.log('Fetching tests from Supabase...');
                const { data, error } = await supabase.from('tests').select('*');
                console.log('Supabase response:', { data, error });
                
                if (error) {
                    console.error('Supabase error:', error);
                    setError(error);
                } else {
                    console.log('Tests fetched:', data);
                    setTests(data || []);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err);
            }
            setLoading(false);
        }
        fetchTests();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tests...</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <HeaderTest/>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                    <h2 className="text-red-800 font-semibold mb-2">Error loading tests</h2>
                    <p className="text-red-600">{error.message}</p>
                    <p className="text-sm text-gray-500 mt-2">Check your Supabase configuration and network connection.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <HeaderTest onTestCreated={handleTestCreated}/>

            {tests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No tests found</h2>
                    <p className="text-gray-500">Create your first test to get started.</p>
                </div>
            ) : (
                <div className="mt-6">
                    <TestTable tests={tests} onDelete={handleDeleteTest} />
                </div>
            )}
        </div>
    )
}

