// src/components/ProfesseursPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Trash2, Mail, QrCode, User, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ProfesseursPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const menuRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  const [professeurs, setProfesseurs] = useState([]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Charger uniquement les enseignants validés
  const loadProfesseurs = async () => {
    try {
      setLoading(true);
      const data = await api.enseignant.getValides();
      console.log("Professeurs chargés:", data);
      setProfesseurs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      showNotification("Erreur lors du chargement des professeurs", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfesseurs();
  }, []);

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

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Supprimer un professeur
  const handleDeleteProfessor = async (id, nom) => {
    if (window.confirm(`Supprimer le professeur "${nom}" ? Cette action est irréversible.`)) {
      try {
        const result = await api.enseignant.delete(id);
        if (result && result.message) {
          await loadProfesseurs();
          showNotification(result.message, 'success');
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
        const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
        showNotification(errorMessage, 'error');
      }
    }
    setOpenMenuId(null);
  };

  // Gérer l'erreur de chargement d'image
  const handleImageError = (professeurId) => {
    setImageErrors(prev => ({ ...prev, [professeurId]: true }));
  };

  // Filtrer les professeurs
  const filteredProfesseurs = professeurs.filter(prof => 
    prof.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.im?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          } min-w-[300px] max-w-md`}>
            {notification.type === 'success' 
              ? <CheckCircle className="w-5 h-5" /> 
              : <AlertCircle className="w-5 h-5" />
            }
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Professeurs</h1>
          <p className="text-sm text-gray-500 mt-1">Liste des professeurs dont le compte a été validé</p>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-2xl mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm rounded-lg" 
            placeholder="Rechercher un professeur par nom, code ou email..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Liste des professeurs */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredProfesseurs.map((professeur) => (
              <article 
                key={professeur.id} 
                className="bg-white flex items-center p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow gap-4 relative"
              >
                {/* Avatar - Utilisation de l'URL de la base de données */}
                <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  {professeur.photoUrl && !imageErrors[professeur.id] ? (
                    <img 
                      alt={professeur.nom} 
                      className="w-full h-full object-cover" 
                      src={professeur.photoUrl}
                      onError={() => handleImageError(professeur.id)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{professeur.nom?.charAt(0) || 'P'}</span>
                  )}
                </div>

                {/* Informations */}
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm text-gray-800 truncate">{professeur.nom}</h3>
                  <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      <span className="truncate">{professeur.im}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{professeur.email || "Aucun email"}</span>
                    </div>
                  </div>
                </div>

                {/* Menu à trois points */}
                <div className="relative">
                  <button 
                    onClick={(e) => toggleMenu(professeur.id, e)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    aria-label="Options"
                    title="Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Menu contextuel avec uniquement Supprimer */}
                  {openMenuId === professeur.id && (
                    <div 
                      ref={menuRef}
                      className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]"
                    >
                      <button 
                        onClick={() => handleDeleteProfessor(professeur.id, professeur.nom)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Message si aucun résultat */}
        {!loading && filteredProfesseurs.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="mt-2 text-gray-500">Aucun professeur validé trouvé</p>
            <p className="text-sm text-gray-400">Les professeurs apparaîtront ici après validation de leur compte</p>
          </div>
        )}
      </section>

      <style>{`
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
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfesseursPage;