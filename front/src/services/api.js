// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL;

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

    if (!response.ok) {
      // On tente de parser le JSON pour obtenir un message clair (ex: {"message": "..."})
      // S'il n'y a pas de JSON, on se rabat sur le texte brut
      let errorData;
      try {
        const text = await response.text();
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { message: 'Une erreur est survenue' };
      }
      
      // On rejette l'erreur avec les données pour que le composant puisse les utiliser
      const error = new Error();
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (error) {
    // Ne plus rien logger ici. L'erreur est remontée au composant (InscriptionProfesseur.jsx)
    // qui se charge déjà de l'afficher via votre fonction 'getErrorMessage'
    throw error;
  }
};

export const inscriptionApi = {
  inscrireProfesseur: (data) => 
    apiClient('/api/inscription/professeur', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
};

const api = {
  inscription: inscriptionApi,
};

export default api;