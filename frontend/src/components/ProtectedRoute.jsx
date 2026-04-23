import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isLoggedIn, requiredRole, userRole }) => {
    // 1. If not logged in, redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 2. If a specific role is required (e.g., 'admin') and user doesn't have it
    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;