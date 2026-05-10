import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardPage from './pages/dashboard';
import Protected from './pages/protected';

import ClassDetails from './pages/ClassDetails';

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/class/:classId" element={<ClassDetails />} />
          </Route>
          {/* Default redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;