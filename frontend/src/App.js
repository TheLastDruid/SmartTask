import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/ChatBot';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmailVerification from './pages/EmailVerification';
import EmailVerificationRequired from './pages/EmailVerificationRequired';

function App() {
  console.log('App component rendered');
  
  return (
    <AuthProvider>
      <Router>        <div className="App">
          <Routes>
            <Route path="/login" element={
              <div>
                {console.log('Login route accessed')}
                <Login />
              </div>
            } />            <Route path="/register" element={
              <div>
                {console.log('Register route accessed')}
                <Register />
              </div>
            } />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
            <Route
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={
              <div>
                {console.log('Root route accessed, redirecting to dashboard')}
                <Navigate to="/dashboard" replace />
              </div>
            } />
          </Routes>
            {/* Add ChatBot for authenticated users - only show on dashboard */}
          <ProtectedRoute>
            <ChatBot />
          </ProtectedRoute>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
