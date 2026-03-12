import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './store/slices/authSlice';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import EmployeesPage from './pages/EmployeesPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="text-white text-center">
        <div className="text-5xl mb-4">🛒</div>
        <p className="text-lg font-medium animate-pulse">EasyTrade yuklanmoqda...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(getMe());
    else dispatch({ type: 'auth/setInitialized' });
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pos"       element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
        <Route path="/sales"     element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/products"  element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute adminOnly><EmployeesPage /></ProtectedRoute>} />
        <Route path="/reports"   element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
