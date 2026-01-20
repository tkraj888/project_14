import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role (with mapping support)
  const roleMapping = {
    'EMPLOYEE': ['EMPLOYEE', 'SURVEYOR'],
    'LAB': ['LAB_TECHNICIAN', 'LAB'],
    'ADMIN': ['ADMIN','ROLE_ADMIN'],
    'USER': ['USER']
  };

  const allowedRoles = roleMapping[role] || [role];
  if (role && !allowedRoles.includes(userRole?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
 