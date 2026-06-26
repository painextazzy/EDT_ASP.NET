// src/services/auth.js
const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// ========== GESTION DU TOKEN ==========
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token && validateTokenFormat(token)) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    console.warn('⚠️ Token invalide, non stocké');
  }
};
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// ========== VALIDATION DU TOKEN ==========
export const validateTokenFormat = (token) => {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('❌ Token mal formé:', parts.length, 'parties (attendu: 3)');
    return false;
  }
  
  if (!token.startsWith('eyJ')) {
    console.error('❌ Token ne commence pas par eyJ');
    return false;
  }
  
  if (parts.some(p => p.length === 0)) {
    console.error('❌ Token contient une partie vide');
    return false;
  }
  
  return true;
};

// ========== GESTION DE L'UTILISATEUR ==========
export const getUser = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('❌ Erreur lecture utilisateur:', e);
    return null;
  }
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('✅ Utilisateur mis à jour:', user);
  }
};

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
    if (validateTokenFormat(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Token invalide, nettoyage...');
      removeToken();
      removeUser();
      window.location.href = '/login';
      throw new Error('SESSION_EXPIRED');
    }
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
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
    if (error.message === 'SESSION_EXPIRED') {
      window.location.href = '/login';
    }
    throw error;
  }
};

// ========== AUTHENTIFICATION ==========
export const authApi = {
  login: async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      const data = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Email ou mot de passe incorrect');
      }

      const token = data.data.token;
      
      if (!validateTokenFormat(token)) {
        console.error('❌ Token reçu invalide');
        throw new Error('Token invalide');
      }
      
      console.log('✅ Token valide, longueur:', token.length);
      
      localStorage.setItem(TOKEN_KEY, token);
      
      const userData = {
        id: data.data.userId,
        email: data.data.email,
        role: data.data.role,
        estValide: data.data.estValide,
        nom: data.data.nom || data.data.email?.split('@')[0] || 'Utilisateur',
        photoUrl: data.data.photoUrl || null
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      console.log('👤 Utilisateur connecté:', userData.nom);
      console.log('👤 Rôle:', userData.role);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur login:', error.message);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('NON_AUTHENTIFIE');
      }
      
      if (!validateTokenFormat(token)) {
        console.warn('⚠️ Token invalide, nettoyage...');
        removeToken();
        removeUser();
        throw new Error('SESSION_EXPIRED');
      }
      
      const data = await apiClient('/api/auth/me', { method: 'GET' });
      
      if (data.success && data.data) {
        setUser({
          id: data.data.id,
          email: data.data.email,
          role: data.data.role,
          estValide: data.data.estValide,
          nom: data.data.nom || data.data.email?.split('@')[0] || 'Utilisateur',
          photoUrl: data.data.photoUrl || null
        });
        return data;
      }
      throw new Error('Erreur récupération profil');
    } catch (error) {
      if (error.message === 'SESSION_EXPIRED') {
        removeToken();
        removeUser();
        window.location.href = '/login';
      }
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = getToken();
    const user = getUser();
    
    if (token && !validateTokenFormat(token)) {
      console.warn('⚠️ Token invalide dans isAuthenticated');
      removeToken();
      removeUser();
      return false;
    }
    
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

  getNomComplet: () => {
    const user = getUser();
    return user?.nom || 'Utilisateur';
  },

  getPhotoUrl: () => {
    const user = getUser();
    return user?.photoUrl || null;
  },

  validateAndCleanToken: () => {
    const token = getToken();
    if (!token) return false;
    
    if (!validateTokenFormat(token)) {
      console.warn('⚠️ Token invalide, nettoyage...');
      removeToken();
      removeUser();
      return false;
    }
    
    return true;
  },

  logout: () => {
    console.log('🚪 Déconnexion');
    removeToken();
    removeUser();
    window.location.href = '/login';
  },

  // ✅ EXPOSER TOUTES LES FONCTIONS
  getToken,
  getUser,
  setUser,      // ✅ AJOUTÉ
  removeUser,   // ✅ AJOUTÉ
  setToken,     // ✅ AJOUTÉ
  removeToken,  // ✅ AJOUTÉ
};

export default authApi;