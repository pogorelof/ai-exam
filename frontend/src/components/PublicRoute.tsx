import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const PublicRoute: React.FC = () => {
  const token = localStorage.getItem('access_token');

  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // If token is valid (not expired), redirect to home
      if (decoded.exp > currentTime) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      // If token is invalid, clear it and allow access to public route
      localStorage.removeItem('access_token');
    }
  }

  return <Outlet />;
};

