// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../services/auth';

/**
 * Composant pour les routes publiques (login, inscription, accueil).
 * Si l'utilisateur est déjà authentifié, redirige vers son dashboard.
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = authApi.isAuthenticated();
  const user = authApi.getUser();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'ENSEIGNANT') {
      return <Navigate to="/enseignant" replace />;
    }
  }

  return children;
};

export default PublicRoute;