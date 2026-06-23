// src/components/Salle.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import api from '../services/api';
import connection from '../services/signalRService';
import * as signalR from "@microsoft/signalr";
import { 
  Search, Plus, Settings, Edit, Trash2, Clock, Layers, CheckCircle, AlertCircle, X, Building, User, Calendar, MoreVertical
} from 'lucide-react';

const allEtages = ["Rez-de-chaussée", "Etage 1", "Etage 2", "Etage 3", "Etage 4"];

// Composant Toast
const Toast = ({ message, type, onClose }) => {
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-down">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white min-w-[300px]`}>
        {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button onClick={onClose} className="hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Composant Skeleton
const SalleCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
    <div className="h-1 bg-gray-200" />
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-3 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mb-2" />
          <div className="h-7 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// ========== COMPOSANT PRINCIPAL ==========
const Salle = () => {
  const [salles, setSalles] = useState([]);
  const [batiments, setBatiments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBatiment, setFilterBatiment] = useState("");
  const [filterEtage, setFilterEtage] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [addFormData, setAddFormData] = useState({ numero: "", batiment: "", etage: "" });
  const [editFormData, setEditFormData] = useState({ numero: "", batiment: "", etage: "" });
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const connectionStarted = useRef(false);

  // ========== CHARGEMENT INITIAL VIA API ==========
  const loadSalles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterBatiment) params.append('batiment', filterBatiment);
      if (filterEtage !== "") params.append('etage', filterEtage);
      
      const data = await api.salle.getAll(params.toString() ? `?${params.toString()}` : '');
      setSalles(data || []);
    } catch (error) {
      console.error("❌ Erreur chargement salles:", error);
      setSalles([]);
    } finally {
      setLoading(false);
    }
  };

// 1. GESTION SIGNALR ROBUSTE
useEffect(() => {
  let isMounted = true;

  const startSignalR = async () => {
    try {
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        await connection.start();
      }
      // On demande juste l'état initial, le backend s'occupe du reste
      await connection.invoke("SendSalleStatus");
    } catch (err) {
      console.error("❌ Erreur SignalR:", err);
      // Tentative de reconnexion auto après 5s
      setTimeout(startSignalR, 5000);
    }
  };

  startSignalR();

  // centralisation de la mise à jour
  const updateState = (data) => {
    if (isMounted) {
      setSalles(data || []);
      setLoading(false);
    }
  };

  connection.on("SallesUpdated", updateState);
  connection.on("SalleUpdated", (data) => {
    if (isMounted) {
      setSalles(prev => prev.map(s => s.id === data.id ? data : s));
    }
  });

  return () => {
    isMounted = false;
    connection.off("SallesUpdated", updateState);
    connection.off("SalleUpdated");
  };
}, []);

// 2. MODIFICATION DES ACTIONS CRUD
// Supprimez "await loadSalles()" de vos fonctions :
// handleAddRoom, handleEditRoom, handleDeleteRoom.
// Laissez votre backend envoyer le message "SallesUpdated" à la fin de son exécution.

// 3. FILTRAGE EFFICACE (Client-side)
// Si vous voulez garder les filtres actifs, n'utilisez PAS loadSalles dans le useEffect
// Si vos filtres sont serveur-side, ajoutez une condition de chargement.
useEffect(() => {
  if (!loading) {
     // Si les filtres sont locaux, le useMemo actuel (présent dans votre code) 
     // suffit largement et est beaucoup plus performant.
     // Si vos filtres sont côté serveur, utilisez un debounce pour éviter 
     // de surcharger l'API.
  }
}, [search, filterBatiment, filterEtage]);
  // ========== FILTRAGE ==========
  const filteredSalles = useMemo(() => {
    let result = salles || [];
    
    if (search) {
      result = result.filter(s => 
        s.numero?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filterBatiment) {
      result = result.filter(s => s.batiment === filterBatiment);
    }
    
    if (filterEtage) {
      result = result.filter(s => s.etage === filterEtage);
    }
    
    return result;
  }, [salles, search, filterBatiment, filterEtage]);

  // ========== GROUPEMENT ==========
  const groupedData = useMemo(() => {
    const groups = (filteredSalles || []).reduce((acc, salle) => {
      const bId = salle.batiment || 'A';
      if (!acc[bId]) {
        acc[bId] = {
          id: bId,
          label: `Bâtiment ${bId}`,
          salles: []
        };
      }
      acc[bId].salles.push(salle);
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => a.id.localeCompare(b.id));
  }, [filteredSalles]);

  // ========== TOAST ==========
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };


// ========== CRUD ==========
const handleDeleteRoom = async (salleId, salleNumero) => {
  if (window.confirm(`Supprimer la salle "${salleNumero}" ?`)) {
    try {
      await api.salle.delete(salleId);
      // Rechargement après suppression
      await connection.invoke("SendSalleStatus");
      showToast(`Salle supprimée avec succès`, 'success');
    } catch (error) {
      showToast("Erreur lors de la suppression", 'error');
    }
  }
  setShowMenuId(null);
};

const handleAddRoom = async () => {
  setAddError('');
  if (!validateAddForm()) return;
  
  setSubmitting(true);
  try {
    // 1. On envoie l'insertion au serveur
    await api.salle.create({
      numero: addFormData.numero.trim(),
      batiment: addFormData.batiment,
      etage: addFormData.etage
    });

    // 2. On demande au serveur de rediffuser l'état à TOUT LE MONDE
    // C'est le serveur qui doit inclure les "cours en cours" dans cette réponse.
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke("SendSalleStatus");
    } else {
      // Fallback : si SignalR est coupé, on charge manuellement
      await loadSalles();
    }
    
    setShowAddModal(false);
    resetAddModal();
    showToast(`Salle ajoutée avec succès`, 'success');
  } catch (error) {
    setAddError("Erreur lors de l'ajout");
  } finally {
    setSubmitting(false);
  }
};

