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
      let errorData;
      try {
        const text = await response.text();
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { message: 'Une erreur est survenue' };
      }
      
      const error = new Error();
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ========== VALIDATION DES ENSEIGNANTS (ADMIN) ==========
export const validationApi = {
  getEnseignantsEnAttente: () => 
    apiClient('/api/validation/enseignants-en-attente', { method: 'GET' }),
  
  validerEnseignant: (id) => 
    apiClient(`/api/validation/valider/${id}`, { method: 'PUT' }),
  
  refuserEnseignant: (id) => 
    apiClient(`/api/validation/refuser/${id}`, { method: 'DELETE' }),
};

// ========== PARTIE EXISTANTE ==========
export const inscriptionApi = {
  inscrireProfesseur: (data) => 
    apiClient('/api/inscription/professeur', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
};

// ========== GESTION DES COURS ==========
export const coursApi = {
  getAll: () => 
    apiClient('/api/Cours', { method: 'GET' }),
  
  getById: (id) => 
    apiClient(`/api/Cours/${id}`, { method: 'GET' }),
  
  create: (data) => 
    apiClient('/api/Cours', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  update: (id, data) => 
    apiClient(`/api/Cours/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  delete: (id) => 
    apiClient(`/api/Cours/${id}`, { method: 'DELETE' }),
};

// ========== GESTION DES AFFECTATIONS ==========
export const affectationApi = {
  getAll: () => 
    apiClient('/api/Affectation', { method: 'GET' }),
  
  getMentions: () => 
    apiClient('/api/Affectation/mentions', { method: 'GET' }),
  
  getNiveaux: () => 
    apiClient('/api/Affectation/niveaux', { method: 'GET' }),
  
  getProfesseurs: () => 
    apiClient('/api/Affectation/professeurs', { method: 'GET' }),
  
  create: (data) => 
    apiClient('/api/Affectation', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  update: (id, data) => 
    apiClient(`/api/Affectation/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  delete: (id) => 
    apiClient(`/api/Affectation/${id}`, { method: 'DELETE' }),

   checkExists: (params) => {
    const queryString = new URLSearchParams({
      coursId: params.coursId,
      professeurId: params.professeurId,
      mention: params.mention,
      niveau: params.niveau
    }).toString();
    return apiClient(`/api/Affectation/exists?${queryString}`, { method: 'GET' });
  },
};


// ========== GESTION DES SALLES ==========
export const salleApi = {
  getAll: (params = '') => 
    apiClient(`/api/Salle${params}`, { method: 'GET' }),
  
  getBatiments: () => 
    apiClient('/api/Salle/batiments', { method: 'GET' }),
  
  create: (data) => {
    const backendData = {
      numero: data.numero,
      batiment: data.batiment,
      etage: data.etage,
      statut: data.statut || "LIBRE",
      courActuel: data.courActuel || null
    };
    
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

// ========== GESTION DES NIVEAUX ==========
export const niveauApi = {
  getAll: () => 
    apiClient('/api/Niveau', { method: 'GET' }),
  
  getById: (id) => 
    apiClient(`/api/Niveau/${id}`, { method: 'GET' }),
  
  create: (data) => 
    apiClient('/api/Niveau', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  update: (id, data) => 
    apiClient(`/api/Niveau/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  delete: (id) => 
    apiClient(`/api/Niveau/${id}`, { method: 'DELETE' }),
};

// ========== GESTION DES PARCOURS ==========
export const parcoursApi = {
  getAll: () => 
    apiClient('/api/Parcours', { method: 'GET' }),
  
  getById: (id) => 
    apiClient(`/api/Parcours/${id}`, { method: 'GET' }),
  
  create: (data) => 
    apiClient('/api/Parcours', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  update: (id, data) => 
    apiClient(`/api/Parcours/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  delete: (id) => 
    apiClient(`/api/Parcours/${id}`, { method: 'DELETE' }),
};

// ========== GESTION DES ENSEIGNANTS ==========
export const enseignantApi = {
  getValides: () => 
    apiClient('/api/Enseignant/valides', { method: 'GET' }),
  
  delete: (id) => 
    apiClient(`/api/Enseignant/${id}`, { method: 'DELETE' }),
};

// ========== GESTION DES BACKUPS ==========
export const backupApi = {
  export: async (config = {}) => {
    try {
      const response = await fetch(`${API_URL}/api/backup/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export réussi' };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  import: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/backup/import`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'import');
      }

      return await response.json();
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  },

  validateFile: (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.name.endsWith('.json')) {
        reject(new Error('Veuillez sélectionner un fichier JSON valide'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve({
            valid: true,
            foundTables: Object.keys(data).filter(k => !['exportDate', 'version'].includes(k)),
            exportDate: data.exportDate,
            version: data.version,
            hasData: true,
            counts: {
              enseignants: data.enseignants?.length || 0,
              utilisateurs: data.utilisateurs?.length || 0,
              cours: data.cours?.length || 0,
              niveaux: data.niveaux?.length || 0,
              parcours: data.parcours?.length || 0,
              enseignements: data.enseignements?.length || 0
            }
          });
        } catch (error) {
          reject(new Error('Fichier JSON invalide'));
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file);
    });
  }
};

// ========== SERVICE POUR LES DÉLÉGUÉS ==========
export const delegueApi = {
  getAll: () => apiClient('/api/Delegue', { method: 'GET' }),
  create: (data) => apiClient('/api/Delegue', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id, data) => apiClient(`/api/Delegue/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id) => apiClient(`/api/Delegue/${id}`, { method: 'DELETE' }),
};

// ========== SERVICE POUR LE PLANNING (CALENDRIER) ==========
export const planningApi = {
  // Récupérer tous les événements (ADMIN)
  getAll: () => 
    apiClient('/api/Planning', { method: 'GET' }),
  
  // ========== NOUVEAU : Récupérer les événements d'un enseignant par son ID ==========
  getByEnseignantId: (enseignantId) => 
    apiClient(`/api/Planning/enseignant/${enseignantId}`, { method: 'GET' }),
  
  // Récupérer les événements par plage de dates
  getByDateRange: (startDate, endDate) => 
    apiClient(`/api/Planning/range?start=${startDate}&end=${endDate}`, { method: 'GET' }),
  
  // Récupérer les événements d'un enseignement
  getByEnseignement: (id) => 
    apiClient(`/api/Planning/enseignement/${id}`, { method: 'GET' }),
  
  // Créer un événement
  create: (data) => 
    apiClient('/api/Planning', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  // Modifier un événement
  update: (id, data) => 
    apiClient(`/api/Planning/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  // Annuler un événement
  cancel: (id, motif) => 
    apiClient(`/api/Planning/${id}/annuler`, { 
      method: 'PATCH', 
      body: JSON.stringify({ motif: motif }) 
    }),
  
  // Supprimer un événement
  delete: (id) => 
    apiClient(`/api/Planning/${id}`, { method: 'DELETE' }),

  // ========== GESTION DES SALLES D'UN PLANNING ==========
  
  // Récupérer toutes les salles d'un planning
  getSallesByPlanning: (planningId) => 
    apiClient(`/api/PlanningSalle/planning/${planningId}`, { method: 'GET' }),
  
  // Ajouter une salle à un planning
  addSalleToPlanning: (planningId, salleId) => 
    apiClient('/api/PlanningSalle', { 
      method: 'POST', 
      body: JSON.stringify({ idPlanning: planningId, idSalle: salleId }) 
    }),
  
  // Retirer une salle d'un planning
  removeSalleFromPlanning: (planningId, salleId) => 
    apiClient(`/api/PlanningSalle?planningId=${planningId}&salleId=${salleId}`, { 
      method: 'DELETE' 
    }),
  
  // Récupérer tous les plannings d'une salle
  getPlanningsBySalle: (salleId) => 
    apiClient(`/api/PlanningSalle/salle/${salleId}`, { method: 'GET' }),

  // ========== VÉRIFICATIONS DE DISPONIBILITÉ ==========
  
  // Vérifier la disponibilité d'un professeur
  checkProfesseurDisponibilite: (professeurId, start, end, excludeId = null) => {
    let url = `/api/Planning/check-professeur?professeurId=${professeurId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return apiClient(url, { method: 'GET' });
  },

  // Vérifier la disponibilité d'une salle par nom
  checkSalleDisponibilite: (salleNom, start, end, excludeId = null) => {
    let url = `/api/Planning/check-salle?salleNom=${encodeURIComponent(salleNom)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return apiClient(url, { method: 'GET' });
  },

  // Vérifier la disponibilité d'une salle par ID
  checkSalleDisponibiliteById: (salleId, start, end, excludeId = null) => {
    let url = `/api/Planning/check-salle-by-id?salleId=${salleId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return apiClient(url, { method: 'GET' });
  },
};

// ========== SERVICE POUR PLANNING_SALLE ==========
export const planningSalleApi = {
  // Récupérer toutes les salles d'un planning
  getSallesByPlanning: (planningId) => 
    apiClient(`/api/PlanningSalle/planning/${planningId}`, { method: 'GET' }),
  
  // Ajouter une salle à un planning
  addSalleToPlanning: (planningId, salleId) => 
    apiClient('/api/PlanningSalle', { 
      method: 'POST', 
      body: JSON.stringify({ idPlanning: planningId, idSalle: salleId }) 
    }),
  
  // Retirer une salle d'un planning
  removeSalleFromPlanning: (planningId, salleId) => 
    apiClient(`/api/PlanningSalle?planningId=${planningId}&salleId=${salleId}`, { 
      method: 'DELETE' 
    }),
  
  // Récupérer tous les plannings d'une salle
  getPlanningsBySalle: (salleId) => 
    apiClient(`/api/PlanningSalle/salle/${salleId}`, { method: 'GET' }),
};

// ========== SERVICE POUR LE DASHBOARD ==========
export const dashboardApi = {
  // Récupérer les statistiques du dashboard avec filtrage par période
  getStats: (period = 'month') => 
    apiClient(`/api/Dashboard/stats?period=${period}`, { method: 'GET' }),
};

const api = {
  inscription: inscriptionApi,
  cours: coursApi,
  affectation: affectationApi,
  validation: validationApi,
  salle: salleApi,
  delegue: delegueApi,
  backup: backupApi,
  enseignant: enseignantApi,
  parcours: parcoursApi,
  niveau: niveauApi,
  planning: planningApi,  // ← NOUVEAU
  planningSalle: planningSalleApi,  // ← NOUVEAU
  dashboard: dashboardApi,  // ← NOUVEAU
};

export default api;