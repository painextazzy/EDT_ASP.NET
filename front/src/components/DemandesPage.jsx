// src/components/DemandesPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Mail, MoreVertical, CheckCircle, XCircle, RefreshCw, UserCheck, UserX, X } from 'lucide-react';
import api from '../services/api';
import { IMAGES_URL } from '../services/config';
import SkeletonTableRow from './ui/SkeletonTableRow';

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50" y="58" font-family="Arial" font-size="40" text-anchor="middle" fill="%239ca3af"%3E👤%3C/text%3E%3C/svg%3E';

const DemandesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    loadDemandes();
  }, []);

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return DEFAULT_AVATAR;
    if (photoUrl.startsWith('http')) return photoUrl;
    if (photoUrl.startsWith('/')) return `${IMAGES_URL}${photoUrl}`;
    return `${IMAGES_URL}/${photoUrl}`;
  };

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const response = await api.validation.getEnseignantsEnAttente();
      
      let enseignants = [];
      if (response) {
        if (response.success && Array.isArray(response.data)) {
          enseignants = response.data;
        } else if (Array.isArray(response)) {
          enseignants = response;
        } else if (response.data && Array.isArray(response.data)) {
          enseignants = response.data;
        }
      }
      
      const formattedData = enseignants.map(enseignant => ({
        id: enseignant.id || 0,
        nom: enseignant.nom || 'Nom non spécifié',
        im: enseignant.im || 'N/A',
        email: enseignant.email || 'Email non spécifié',
        photoUrl: enseignant.photoUrl || null,
        statut: "En attente"
      }));
      
      setDemandes(formattedData);
    } catch (error) {
      let errorMessage = 'Erreur lors du chargement des demandes';
      if (error.message === 'SESSION_EXPIRED') {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showNotification(errorMessage, 'error');
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const confirmActionHandler = async () => {
    if (confirmAction === 'validate' && selectedDemande) {
      try {
        const response = await api.validation.validerEnseignant(selectedDemande.id);
        
        if (response && response.success) {
          setDemandes(demandes.map(d => 
            d.id === selectedDemande.id 
              ? { ...d, statut: "Validé" }
              : d
          ));
          
          // Envoi de l'email de validation au professeur
          try {
            const emailSubject = 'Votre compte a été validé';
            const emailHtml = `
              <h1>Félicitations</h1>
              <p>Bonjour ${selectedDemande.nom},</p>
              <p>Votre compte a été validé par l'administrateur.</p>
              <p>Vous pouvez désormais vous connecter à l'application.</p>
              <p>Cordialement,<br>L'équipe administrative</p>
            `;
            await api.email.sendTestEmail(selectedDemande.email, emailSubject, emailHtml);
            showNotification(`Demande de ${selectedDemande.nom} validée et email envoyé.`, 'success');
          } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
            showNotification(`Demande de ${selectedDemande.nom} validée, mais l'email de confirmation n'a pas pu être envoyé.`, 'warning');
          }
          
          setTimeout(() => loadDemandes(), 1000);
        } else {
          showNotification(response?.message || 'Erreur lors de la validation', 'error');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
        showNotification(`Erreur: ${errorMsg}`, 'error');
      }
    } else if (confirmAction === 'reject' && selectedDemande) {
      try {
        const response = await api.validation.refuserEnseignant(selectedDemande.id);
        
        if (response && response.success) {
          setDemandes(demandes.filter(d => d.id !== selectedDemande.id));
          showNotification(`Demande de ${selectedDemande.nom} refusée.`, 'success');
          setTimeout(() => loadDemandes(), 1000);
        } else {
          showNotification(response?.message || 'Erreur lors du refus', 'error');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
        showNotification(`Erreur: ${errorMsg}`, 'error');
      }
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
      case 'Validé': return <CheckCircle className="w-3 h-3" />;
      case 'Refusé': return <XCircle className="w-3 h-3" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />;
    }
  };

  const statutOptions = ['Tous', 'En attente', 'Validé', 'Refusé'];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'warning': return <XCircle className="w-5 h-5 text-amber-600" />;
      default: return <User className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'error': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-2xl">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse w-full"></div>
            </div>
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse w-40"></div>
          </div>
        </header>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandeur</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numero IM</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={5} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header avec barre de recherche et filtre */}
      <header className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
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
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numero IM</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">
                    <Search className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="mt-2 text-gray-500">Aucune demande trouvee</p>
                    <p className="text-sm text-gray-400">Modifiez vos filtres pour voir plus de resultats</p>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {demande.photoUrl ? (
                            <img 
                              src={getPhotoUrl(demande.photoUrl)}
                              alt={demande.nom}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                const icon = document.createElement('div');
                                icon.className = 'text-gray-400';
                                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
                                parent.appendChild(icon);
                              }}
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
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
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{demande.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatutClass(demande.statut)}`}>
                        {getStatutIcon(demande.statut)}
                        {demande.statut}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="relative" ref={menuRef}>
                        {demande.statut === 'En attente' && (
                          <button
                            onClick={(e) => toggleMenu(demande.id, e)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                        )}
                        {openMenuId === demande.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-fadeIn">
                            <button
                              onClick={() => handleValidate(demande)}
                              className="w-full text-left px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              Valider
                            </button>
                            <button
                              onClick={() => handleReject(demande)}
                              className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                            >
                              <UserX className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation */}
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
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  {confirmAction === 'validate' 
                    ? `Etes-vous sur de vouloir valider la demande de ${selectedDemande?.nom} ?`
                    : `Etes-vous sur de vouloir refuser la demande de ${selectedDemande?.nom} ?`
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
                  className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${
                    confirmAction === 'validate' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {confirmAction === 'validate' ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Valider
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      Refuser
                    </>
                  )}
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