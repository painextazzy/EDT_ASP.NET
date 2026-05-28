// src/services/api.js

// Configuration depuis .env
const API_URL = import.meta.env.VITE_API_URL ;

// Client API générique
const apiClient = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Si la réponse n'est pas OK (4xx ou 5xx)
    if (!response.ok) {
      // On tente de lire le texte brut au cas où ce n'est pas du JSON
      const errorText = await response.text();
      console.error("Détail de l'erreur serveur :", errorText);
      throw new Error(errorText || 'Une erreur est survenue');
    }

    // Si OK, on parse le JSON
    return await response.json();
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error.message);
    throw error;
  }
};

// ============================================
// API INSCRIPTION (à compléter au fur et à mesure)
// ============================================

export const inscriptionApi = {
  // Inscription professeur
  inscrireProfesseur: (data) => 
    apiClient('/api/inscription/professeur', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
};

// Export unique
const api = {
  inscription: inscriptionApi,
};

export default api;