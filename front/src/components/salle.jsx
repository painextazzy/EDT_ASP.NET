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
  Building2,
  DoorOpen,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const buildingColors = {
  A: { color: "#6366f1", bgColor: "bg-indigo-50" },
  B: { color: "#10b981", bgColor: "bg-emerald-50" },
  C: { color: "#f59e0b", bgColor: "bg-amber-50" },
  D: { color: "#ef4444", bgColor: "bg-rose-50" },
};

const etageMap = {
  "Rez-de-chaussée": 0,
  "Étage 1": 1,
  "Étage 2": 2,
  "Étage 3": 3,
};

const reverseEtageMap = {
  0: "Rez-de-chaussée",
  1: "Étage 1",
  2: "Étage 2",
  3: "Étage 3",
};

const allEtages = ["Rez-de-chaussée", "Étage 1", "Étage 2", "Étage 3"];
const allParcours = ["Informatique", "Management", "Multimédia", "AES"];

const Salle = () => {
  const [salles, setSalles] = useState([]);
  const [batiments, setBatiments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBatiment, setFilterBatiment] = useState("");
  const [filterEtage, setFilterEtage] = useState("");
  const [filterParcours, setFilterParcours] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [editingSalle, setEditingSalle] = useState(null);
  const [newSalle, setNewSalle] = useState({ numero: "", batiment: "", etage: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      // Construction manuelle de la query string car apiClient ne gère que l'URL
      const query = new URLSearchParams({
        search,
        batiment: filterBatiment,
        etage: filterEtage ? etageMap[filterEtage] : ""
      }).toString();

      const [sallesData, batimentsData] = await Promise.all([
        api.salle.getAll(query ? `?${query}` : ""),
        api.salle.getBatiments()
      ]);
      
      setSalles(sallesData);
      setBatiments(batimentsData);
    } catch (error) {
      console.error("Erreur de chargement des salles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterBatiment, filterEtage]);

  const handleAddRoom = async () => {
    if (!newSalle.numero || !newSalle.batiment) return;
    try {
      await api.salle.create({
        numero: newSalle.numero,
        batiment: newSalle.batiment,
        etage: etageMap[newSalle.etage] || 0
      });
      setNewSalle({ numero: "", batiment: "", etage: "" });
      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const handleEditRoom = async () => {
    if (!editingSalle) return;
    try {
      await api.salle.update(editingSalle.id, {
        numero: editingSalle.numero,
        batiment: editingSalle.batiment,
        etage: etageMap[editingSalle.etageLabel] ?? editingSalle.etage
      });
      setShowEditModal(false);
      setEditingSalle(null);
      loadData();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleDeleteRoom = async (salleId) => {
    if (window.confirm("Supprimer cette salle ?")) {
      try {
        await api.salle.delete(salleId);
        loadData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
    setShowMenuId(null);
  };

  const groupedData = useMemo(() => {
    const filteredByParcours = filterParcours 
      ? salles.filter(s => s.parcours === filterParcours)
      : salles;

    const groups = filteredByParcours.reduce((acc, salle) => {
      const bId = salle.batiment;
      if (!acc[bId]) {
        acc[bId] = {
          id: bId,
          label: `Bâtiment ${bId}`,
          color: buildingColors[bId]?.color || "#64748b",
          bgColor: buildingColors[bId]?.bgColor || "bg-slate-50",
          salles: []
        };
      }
      acc[bId].salles.push(salle);
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => a.id.localeCompare(b.id));
  }, [salles, filterParcours]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans p-6 md:p-8">
      {/* Header */}
    

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par numéro, cours ou mention..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 shadow-sm transition-all"
          />
        </div>
        <select
          value={filterBatiment}
          onChange={(e) => setFilterBatiment(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
        >
          <option value="">Tous les bâtiments</option>
          {batiments.map(b => <option key={b} value={b}>Bâtiment {b}</option>)}
        </select>
        <select
          value={filterEtage}
          onChange={(e) => setFilterEtage(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
        >
          <option value="">Tous les étages</option>
          {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          value={filterParcours}
          onChange={(e) => setFilterParcours(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
        >
          <option value="">Tous les parcours</option>
          {allParcours.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Batiments */}
      {!loading && groupedData.length === 0 && <div className="text-center py-20 text-gray-400">Aucune salle trouvée</div>}
      {!loading && groupedData.map((batiment) => (
        <div key={batiment.id} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-1 h-8 rounded-full ${batiment.bgColor}`} style={{ backgroundColor: batiment.color }} />
            <h2 className="text-xl font-semibold text-gray-800">{batiment.label}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{batiment.salles.length} salle(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add card - uniquement pour le premier bâtiment */}
            {groupedData[0]?.id === batiment.id && (
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
                  {/* Status bar */}
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
                      {salle.etageLabel && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-xl text-[11px] font-medium text-gray-600">
                          <Layers className="w-3.5 h-3.5" /> {salle.etageLabel}
                        </span>
                      )}
                      {salle.parcours && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-xl text-[11px] font-medium text-gray-600">
                          <Building2 className="w-3.5 h-3.5" /> {salle.parcours}
                        </span>
                      )}
                      {salle.mention && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-xl text-[11px] font-medium text-gray-600">
                          <DoorOpen className="w-3.5 h-3.5" /> {salle.mention}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu settings button */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setShowMenuId(showMenuId === salle.id ? null : salle.id)}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                    {showMenuId === salle.id && (
                      <div className="absolute bottom-10 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px] animate-fadeIn">
                        <button
                          onClick={() => {
                            setEditingSalle(salle);
                            setShowEditModal(true);
                            setShowMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(salle.id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl transition-colors"
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

      {/* Modal Ajout */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ajouter une salle</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Numéro de la salle</Label>
              <Input
                placeholder="ex: A-102"
                value={newSalle.numero}
                onChange={(e) => setNewSalle({ ...newSalle, numero: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Bâtiment</Label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                value={newSalle.batiment}
                onChange={(e) => setNewSalle({ ...newSalle, batiment: e.target.value })}
              >
                <option value="">Sélectionner un bâtiment</option>
                <option value="A">Bâtiment A</option>
                <option value="B">Bâtiment B</option>
                <option value="C">Bâtiment C</option>
                <option value="D">Bâtiment D</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Étage</Label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                value={newSalle.etage}
                onChange={(e) => setNewSalle({ ...newSalle, etage: e.target.value })}
              >
                <option value="">Sélectionner un étage</option>
                {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleAddRoom} className="bg-indigo-500 hover:bg-indigo-600 rounded-xl">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Modification */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Modifier la salle</DialogTitle>
          </DialogHeader>
          {editingSalle && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Numéro de la salle</Label>
                <Input
                  value={editingSalle.numero}
                  onChange={(e) => setEditingSalle({ ...editingSalle, numero: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Bâtiment</Label>
                <Input
                  value={editingSalle.batiment}
                  onChange={(e) => setEditingSalle({ ...editingSalle, batiment: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Étage</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  value={editingSalle.etageLabel}
                  onChange={(e) => setEditingSalle({ ...editingSalle, etageLabel: e.target.value })}
                >
                  <option value="">Sélectionner un étage</option>
                  {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleEditRoom} className="bg-indigo-500 hover:bg-indigo-600 rounded-xl">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Salle;