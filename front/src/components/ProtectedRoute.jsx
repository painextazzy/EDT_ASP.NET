// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '../services/auth';

const ProtectedRoute = ({ requiredRole, redirectTo = '/' }) => {
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = authApi.isAuthenticated();

  // Récupérer l'utilisateur (pour vérifier son rôle)
  const user = authApi.getUser();

  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si un rôle est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers la page d'accueil correspondant à son rôle
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'ENSEIGNANT') {
      return <Navigate to="/enseignant" replace />;
    } else {
      // Si rôle inconnu, rediriger vers l'accueil (ou login)
      return <Navigate to="/" replace />;
    }
  }

  // Si tout est OK, afficher la route demandée
  return <Outlet />;
};

export default ProtectedRoute;