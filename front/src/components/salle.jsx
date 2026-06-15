// src/components/Salle.jsx
import React, { useState, useMemo, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Plus, 
  Settings, 
  Edit, 
  Trash2,
  Clock,
  Layers,
  CheckCircle,
  AlertCircle,
  X,
  Building
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Skeleton from './ui/Skeleton';

const buildingColors = {
  A: { color: "#6366f1", bgColor: "bg-indigo-50" },
  B: { color: "#10b981", bgColor: "bg-emerald-50" },
  C: { color: "#f59e0b", bgColor: "bg-amber-50" },
  D: { color: "#ef4444", bgColor: "bg-rose-50" },
};

const etageLabels = {
  "Rez-de-chaussée": "Rez-de-chaussée",
  "Etage 1": "Etage 1",
  "Etage 2": "Etage 2",
  "Etage 3": "Etage 3",
  "Etage 4": "Etage 4",
};

const allEtages = ["Rez-de-chaussée", "Etage 1", "Etage 2", "Etage 3", "Etage 4"];

// Composant Toast de notification sans emoji
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
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

// Composant Skeleton pour une carte de salle
const SalleCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

const Salle = () => {
  const [salles, setSalles] = useState([]);
  const [batiments, setBatiments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBatiment, setFilterBatiment] = useState("");
  const [filterEtage, setFilterEtage] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [editingSalle, setEditingSalle] = useState(null);
  const [newSalle, setNewSalle] = useState({ numero: "", batiment: "", etage: "" });

  // États pour les erreurs de validation
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  // Validation pour empêcher les caractères spéciaux (uniquement lettres, chiffres, tiret, espace)
  const validateAlphanumeric = (value) => {
    const regex = /^[a-zA-Z0-9\s\-]+$/;
    return regex.test(value);
  };

  // Validation du formulaire d'ajout
  const validateAddForm = () => {
    const newErrors = {};
    
    if (!newSalle.numero.trim()) {
      newErrors.numero = "Le numéro de la salle est requis";
    } else if (!validateAlphanumeric(newSalle.numero)) {
      newErrors.numero = "Le numéro ne peut contenir que des lettres, chiffres, espaces et tirets";
    } else if (newSalle.numero.length < 2) {
      newErrors.numero = "Le numéro doit contenir au moins 2 caractères";
    }
    
    if (!newSalle.batiment) {
      newErrors.batiment = "Veuillez sélectionner un bâtiment";
    }
    
    if (!newSalle.etage) {
      newErrors.etage = "Veuillez sélectionner un étage";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation du formulaire de modification
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editingSalle.numero.trim()) {
      newErrors.numero = "Le numéro de la salle est requis";
    } else if (!validateAlphanumeric(editingSalle.numero)) {
      newErrors.numero = "Le numéro ne peut contenir que des lettres, chiffres, espaces et tirets";
    } else if (editingSalle.numero.length < 2) {
      newErrors.numero = "Le numéro doit contenir au moins 2 caractères";
    }
    
    if (!editingSalle.batiment) {
      newErrors.batiment = "Veuillez sélectionner un bâtiment";
    }
    
    if (!editingSalle.etage) {
      newErrors.etage = "Veuillez sélectionner un étage";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Effacer les erreurs quand on ferme les modales
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewSalle({ numero: "", batiment: "", etage: "" });
    setErrors({});
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSalle(null);
    setErrors({});
  };

  // Charger les salles depuis l'API
  const loadSalles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterBatiment) params.append('batiment', filterBatiment);
      if (filterEtage !== "") params.append('etage', filterEtage);
      
      const queryString = params.toString();
      const data = await api.salle.getAll(queryString ? `?${queryString}` : '');
      setSalles(data);
    } catch (error) {
      console.error("Erreur lors du chargement des salles:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des salles";
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les bâtiments depuis l'API
  const loadBatiments = async () => {
    try {
      const data = await api.salle.getBatiments();
      setBatiments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des bâtiments:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des bâtiments";
      showToast(errorMessage, 'error');
    }
  };

  useEffect(() => {
    loadSalles();
  }, [search, filterBatiment, filterEtage]);

  useEffect(() => {
    loadBatiments();
  }, []);

  // Ajouter une salle
  const handleAddRoom = async () => {
    if (!validateAddForm()) return;
    
    try {
      const dataToSend = {
        numero: newSalle.numero.trim(),
        batiment: newSalle.batiment,
        etage: newSalle.etage
      };
      
      await api.salle.create(dataToSend);
      closeAddModal();
      loadSalles();
      loadBatiments();
      showToast(`Salle "${newSalle.numero}" ajoutée avec succès`, 'success');
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout de la salle";
      showToast(errorMessage, 'error');
    }
  };

  // Modifier une salle
  const handleEditRoom = async () => {
    if (!validateEditForm()) return;
    
    try {
      const dataToSend = {
        numero: editingSalle.numero.trim(),
        batiment: editingSalle.batiment,
        etage: editingSalle.etage
      };
      
      await api.salle.update(editingSalle.id, dataToSend);
      closeEditModal();
      loadSalles();
      loadBatiments();
      showToast(`Salle "${editingSalle.numero}" modifiée avec succès`, 'success');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la modification";
      showToast(errorMessage, 'error');
    }
  };

  // Supprimer une salle
  const handleDeleteRoom = async (salleId, salleNumero) => {
    if (window.confirm(`Supprimer la salle "${salleNumero}" ?`)) {
      try {
        await api.salle.delete(salleId);
        loadSalles();
        loadBatiments();
        showToast(`Salle "${salleNumero}" supprimée avec succès`, 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
        showToast(errorMessage, 'error');
      }
    }
    setShowMenuId(null);
  };

  // Grouper par bâtiment
  const groupedData = useMemo(() => {
    const groups = salles.reduce((acc, salle) => {
      const bId = salle.batiment;
      if (!acc[bId]) {
        acc[bId] = {
          id: bId,
          label: `Batiment ${bId}`,
          color: buildingColors[bId]?.color || "#64748b",
          bgColor: buildingColors[bId]?.bgColor || "bg-slate-50",
          salles: []
        };
      }
      acc[bId].salles.push(salle);
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => a.id.localeCompare(b.id));
  }, [salles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans p-6 md:p-8">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm mt-1">Gérez vos salles et leur disponibilité</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par numéro..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 shadow-sm transition-all"
          />
        </div>
        <select
          value={filterBatiment}
          onChange={(e) => setFilterBatiment(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
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
          className="px-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
        >
          <option value="">Tous les étages</option>
          {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Loading avec Squelettes */}
      {loading && (
        <div>
          {[1, 2].map((batimentIdx) => (
            <div key={batimentIdx} className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SalleCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aucune donnée */}
      {!loading && salles.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300 flex items-center justify-center bg-gray-100 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p>Aucune salle trouvée</p>
        </div>
      )}

      {/* Bâtiments */}
      {!loading && groupedData.map((batiment, index) => (
        <div key={batiment.id} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-1 h-8 rounded-full ${batiment.bgColor}`} style={{ backgroundColor: batiment.color }} />
            <h2 className="text-xl font-semibold text-gray-800">{batiment.label}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{batiment.salles.length} salle(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add card */}
            {index === 0 && (
              <div
                onClick={() => setShowAddModal(true)}
                className="group border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 min-h-[280px] bg-white/50 backdrop-blur-sm"
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-gray-300 flex items-center justify-center group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300 group-hover:bg-indigo-100">
                  <Plus className="w-7 h-7 text-gray-400 group-hover:text-indigo-500" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-indigo-500">Ajouter une salle</span>
              </div>
            )}

            {/* Salle cards */}
            {batiment.salles.map((salle) => {
              const libre = salle.statut === "LIBRE";
              return (
                <div
                  key={salle.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${libre ? 'bg-green-500' : 'bg-red-500'}`} />
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Salle</div>
                        <div className="text-2xl font-bold text-gray-800">{salle.numero}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-semibold shadow-sm ${libre ? 'bg-green-500' : 'bg-red-500'}`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {salle.statut}
                      </div>
                    </div>

                    {/* Ajout du bâtiment dans la carte */}
                    <div className="flex items-center gap-2 mb-3 bg-indigo-50 rounded-xl p-2">
                      <Building className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-medium text-indigo-700">
                        Batiment {salle.batiment}
                      </span>
                    </div>

                    {!libre && salle.courActuel && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider">Cours actuel</span>
                        </div>
                        <p className="text-sm font-medium text-amber-800">{salle.courActuel}</p>
                      </div>
                    )}

                    {libre && (
                      <div className="flex items-center gap-2 text-xs italic text-gray-400 mb-4 py-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Aucun cours en cours</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {salle.etage && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-xl text-[11px] font-medium text-gray-600">
                          <Layers className="w-3.5 h-3.5" /> {salle.etage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setShowMenuId(showMenuId === salle.id ? null : salle.id)}
                      className="p-2 rounded-xl hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                    {showMenuId === salle.id && (
                      <div className="absolute bottom-10 right-0 bg-white rounded-xl shadow-lg border py-1 z-20 min-w-[140px] animate-fadeIn">
                        <button
                          onClick={() => {
                            setEditingSalle(salle);
                            setShowEditModal(true);
                            setShowMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl"
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(salle.id, salle.numero)}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl"
                        >
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal Ajout avec validation */}
      <Dialog open={showAddModal} onOpenChange={closeAddModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ajouter une salle</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Numéro de la salle <span className="text-red-500">*</span></Label>
              <Input
                placeholder="ex: A-102 ou B201"
                value={newSalle.numero}
                onChange={(e) => {
                  // Permet seulement lettres, chiffres, tiret, espace
                  const value = e.target.value;
                  if (value === "" || /^[a-zA-Z0-9\s-]*$/.test(value)) {
                    setNewSalle({ ...newSalle, numero: value });
                  }
                }}
                className={`rounded-xl ${errors.numero ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.numero && <p className="text-xs text-red-500">{errors.numero}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Bâtiment <span className="text-red-500">*</span></Label>
              <select
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.batiment ? 'border-red-500' : 'border-gray-200'}`}
                value={newSalle.batiment}
                onChange={(e) => setNewSalle({ ...newSalle, batiment: e.target.value })}
              >
                <option value="">Sélectionner un bâtiment</option>
                <option value="A">Bâtiment A</option>
                <option value="B">Bâtiment B</option>
                <option value="C">Bâtiment C</option>
                <option value="D">Bâtiment D</option>
              </select>
              {errors.batiment && <p className="text-xs text-red-500">{errors.batiment}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Étage <span className="text-red-500">*</span></Label>
              <select
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.etage ? 'border-red-500' : 'border-gray-200'}`}
                value={newSalle.etage}
                onChange={(e) => setNewSalle({ ...newSalle, etage: e.target.value })}
              >
                <option value="">Sélectionner un étage</option>
                <option value="Rez-de-chaussée">Rez-de-chaussée</option>
                <option value="Etage 1">Etage 1</option>
                <option value="Etage 2">Etage 2</option>
                <option value="Etage 3">Etage 3</option>
                <option value="Etage 4">Etage 4</option>
              </select>
              {errors.etage && <p className="text-xs text-red-500">{errors.etage}</p>}
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={closeAddModal} className="rounded-xl">Annuler</Button>
            <Button onClick={handleAddRoom} className="bg-indigo-500 hover:bg-indigo-600 rounded-xl">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Modification avec validation */}
      <Dialog open={showEditModal} onOpenChange={closeEditModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Modifier la salle</DialogTitle>
          </DialogHeader>
          {editingSalle && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Numéro de la salle <span className="text-red-500">*</span></Label>
                <Input
                  value={editingSalle.numero}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^[a-zA-Z0-9\s-]*$/.test(value)) {
                      setEditingSalle({ ...editingSalle, numero: value });
                    }
                  }}
                  className={`rounded-xl ${errors.numero ? 'border-red-500' : ''}`}
                />
                {errors.numero && <p className="text-xs text-red-500">{errors.numero}</p>}
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700">Bâtiment <span className="text-red-500">*</span></Label>
                <select
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${errors.batiment ? 'border-red-500' : 'border-gray-200'}`}
                  value={editingSalle.batiment}
                  onChange={(e) => setEditingSalle({ ...editingSalle, batiment: e.target.value })}
                >
                  <option value="A">Bâtiment A</option>
                  <option value="B">Bâtiment B</option>
                  <option value="C">Bâtiment C</option>
                  <option value="D">Bâtiment D</option>
                </select>
                {errors.batiment && <p className="text-xs text-red-500">{errors.batiment}</p>}
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700">Étage <span className="text-red-500">*</span></Label>
                <select
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${errors.etage ? 'border-red-500' : 'border-gray-200'}`}
                  value={editingSalle.etage || ""}
                  onChange={(e) => setEditingSalle({ ...editingSalle, etage: e.target.value })}
                >
                  <option value="">Sélectionner un étage</option>
                  <option value="Rez-de-chaussée">Rez-de-chaussée</option>
                  <option value="Etage 1">Etage 1</option>
                  <option value="Etage 2">Etage 2</option>
                  <option value="Etage 3">Etage 3</option>
                  <option value="Etage 4">Etage 4</option>
                </select>
                {errors.etage && <p className="text-xs text-red-500">{errors.etage}</p>}
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={closeEditModal} className="rounded-xl">Annuler</Button>
            <Button onClick={handleEditRoom} className="bg-indigo-500 hover:bg-indigo-600 rounded-xl">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Salle;