const handleEditRoom = async () => {
  setEditError('');
  if (!validateEditForm()) return;
  
  setSubmitting(true);
  try {
    await api.salle.update(editingSalle.id, {
      numero: editFormData.numero.trim(),
      batiment: editFormData.batiment,
      etage: editFormData.etage
    });
    
    // Rechargement après modification
    await connection.invoke("SendSalleStatus");
    
    setShowEditModal(false);
    resetEditModal();
    showToast(`Salle modifiée avec succès`, 'success');
  } catch (error) {
    console.error(error);
    setEditError("Erreur lors de la modification");
  } finally {
    setSubmitting(false);
  }
};

  const validateAddForm = () => {
    const newErrors = {};
    if (!addFormData.numero.trim()) newErrors.numero = "Le numéro est requis";
    if (!addFormData.batiment) newErrors.batiment = "Sélectionnez un bâtiment";
    if (!addFormData.etage) newErrors.etage = "Sélectionnez un étage";
    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.numero.trim()) newErrors.numero = "Le numéro est requis";
    if (!editFormData.batiment) newErrors.batiment = "Sélectionnez un bâtiment";
    if (!editFormData.etage) newErrors.etage = "Sélectionnez un étage";
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetAddModal = () => {
    setAddFormData({ numero: "", batiment: "", etage: "" });
    setAddErrors({});
    setAddError('');
  };

  const resetEditModal = () => {
    setEditFormData({ numero: "", batiment: "", etage: "" });
    setEditErrors({});
    setEditError('');
    setEditingSalle(null);
  };

  const openEditModal = (salle) => {
    setEditingSalle(salle);
    setEditFormData({
      numero: salle.numero || "",
      batiment: salle.batiment || "",
      etage: salle.etage || ""
    });
    setEditErrors({});
    setEditError('');
    setShowEditModal(true);
    setShowMenuId(null);
  };

  // ========== RENDU ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans p-6 md:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une salle..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterBatiment}
          onChange={(e) => setFilterBatiment(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer"
        >
          <option value="">Tous les bâtiments</option>
          <option value="A">Bâtiment A</option>
          <option value="B">Bâtiment B</option>
          <option value="C">Bâtiment C</option>
          <option value="D">Bâtiment D</option>
        </select>
        <select
          value={filterEtage}
          onChange={(e) => setFilterEtage(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer"
        >
          <option value="">Tous les étages</option>
          {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {salles?.length || 0} salles
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SalleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredSalles.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-1">Aucune salle</h3>
          <p className="text-gray-400 text-sm">Aucune salle ne correspond à vos critères</p>
        </div>
      )}

      {/* SALLES */}
      {!loading && groupedData.map((batiment) => (
        <div key={batiment.id} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-8 bg-sky-500 rounded-full" />
            <h2 className="text-xl font-semibold text-gray-800">{batiment.label}</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {batiment.salles.length} salle(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batiment.salles.map((salle) => {
              const estOccupee = salle.estOccupee === true || salle.statut === "OCCUPÉ";
              
              return (
                <div
                  key={salle.id}
                  className={`bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${
                    estOccupee ? 'border-amber-300 shadow-amber-100' : 'border-green-300 shadow-green-100'
                  }`}
                >
                  {/* ✅ Bandeau de statut - Couleur unie (pas gradient) */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    estOccupee ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  
                  <div className="p-5 pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Salle</div>
                        <div className="text-2xl font-bold text-gray-800">{salle.numero}</div>
                      </div>
                      {/* ✅ Badge - Couleur unie (pas gradient) */}
                      <div className={`px-3 py-1.5 rounded-full text-white text-[11px] font-semibold ${
                        estOccupee ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`}>
                        {estOccupee ? 'OCCUPÉ' : 'LIBRE'}
                      </div>
                    </div>

                    {/* Cours en cours */}
                    {estOccupee && salle.courActuel && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Cours en cours</span>
                        </div>
                        <p className="text-sm font-bold text-amber-800">{salle.courActuel}</p>
                        {salle.enseignant && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600">
                            <User className="w-3 h-3" />
                            <span>{salle.enseignant}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!estOccupee && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 py-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Aucun cours</span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {salle.batiment && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Building className="w-3.5 h-3.5 inline mr-1" /> 
                          Bât. {salle.batiment}
                        </span>
                      )}
                      {salle.etage && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Layers className="w-3.5 h-3.5 inline mr-1" /> 
                          {salle.etage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ Bouton action ... vertical (UNIQUEMENT si la salle est LIBRE) */}
                  {!estOccupee && (
                    <div className="absolute bottom-3 right-3">
                      <button
                        onClick={() => setShowMenuId(showMenuId === salle.id ? null : salle.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {showMenuId === salle.id && (
                        <div className="absolute bottom-8 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                          <button
                            onClick={() => openEditModal(salle)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 rounded-t-xl transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(salle.id, salle.numero)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ✅ Bouton + flottant en bas à droite */}
      <button
        onClick={() => {
          resetAddModal();
          setShowAddModal(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg shadow-sky-500/30 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* ===== MODAL AJOUT ===== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Ajouter une salle</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{addError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro *</label>
                <input
                  value={addFormData.numero}
                  onChange={(e) => setAddFormData({ ...addFormData, numero: e.target.value })}
                  placeholder="ex: A-102"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {addErrors.numero && <p className="text-red-500 text-xs mt-1">{addErrors.numero}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bâtiment *</label>
                <select
                  value={addFormData.batiment}
                  onChange={(e) => setAddFormData({ ...addFormData, batiment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="A">Bâtiment A</option>
                  <option value="B">Bâtiment B</option>
                  <option value="C">Bâtiment C</option>
                  <option value="D">Bâtiment D</option>
                </select>
                {addErrors.batiment && <p className="text-red-500 text-xs mt-1">{addErrors.batiment}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Étage *</label>
                <select
                  value={addFormData.etage}
                  onChange={(e) => setAddFormData({ ...addFormData, etage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                {addErrors.etage && <p className="text-red-500 text-xs mt-1">{addErrors.etage}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handleAddRoom} disabled={submitting} className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL MODIFICATION ===== */}
      {showEditModal && editingSalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Modifier la salle</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{editError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro *</label>
                <input
                  value={editFormData.numero}
                  onChange={(e) => setEditFormData({ ...editFormData, numero: e.target.value })}
                  placeholder="ex: A-102"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {editErrors.numero && <p className="text-red-500 text-xs mt-1">{editErrors.numero}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bâtiment *</label>
                <select
                  value={editFormData.batiment}
                  onChange={(e) => setEditFormData({ ...editFormData, batiment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="A">Bâtiment A</option>
                  <option value="B">Bâtiment B</option>
                  <option value="C">Bâtiment C</option>
                  <option value="D">Bâtiment D</option>
                </select>
                {editErrors.batiment && <p className="text-red-500 text-xs mt-1">{editErrors.batiment}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Étage *</label>
                <select
                  value={editFormData.etage}
                  onChange={(e) => setEditFormData({ ...editFormData, etage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                {editErrors.etage && <p className="text-red-500 text-xs mt-1">{editErrors.etage}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handleEditRoom} disabled={submitting} className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Salle;