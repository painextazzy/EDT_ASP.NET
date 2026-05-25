// src/components/DemandesPage.jsx
import React, { useState, useRef, useEffect } from 'react';

const DemandesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const menuRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  const [demandes, setDemandes] = useState([
    {
      id: 1,
      nom: "M. Jean Valjean",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      im: "IM-48291",
      email: "j.valjean@univ.fr",
      statut: "En attente"
    },
    {
      id: 2,
      nom: "Mme Sophie Martin",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      im: "IM-48292",
      email: "s.martin@univ.fr",
      statut: "Validé"
    },
    {
      id: 3,
      nom: "M. René Descartes",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      im: "IM-48293",
      email: "r.descartes@univ.fr",
      statut: "Refusé"
    },
    {
      id: 4,
      nom: "M. Louis Simon",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      im: "IM-48294",
      email: "l.simon@univ.fr",
      statut: "En attente"
    },
    {
      id: 5,
      nom: "Mme Claire Dupont",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      im: "IM-48295",
      email: "c.dupont@univ.fr",
      statut: "En attente"
    }
  ]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Nettoyer le timeout de notification
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const showNotification = (message, type) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ show: true, message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const filteredDemandes = demandes.filter(d => {
    const matchSearch = searchTerm === '' || 
      d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.im.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatut = filterStatut === '' || d.statut === filterStatut;
    
    return matchSearch && matchStatut;
  });

  const toggleMenu = (id, event) => {
    event.stopPropagation();
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
          ? { ...d, statut: "Validé" }
          : d
      ));
      showNotification(`Demande de ${selectedDemande.nom} validée avec succès`, 'success');
    } else if (confirmAction === 'reject' && selectedDemande) {
      setDemandes(demandes.map(d => 
        d.id === selectedDemande.id 
          ? { ...d, statut: "Refusé" }
          : d
      ));
      showNotification(`Demande de ${selectedDemande.nom} refusée`, 'error');
    }
    setShowConfirmModal(false);
    setSelectedDemande(null);
    setConfirmAction(null);
  };

  const getStatutClass = (statut) => {
    switch (statut) {
      case 'Validé': return 'bg-emerald-100 text-emerald-700';
      case 'Refusé': return 'bg-rose-100 text-rose-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'Validé': return '✓';
      case 'Refusé': return '✗';
      default: return '●';
    }
  };

  const statutOptions = ['Tous', 'En attente', 'Validé', 'Refusé'];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <span className="material-symbols-outlined text-lg">check_circle</span>;
      case 'error':
        return <span className="material-symbols-outlined text-lg">error</span>;
      default:
        return <span className="material-symbols-outlined text-lg">info</span>;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${getNotificationStyles(notification.type)} min-w-[300px] max-w-md`}>
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Header avec barre de recherche et filtre */}
      <header className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm rounded-lg" 
              placeholder="Rechercher une demande par nom, IM ou email..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
          >
            {statutOptions.map(opt => (
              <option key={opt} value={opt === 'Tous' ? '' : opt}>{opt}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Tableau des demandes */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandeur</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numéro IM</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDemandes.map((demande) => (
                <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                        {demande.avatar ? (
                          <img 
                            alt={demande.nom} 
                            className="w-full h-full object-cover" 
                            src={demande.avatar} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{demande.nom}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-xs font-mono text-gray-500">{demande.im}</span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">mail</span>
                      <span className="text-xs text-gray-600">{demande.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatutClass(demande.statut)}`}>
                      <span className="text-[10px]">{getStatutIcon(demande.statut)}</span>
                      {demande.statut}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(demande.id, e)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-gray-400">more_vert</span>
                      </button>
                      {openMenuId === demande.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-fadeIn"
                        >
                          {demande.statut !== 'Validé' && (
                            <button
                              onClick={() => handleValidate(demande)}
                              className="w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Valider
                            </button>
                          )}
                          {demande.statut !== 'Refusé' && (
                            <button
                              onClick={() => handleReject(demande)}
                              className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              Refuser
                            </button>
                          )}
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
            <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
            <p className="mt-2 text-gray-500">Aucune demande trouvée</p>
            <p className="text-sm text-gray-400">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        )}
      </div>

      {/* Modal de confirmation avec effet de flou */}
      {showConfirmModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white/30 z-40 animate-fadeIn"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-scaleIn">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {confirmAction === 'validate' ? 'Valider la demande' : 'Refuser la demande'}
                </h2>
                <button 
                  onClick={() => setShowConfirmModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  {confirmAction === 'validate' 
                    ? `Êtes-vous sûr de vouloir valider la demande de ${selectedDemande?.nom} ?`
                    : `Êtes-vous sûr de vouloir refuser la demande de ${selectedDemande?.nom} ?`
                  }
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmActionHandler}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    confirmAction === 'validate' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {confirmAction === 'validate' ? 'Valider' : 'Refuser'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DemandesPage;