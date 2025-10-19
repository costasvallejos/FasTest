import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestSuite from './components/TestSuite';
import TestSuiteDashboard from './components/TestSuiteDashboard';
import TestCreate from './pages/TestCreate';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Test Suite - main page */}
        <Route path="/" element={<TestSuite />} />
        <Route path="/tests" element={<TestSuite />} />
        <Route path="/tests/create" element={<TestCreate />} />
        <Route path="/tests/create/:id" element={<TestCreate />} />
        
        
        {/* Dashboard - teammate's work */}
        <Route path="/dashboard" element={<TestSuiteDashboard />} />
        
        {/* Test Creation Page - your work */}
        {/* <Route path="/test/create" element={<TestCreate />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
