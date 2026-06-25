// src/services/auth.js
const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// ========== GESTION DU TOKEN ==========
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// ========== GESTION DE L'UTILISATEUR ==========
export const getUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};
export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUser = () => localStorage.removeItem(USER_KEY);

// ========== API CLIENT ==========
export const apiClient = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = getToken();
  if (token && !endpoint.includes('/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { message: 'Une erreur est survenue' };
      }
      
      const error = new Error(errorData.message || 'Erreur API');
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ========== AUTHENTIFICATION ==========
export const authApi = {
  login: async (email, password) => {
    try {
      const data = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Email ou mot de passe incorrect');
      }

      setToken(data.data.token);
      setUser({
        id: data.data.userId,
        email: data.data.email,
        role: data.data.role,
        estValide: data.data.estValide
      });

      return data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
  },

  getRole: () => {
    const user = getUser();
    return user?.role || null;
  },

  hasRole: (role) => {
    const user = getUser();
    return user && user.role === role;
  },

  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/login';
  },

  getToken,
  getUser,
};

export default authApi;