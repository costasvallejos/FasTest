import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestCreate from './pages/TestCreate';
import TestSuiteDashboard from './components/TestSuiteDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard - teammate's work */}
        <Route path="/" element={<TestSuiteDashboard />} />
        <Route path="/dashboard" element={<TestSuiteDashboard />} />
        
        {/* Test Creation Page - your work */}
        <Route path="/test/create" element={<TestCreate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
