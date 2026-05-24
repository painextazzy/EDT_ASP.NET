// src/components/DemandesPage.jsx
import React, { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  Mail,
  User,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const DemandesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [demandes, setDemandes] = useState([
    {
      id: 1,
      nom: "M. Jean Valjean",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8NT18MfPgnHKcUPdv2U3rzU8CU5KoRRyfAaV9CwutxAJHjCV4Cw7tG-wHa01PNoCCgDgXSPdFIyGxhto9TZ3WWMz_gZ0vrT6JFknhEDDAP1v0LZ9guVmSIka5K5sLrPExGqB9MdAuOad1bDe2kz0CctX_W-ZXkHGE9j6uolBw2hyGRGN1zBDqtQFAFwHEaUE7dy6vvrTDYZeNjnphgi1uCgEULl1ebTGY-I0yYVLCSg194O941anxI7fnOfVyWcCqwfF4uT5r",
      im: "IM-48291",
      email: "j.valjean@univ.fr",
      statut: "En attente",
      statutClass: "bg-amber-100 text-amber-700",
      statutBadge: "amber"
    },
    {
      id: 2,
      nom: "Mme Sophie Martin",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDEG1BFgsMe4LF977OK-Q3tLm1GE2tu_tlRQ7_Zy01rtMdHd7G1q8wKLTJajDzI9Pa1ZqgtQELcXxloHJjN8md9pDkrEb_HncQ1M9uB3sXiGLiUASrriMNOyXOF7LtH19DBGUAKegU31RlAK7qV5aWjcLffszZg0sx2Zu2UiINs7qRMqAtNgfLxt5-_ObEP_jUN66R_VhlXXT6NiwplRssDrzpjzNGHqg_GzWPSUP9K1UX3hIYzxpdXv6yHzrQS4aXe5wkc12",
      im: "IM-48292",
      email: "s.martin@univ.fr",
      statut: "Validé",
      statutClass: "bg-emerald-100 text-emerald-700",
      statutBadge: "emerald"
    },
    {
      id: 3,
      nom: "M. René Descartes",
      avatar: "",
      initiales: "RD",
      im: "IM-48293",
      email: "r.descartes@univ.fr",
      statut: "Refusé",
      statutClass: "bg-rose-100 text-rose-700",
      statutBadge: "rose"
    },
    {
      id: 4,
      nom: "M. Louis Simon",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3u5nesjz-UqmD7zERXbgZHiQW8m9ULfmdzy9KT-AEuo-tabaPRh34xoF9BqEaalR7SmU4gVLdsGoo9KDGhhmnspnItiX0o5ic7uu1gmuZEy6v7pwl5A91dMwHIK_6VyiSXSQPiaMu5hOXU97qbCeCeJ0LvESdnYAgFKUeByFeYdhUTerADENXcGXPFcTRlZ23heiE9MWF_556jBDUu5tc_ztOrb-Iop9HfsyZiVfEUDnJk3X8ZlZHAAryT-D-0baG_ArA1fx3",
      im: "IM-48294",
      email: "l.simon@univ.fr",
      statut: "En attente",
      statutClass: "bg-amber-100 text-amber-700",
      statutBadge: "amber"
    }
  ]);

  const filteredDemandes = demandes.filter(d => {
    const matchSearch = searchTerm === '' || 
      d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.im.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatut = filterStatut === '' || d.statut === filterStatut;
    
    return matchSearch && matchStatut;
  });

  const handleMenuToggle = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleValidate = (demande) => {
    setSelectedDemande(demande);
    setConfirmAction('validate');
    setShowConfirmModal(true);
    setOpenMenuId(null);
  };

  const handleReject = (demande) => {
    setSelectedDemande(demande);
    setConfirmAction('reject');
    setShowConfirmModal(true);
    setOpenMenuId(null);
  };

  const confirmActionHandler = () => {
    if (confirmAction === 'validate' && selectedDemande) {
      setDemandes(demandes.map(d => 
        d.id === selectedDemande.id 
          ? { ...d, statut: "Validé", statutClass: "bg-emerald-100 text-emerald-700", statutBadge: "emerald" }
          : d
      ));
      toast.success(`Demande de ${selectedDemande.nom} validée avec succès`);
    } else if (confirmAction === 'reject' && selectedDemande) {
      setDemandes(demandes.map(d => 
        d.id === selectedDemande.id 
          ? { ...d, statut: "Refusé", statutClass: "bg-rose-100 text-rose-700", statutBadge: "rose" }
          : d
      ));
      toast.error(`Demande de ${selectedDemande.nom} refusée`);
    }
    setShowConfirmModal(false);
    setSelectedDemande(null);
    setConfirmAction(null);
  };

  const statutOptions = ['Tous', 'En attente', 'Validé', 'Refusé'];

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'Validé': return <CheckCircle className="w-3 h-3" />;
      case 'Refusé': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des demandes</h1>
          <p className="text-sm text-gray-500 mt-1">Consultez et gérez les demandes des professeurs</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une demande par nom, IM ou email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
          >
            {statutOptions.map(opt => (
              <option key={opt} value={opt === 'Tous' ? '' : opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandeur</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numéro IM</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {demande.avatar ? (
                          <img
                            alt={demande.nom}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                            src={demande.avatar}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800">{demande.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-gray-500">{demande.im}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">{demande.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${demande.statutClass}`}>
                        {getStatutIcon(demande.statut)}
                        {demande.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => handleMenuToggle(demande.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {openMenuId === demande.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-fadeIn">
                            <button
                              onClick={() => handleValidate(demande)}
                              className="w-full text-left px-3 py-2 text-xs text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Valider
                            </button>
                            <button
                              onClick={() => handleReject(demande)}
                              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {filteredDemandes.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Aucune demande trouvée</p>
              <p className="text-xs text-gray-400 mt-1">Modifiez vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'validate' ? 'Valider la demande' : 'Refuser la demande'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              {confirmAction === 'validate' 
                ? `Êtes-vous sûr de vouloir valider la demande de ${selectedDemande?.nom} ?`
                : `Êtes-vous sûr de vouloir refuser la demande de ${selectedDemande?.nom} ?`
              }
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmActionHandler}
              className={confirmAction === 'validate' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
            >
              {confirmAction === 'validate' ? 'Valider' : 'Refuser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DemandesPage;