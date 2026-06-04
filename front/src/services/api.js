

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

// ========== VALIDATION DES ENSEIGNANTS (ADMIN) ==========
export const validationApi = {
  // Lister les enseignants en attente
  getEnseignantsEnAttente: () => 
    apiClient('/api/validation/enseignants-en-attente', { method: 'GET' }),
  
  // Valider un enseignant
  validerEnseignant: (id) => 
    apiClient(`/api/validation/valider/${id}`, { method: 'PUT' }),
  
  // Refuser un enseignant
  refuserEnseignant: (id) => 
    apiClient(`/api/validation/refuser/${id}`, { method: 'DELETE' }),
};

// ========== PARTIE EXISTANTE (ne pas toucher) ==========
export const inscriptionApi = {
  inscrireProfesseur: (data) => 
    apiClient('/api/inscription/professeur', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
};

// ========== NOUVELLES FONCTIONS POUR LA GESTION DES COURS ==========

// Service pour les Cours
export const coursApi = {
  // Récupérer tous les cours
  getAll: () => 
    apiClient('/api/Cours', { method: 'GET' }),
  
  // Récupérer un cours par ID
  getById: (id) => 
    apiClient(`/api/Cours/${id}`, { method: 'GET' }),
  
  // Créer un nouveau cours
  create: (data) => 
    apiClient('/api/Cours', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  // Modifier un cours
  update: (id, data) => 
    apiClient(`/api/Cours/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  // Supprimer un cours
  delete: (id) => 
    apiClient(`/api/Cours/${id}`, { method: 'DELETE' }),
};

// Service pour les Affectations
export const affectationApi = {
  // Récupérer toutes les affectations
  getAll: () => 
    apiClient('/api/Affectation', { method: 'GET' }),
  
  // Récupérer les mentions disponibles
  getMentions: () => 
    apiClient('/api/Affectation/mentions', { method: 'GET' }),
  
  // Récupérer les niveaux disponibles
  getNiveaux: () => 
    apiClient('/api/Affectation/niveaux', { method: 'GET' }),
  
  // Récupérer les professeurs disponibles
  getProfesseurs: () => 
    apiClient('/api/Affectation/professeurs', { method: 'GET' }),
  
  // Créer une nouvelle affectation
  create: (data) => 
    apiClient('/api/Affectation', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  // Modifier une affectation
  update: (id, data) => 
    apiClient(`/api/Affectation/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  // Supprimer une affectation
  delete: (id) => 
    apiClient(`/api/Affectation/${id}`, { method: 'DELETE' }),
};


// Service pour les Salles
// services/api.js - Modifie la partie salle
export const salleApi = {
  getAll: (params = '') => 
    apiClient(`/api/Salle${params}`, { method: 'GET' }),
  
  getBatiments: () => 
    apiClient('/api/Salle/batiments', { method: 'GET' }),
  
  create: (data) => {
    // Convertir les noms des propriétés pour correspondre au backend
    const backendData = {
      numero: data.numero,
      batiment: data.batiment,
      etage: data.etage,
      statut: data.statut || "LIBRE",
      courActuel: data.courActuel || null
    };
    
    console.log("Envoi au backend:", backendData);
    
    return apiClient('/api/Salle', { 
      method: 'POST', 
      body: JSON.stringify(backendData) 
    });
  },
  
  update: (id, data) => {
    const backendData = {
      numero: data.numero,
      batiment: data.batiment,
      etage: data.etage,
      statut: data.statut,
      courActuel: data.courActuel
    };
    
    return apiClient(`/api/Salle/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(backendData) 
    });
  },
  
  delete: (id) => 
    apiClient(`/api/Salle/${id}`, { method: 'DELETE' }),
};

// ========== EXPORT PRINCIPAL (avec les nouvelles API) ==========
const api = {
  inscription: inscriptionApi,
  cours: coursApi,
  affectation: affectationApi,
  validation: validationApi,
  salle: salleApi,
};

export default api;