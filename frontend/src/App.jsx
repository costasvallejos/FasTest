import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestCreate from './pages/TestCreate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Temporary: Your page as default for solo development */}
        <Route path="/" element={<TestCreate />} />
        <Route path="/test/create" element={<TestCreate />} />
        
        {/* Placeholder for teammate's dashboard */}
        <Route path="/dashboard" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Coming soon (teammate is building this)</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
