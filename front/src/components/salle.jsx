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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const buildingColors = {
  A: { color: "#6b7280", bgColor: "bg-gray-100", textColor: "#4b5563", borderColor: "border-gray-200" },
  B: { color: "#6b7280", bgColor: "bg-gray-100", textColor: "#4b5563", borderColor: "border-gray-200" },
  C: { color: "#6b7280", bgColor: "bg-gray-100", textColor: "#4b5563", borderColor: "border-gray-200" },
  D: { color: "#6b7280", bgColor: "bg-gray-100", textColor: "#4b5563", borderColor: "border-gray-200" },
};

const allEtages = ["Rez-de-chaussée", "Etage 1", "Etage 2", "Etage 3", "Etage 4"];

// Composant Toast de notification (pour les succès uniquement)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

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

// Composant Skeleton pour une carte de salle
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

const Salle = () => {
  const [salles, setSalles] = useState([]);
  const [batiments, setBatiments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBatiment, setFilterBatiment] = useState("");
  const [filterEtage, setFilterEtage] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [editingSalle, setEditingSalle] = useState(null);
  
  // États pour les modaux
  const [addFormData, setAddFormData] = useState({ numero: "", batiment: "", etage: "" });
  const [editFormData, setEditFormData] = useState({ numero: "", batiment: "", etage: "" });
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  
  // États pour les erreurs globales des modaux (affichées dans le modal)
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  // Validation
  const validateAlphanumeric = (value) => {
    const regex = /^[a-zA-Z0-9\s\-]+$/;
    return regex.test(value);
  };

  // Vérifier si une salle existe déjà
  const checkSalleExists = (numero, batiment, etage, excludeId = null) => {
    return salles.some(salle => 
      salle.id !== excludeId &&
      salle.numero?.toLowerCase() === numero.trim().toLowerCase() && 
      salle.batiment === batiment && 
      salle.etage === etage
    );
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

  // Réinitialiser le modal d'ajout
  const resetAddModal = () => {
    setAddFormData({ numero: "", batiment: "", etage: "" });
    setAddErrors({});
    setAddError('');
  };

  // Réinitialiser le modal de modification
  const resetEditModal = () => {
    setEditFormData({ numero: "", batiment: "", etage: "" });
    setEditErrors({});
    setEditError('');
    setEditingSalle(null);
  };

  // Validation formulaire ajout
  const validateAddForm = () => {
    const newErrors = {};
    
    if (!addFormData.numero.trim()) {
      newErrors.numero = "Le numéro de la salle est requis";
    } else if (!validateAlphanumeric(addFormData.numero)) {
      newErrors.numero = "Le numéro ne peut contenir que des lettres, chiffres, espaces et tirets";
    } else if (addFormData.numero.length < 2) {
      newErrors.numero = "Le numéro doit contenir au moins 2 caractères";
    }
    
    if (!addFormData.batiment) {
      newErrors.batiment = "Veuillez sélectionner un bâtiment";
    }
    
    if (!addFormData.etage) {
      newErrors.etage = "Veuillez sélectionner un étage";
    }
    
    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation formulaire modification
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editFormData.numero.trim()) {
      newErrors.numero = "Le numéro de la salle est requis";
    } else if (!validateAlphanumeric(editFormData.numero)) {
      newErrors.numero = "Le numéro ne peut contenir que des lettres, chiffres, espaces et tirets";
    } else if (editFormData.numero.length < 2) {
      newErrors.numero = "Le numéro doit contenir au moins 2 caractères";
    }
    
    if (!editFormData.batiment) {
      newErrors.batiment = "Veuillez sélectionner un bâtiment";
    }
    
    if (!editFormData.etage) {
      newErrors.etage = "Veuillez sélectionner un étage";
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter une salle
  const handleAddRoom = async () => {
    setAddError('');
    
    if (!validateAddForm()) return;
    
    if (checkSalleExists(addFormData.numero, addFormData.batiment, addFormData.etage)) {
      setAddError(`Cette salle "${addFormData.numero}" existe déjà dans le bâtiment ${addFormData.batiment} au ${addFormData.etage}`);
      return;
    }
    
    setSubmitting(true);
    try {
      const dataToSend = {
        numero: addFormData.numero.trim(),
        batiment: addFormData.batiment,
        etage: addFormData.etage
      };
      
      await api.salle.create(dataToSend);
      setShowAddModal(false);
      resetAddModal();
      await loadSalles();
      await loadBatiments();
      showToast(`Salle "${addFormData.numero}" ajoutée avec succès`, 'success');
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      
      let errorMessage = "Erreur lors de l'ajout de la salle";
      
      if (error.response?.status === 409) {
        errorMessage = `Cette salle "${addFormData.numero}" existe déjà dans le bâtiment ${addFormData.batiment} au ${addFormData.etage}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setAddError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier une salle
  const handleEditRoom = async () => {
    setEditError('');
    
    if (!validateEditForm()) return;
    
    // Vérifier si une autre salle avec les mêmes infos existe déjà
    const salleExistante = salles.some(salle => 
      salle.id !== editingSalle?.id &&
      salle.numero?.toLowerCase() === editFormData.numero.trim().toLowerCase() && 
      salle.batiment === editFormData.batiment && 
      salle.etage === editFormData.etage
    );
    
    if (salleExistante) {
      setEditError(`Cette salle "${editFormData.numero}" existe déjà dans le bâtiment ${editFormData.batiment} au ${editFormData.etage}`);
      return;
    }
    
    setSubmitting(true);
    try {
      const dataToSend = {
        numero: editFormData.numero.trim(),
        batiment: editFormData.batiment,
        etage: editFormData.etage
      };
      
      await api.salle.update(editingSalle.id, dataToSend);
      setShowEditModal(false);
      resetEditModal();
      await loadSalles();
      await loadBatiments();
      showToast(`Salle "${editFormData.numero}" modifiée avec succès`, 'success');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      
      let errorMessage = "Erreur lors de la modification";
      
      if (error.response?.status === 409) {
        errorMessage = `Cette salle "${editFormData.numero}" existe déjà dans le bâtiment ${editFormData.batiment} au ${editFormData.etage}`;
      } else if (error.response?.status === 404) {
        errorMessage = "Salle introuvable. Veuillez rafraîchir la page.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setEditError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer une salle
  const handleDeleteRoom = async (salleId, salleNumero) => {
    if (window.confirm(`Supprimer la salle "${salleNumero}" ?`)) {
      try {
        await api.salle.delete(salleId);
        await loadSalles();
        await loadBatiments();
        showToast(`Salle "${salleNumero}" supprimée avec succès`, 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
        showToast(errorMessage, 'error');
      }
    }
    setShowMenuId(null);
  };

  // Ouvrir le modal de modification
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

  // Grouper par bâtiment
  const groupedData = useMemo(() => {
    const groups = salles.reduce((acc, salle) => {
      const bId = salle.batiment;
      if (!acc[bId]) {
        acc[bId] = {
          id: bId,
          label: `Bâtiment ${bId}`,
          color: buildingColors[bId]?.color || "#6b7280",
          bgColor: buildingColors[bId]?.bgColor || "bg-gray-100",
          salles: []
        };
      }
      acc[bId].salles.push(salle);
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => a.id.localeCompare(b.id));
  }, [salles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans p-6 md:p-8">
      {/* Toast Notification - UNIQUEMENT POUR LES SUCCÈS ET ERREURS GLOBALES */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Filters bar */}
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
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-1">Aucune salle</h3>
          <p className="text-gray-400 text-sm">Aucune salle n'a été trouvée</p>
        </div>
      )}

      {/* Bâtiments */}
      {!loading && groupedData.map((batiment, index) => (
        <div key={batiment.id} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-1 h-8 rounded-full ${batiment.bgColor}`} style={{ backgroundColor: batiment.color }} />
            <h2 className="text-xl font-semibold text-gray-800">{batiment.label}</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{batiment.salles.length} salle(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add card */}
            {index === 0 && (
              <div
                onClick={() => {
                  resetAddModal();
                  setShowAddModal(true);
                }}
                className="group bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-sky-400 hover:bg-sky-50/30 flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-all duration-300 min-h-[280px] shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-sky-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Plus className="w-7 h-7 text-gray-400 group-hover:text-sky-500" />
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-sky-600">Ajouter une salle</span>
              </div>
            )}

            {/* Salle cards */}
            {batiment.salles.map((salle) => {
              const libre = salle.statut === "LIBRE";
              return (
                <div
                  key={salle.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Bandeau de statut */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${libre ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />
                  
                  <div className="p-5 pt-6">
                    {/* En-tête */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Salle</div>
                        <div className="text-2xl font-bold text-gray-800">{salle.numero}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[11px] font-semibold shadow-md ${libre ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
                        {salle.statut === "LIBRE" ? "LIBRE" : "OCCUPÉ"}
                      </div>
                    </div>

                    {/* Cours actuel */}
                    {!libre && salle.courActuel && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Cours actuel</span>
                        </div>
                        <p className="text-sm font-medium text-amber-800 line-clamp-2">{salle.courActuel}</p>
                      </div>
                    )}

                    {libre && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 py-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Aucun cours en cours</span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {salle.batiment && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Building className="w-3.5 h-3.5" /> 
                          Bât. {salle.batiment}
                        </span>
                      )}
                      {salle.etage && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Layers className="w-3.5 h-3.5" /> 
                          {salle.etage === "Rez-de-chaussée" ? "RDC" : salle.etage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu actions */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setShowMenuId(showMenuId === salle.id ? null : salle.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                    {showMenuId === salle.id && (
                      <div className="absolute bottom-10 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px] animate-fadeIn">
                        <button
                          onClick={() => openEditModal(salle)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl"
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(salle.id, salle.numero)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl"
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

      {/* ============================================ */}
      {/* MODAL AJOUT - AVEC UNE SEULE CROIX */}
      {/* ============================================ */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          resetAddModal();
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-lg p-6 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">Ajouter une salle</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Remplissez les informations ci-dessous pour ajouter une nouvelle salle.
            </DialogDescription>
          </DialogHeader>
          
          {/* ✅ UNE SEULE CROIX - fournie par DialogHeader */}
          {/* La croix est déjà incluse par DialogHeader via Radix UI, 
              on ne met pas de deuxième bouton X */}
          
          {/* ✅ AFFICHAGE DE L'ERREUR DANS LE MODAL */}
          {addError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{addError}</p>
            </div>
          )}
          
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm">Numéro de la salle <span className="text-red-500">*</span></Label>
              <Input
                placeholder="ex: A-102 ou B201"
                value={addFormData.numero}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[a-zA-Z0-9\s-]*$/.test(value)) {
                    setAddFormData({ ...addFormData, numero: value });
                    if (addErrors.numero) setAddErrors({ ...addErrors, numero: '' });
                    setAddError('');
                  }
                }}
                className={`h-11 rounded-md border-2 px-3 text-base focus:ring-2 focus:ring-sky-500 transition-all ${
                  addErrors.numero ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {addErrors.numero && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {addErrors.numero}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm">Bâtiment <span className="text-red-500">*</span></Label>
              <select
                className={`h-11 w-full px-3 border-2 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  addErrors.batiment ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                value={addFormData.batiment}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, batiment: e.target.value });
                  if (addErrors.batiment) setAddErrors({ ...addErrors, batiment: '' });
                  setAddError('');
                }}
              >
                <option value="">Sélectionner un bâtiment</option>
                <option value="A">Bâtiment A</option>
                <option value="B">Bâtiment B</option>
                <option value="C">Bâtiment C</option>
                <option value="D">Bâtiment D</option>
              </select>
              {addErrors.batiment && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {addErrors.batiment}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm">Étage <span className="text-red-500">*</span></Label>
              <select
                className={`h-11 w-full px-3 border-2 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  addErrors.etage ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                value={addFormData.etage}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, etage: e.target.value });
                  if (addErrors.etage) setAddErrors({ ...addErrors, etage: '' });
                  setAddError('');
                }}
              >
                <option value="">Sélectionner un étage</option>
                {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {addErrors.etage && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {addErrors.etage}</p>}
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => {
              setShowAddModal(false);
              resetAddModal();
            }} className="rounded-md px-6 h-10 hover:bg-gray-100 transition-all">
              Annuler
            </Button>
            <Button onClick={handleAddRoom} disabled={submitting} className="bg-sky-500 hover:bg-sky-600 rounded-md px-6 h-10 shadow-md hover:shadow-lg transition-all text-white">
              {submitting ? "Ajout en cours..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* MODAL MODIFICATION - AVEC UNE SEULE CROIX ET GESTION D'ERREUR */}
      {/* ============================================ */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowEditModal(false);
          resetEditModal();
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-lg p-6 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">Modifier la salle</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Modifiez les informations de la salle.
            </DialogDescription>
          </DialogHeader>
          
          {/* ✅ UNE SEULE CROIX - fournie par DialogHeader */}
          {/* La croix est déjà incluse par DialogHeader via Radix UI,
              on ne met pas de deuxième bouton X */}
          
          {/* ✅ AFFICHAGE DE L'ERREUR DANS LE MODAL */}
          {editError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{editError}</p>
            </div>
          )}
          
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm">Numéro de la salle <span className="text-red-500">*</span></Label>
              <Input
                placeholder="ex: A-102 ou B201"
                value={editFormData.numero}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[a-zA-Z0-9\s-]*$/.test(value)) {
                    setEditFormData({ ...editFormData, numero: value });
                    if (editErrors.numero) setEditErrors({ ...editErrors, numero: '' });
                    setEditError('');
                  }
                }}
                className={`h-11 rounded-md border-2 px-3 text-base focus:ring-2 focus:ring-sky-500 transition-all ${
                  editErrors.numero ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {editErrors.numero && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {editErrors.numero}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm">Bâtiment <span className="text-red-500">*</span></Label>
              <select
                className={`h-11 w-full px-3 border-2 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  editErrors.batiment ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                value={editFormData.batiment}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, batiment: e.target.value });
                  if (editErrors.batiment) setEditErrors({ ...editErrors, batiment: '' });
                  setEditError('');
                }}
              >
                <option value="">Sélectionner un bâtiment</option>
                <option value="A">Bâtiment A</option>
                <option value="B">Bâtiment B</option>
                <option value="C">Bâtiment C</option>
                <option value="D">Bâtiment D</option>
              </select>
              {editErrors.batiment && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {editErrors.batiment}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium text-sm">Étage <span className="text-red-500">*</span></Label>
              <select
                className={`h-11 w-full px-3 border-2 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  editErrors.etage ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                value={editFormData.etage}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, etage: e.target.value });
                  if (editErrors.etage) setEditErrors({ ...editErrors, etage: '' });
                  setEditError('');
                }}
              >
                <option value="">Sélectionner un étage</option>
                {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {editErrors.etage && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {editErrors.etage}</p>}
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => {
              setShowEditModal(false);
              resetEditModal();
            }} className="rounded-md px-6 h-10 hover:bg-gray-100 transition-all">
              Annuler
            </Button>
            <Button onClick={handleEditRoom} disabled={submitting} className="bg-sky-500 hover:bg-sky-600 rounded-md px-6 h-10 shadow-md hover:shadow-lg transition-all text-white">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
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
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default Salle;