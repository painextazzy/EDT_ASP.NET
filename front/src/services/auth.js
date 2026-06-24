// src/services/auth.js
const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};
export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const apiClient = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // ✅ NE PAS ajouter le token sur /login
  const isLoginEndpoint = endpoint.includes('/login');
  const isValidateTokenEndpoint = endpoint.includes('/validate-token');
  
  if (token && !isLoginEndpoint && !isValidateTokenEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // ✅ Gérer 401 uniquement pour les endpoints protégés
    if (response.status === 401 && !isLoginEndpoint) {
      console.warn('⚠️ Token expiré ou invalide (401)');
      removeToken();
      removeUser();
      throw new Error('SESSION_EXPIRED');
    }

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
    console.error('❌ Erreur API:', error);
    throw error;
  }
};

export const authApi = {
  // ✅ Login - SANS token
  login: async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      const data = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('📩 Réponse login:', data);

      if (!data || !data.success) {
        throw new Error(data?.message || 'Email ou mot de passe incorrect');
      }

      // Stocker le token
      setToken(data.data.token);
      console.log('✅ Token stocké');
      
      // Stocker l'utilisateur
      setUser({
        id: data.data.userId,
        email: data.data.email,
        role: data.data.role,
        estValide: data.data.estValide,
        enseignant: data.data.enseignant || null
      });
      console.log('✅ Utilisateur stocké:', data.data.email);

      return data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  },

  // ✅ Récupérer le profil - AVEC token
  getProfile: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('NON_AUTHENTIFIE');
      }
      
      const data = await apiClient('/api/auth/me', { method: 'GET' });
      
      if (data.success && data.data) {
        setUser(data.data);
        return data;
      }
      throw new Error('Erreur récupération profil');
    } catch (error) {
      console.error('❌ Erreur getProfile:', error);
      if (error.message === 'SESSION_EXPIRED') {
        removeToken();
        removeUser();
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // ✅ Valider le token - SANS token (ou avec)
  validateToken: async () => {
    const token = getToken();
    if (!token) {
      return { valid: false, message: 'Aucun token trouvé' };
    }
    
    try {
      const data = await apiClient(`/api/auth/validate-token?token=${token}`, { 
        method: 'GET' 
      });
      
      if (!data.valid) {
        removeToken();
        removeUser();
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      removeToken();
      removeUser();
      return { valid: false, message: error.message };
    }
  },

  // ✅ Déconnexion
  logout: (redirect = true) => {
    console.log('🚪 Déconnexion');
    removeToken();
    removeUser();
    if (redirect) {
      window.location.href = '/login';
    }
  },

  // ========== GETTERS ==========
  getToken,
  getUser,
  
  isAuthenticated: () => {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
  },
  
  hasRole: (role) => {
    const user = getUser();
    return user && user.role === role;
  },
  
  isAdmin: () => {
    const user = getUser();
    return user && user.role === 'ADMIN';
  },
  
  isEnseignant: () => {
    const user = getUser();
    return user && user.role === 'ENSEIGNANT';
  },

  isEstValide: () => {
    const user = getUser();
    return user && user.estValide === true;
  }
};

export default authApi;