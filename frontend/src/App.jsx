import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import LandingPage from '../Pages/landingPage';
import './styles/global.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="app">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Vendor Routes */}
              <Route element={<PrivateRoute allowedRoles={['vendor']} />}>
                <Route path="/vendor/*" element={<VendorDashboard />} />
           
              </Route>
              
              {/* Protected Supplier Routes */}
              <Route element={<PrivateRoute allowedRoles={['supplier']} />}>
                <Route path="/supplier/*" element={<SupplierDashboard />} />
              </Route>
              
              {/* Redirect authenticated users to their dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
