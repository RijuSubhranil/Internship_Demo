import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Styles
import './styles/Global.css';
import Profile from './pages/Profile';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  // Redirect logic: after login, send to role-specific dashboard
  const getHomeRedirect = () => {
    if (!isLoggedIn) return "/login";
    return user?.role === 'admin' ? "/admin" : "/dashboard";
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />

      <Header isLoggedIn={isLoggedIn} user={user} />

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={
            !isLoggedIn ? <Login /> : <Navigate to={getHomeRedirect()} />
          } />
          <Route path="/register" element={
            !isLoggedIn ? <Register /> : <Navigate to={getHomeRedirect()} />
          } />
          <Route path="/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Profile /></ProtectedRoute>} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              {user?.role === 'admin' ? <Navigate to="/admin" /> : <UserDashboard />}
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute
              isLoggedIn={isLoggedIn}
              requiredRole="admin"
              userRole={user?.role}
            >
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;