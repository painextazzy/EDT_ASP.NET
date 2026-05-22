// src/components/DemandesPage.jsx (avec menu contextuel)
import React, { useState } from 'react';

const DemandesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const demandes = [
    // ... mêmes données que ci-dessus
  ];

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
    setToastMessage(`Demande de ${demande.nom} validée avec succès`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setOpenMenuId(null);
  };

  const handleReject = (demande) => {
    setToastMessage(`Demande de ${demande.nom} refusée`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setOpenMenuId(null);
  };

  const handleDelete = (demande) => {
    if (window.confirm(`Supprimer la demande de ${demande.nom} ?`)) {
      setToastMessage(`Demande de ${demande.nom} supprimée`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setOpenMenuId(null);
  };

  const statutOptions = ['En attente', 'Validé', 'Refusé'];

  return (
    <div>
      <main className="mx-auto max-w-[1100px]">
        {/* Search & Filters */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-start mb-6">
          <div className="relative w-full md:w-1/2">
            <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-outline left-5">
              search
            </span>
            <input 
              className="w-full pr-4 py-2.5 bg-white border border-border-subtle focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all placeholder:text-outline/60 rounded-full pl-14" 
              placeholder="Rechercher une demande..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-subtle rounded-xl hover:bg-surface-container transition-colors group">
              <span className="text-sm font-medium">Date</span>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">expand_more</span>
            </button>
            <select 
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-subtle rounded-xl hover:bg-surface-container transition-colors outline-none cursor-pointer"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="">Statut</option>
              {statutOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area: List View */}
        <div className="border border-border-subtle rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="divide-y divide-border-subtle">
            {filteredDemandes.map((demande) => (
              <div 
                key={demande.id} 
                className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_auto] items-center gap-4 px-4 py-3 hover:bg-surface-container-low transition-colors group"
              >
                {/* Nom avec avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  {demande.avatar ? (
                    <img 
                      alt="Avatar" 
                      className="rounded-full object-cover w-9 h-9 border border-surface-container shrink-0" 
                      src={demande.avatar} 
                    />
                  ) : (
                    <div className="rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-[13px] border border-secondary/20 w-9 h-9 shrink-0">
                      {demande.initiales}
                    </div>
                  )}
                  <span className="truncate text-sm text-primary font-medium">
                    {demande.nom}
                  </span>
                </div>

                {/* IM */}
                <div className="text-[11px] font-mono tracking-wider truncate text-outline/80">
                  {demande.im}
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 truncate text-text-muted">
                  <span className="material-symbols-outlined text-sm shrink-0">mail</span>
                  <span className="text-xs truncate">{demande.email}</span>
                </div>

                {/* Statut */}
                <div className="flex justify-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border font-semibold ${demande.statutClass}`}>
                    {demande.statut}
                  </span>
                </div>

                {/* Actions avec menu contextuel */}
                <div className="relative">
                  <button 
                    onClick={() => handleMenuToggle(demande.id)}
                    className="p-1.5 text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">settings</span>
                  </button>
                  
                  {openMenuId === demande.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border-subtle py-1 z-10">
                      <button 
                        onClick={() => handleValidate(demande)}
                        className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Valider
                      </button>
                      <button 
                        onClick={() => handleReject(demande)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Refuser
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={() => handleDelete(demande)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message si aucun résultat */}
        {filteredDemandes.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
            <p className="mt-2 text-on-surface-variant">Aucune demande trouvée</p>
          </div>
        )}
      </main>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-primary text-white px-6 py-4 rounded-xl shadow-2xl animate-slide-up z-50">
          <span className="material-symbols-outlined text-secondary">check_circle</span>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DemandesPage;