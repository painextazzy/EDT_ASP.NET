import React, { useState, useRef, useEffect } from 'react';
import Skeleton from './ui/Skeleton';

const ProfesseursPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const [professeurs, setProfesseurs] = useState([
    {
      id: 1,
      name: "Dr. Jean Dupont",
      code: "801-B9EF-2C2B",
      email: "j.dupont@universite.fr",
      avatar: "https://lh3.googleusercontent.com/aida/ADBb0uixm0pyguio8cE1I03EYmkKrDNaVEDc4-nYi5NwwBK1WhpUeReyCZSC8teLtCY0Xuq9cvzOMOij-UzfpOVKHNt-1X-ggHib5aKvEwrXyShZaPBJ-ELtkU7VshN7LU7wkxnMYpLaZ7ZTs93OJf8p2TB1PcbScDWZPq6OUT2figGN_vOwe0X4zeqs65g29pS7FMb2FE4JmiBmPGs8aKaLnpu4zUNuOMTQAQqu46KwVEW4eUXdeV7R2UCn"
    },
    {
      id: 2,
      name: "M. Pierre Leroux",
      code: "742-X88A-9P2D",
      email: "p.leroux@universite.fr",
      avatar: "https://lh3.googleusercontent.com/aida/ADBb0ujorJmxAYAHiKqyxukJO1fG5-oMa5DwGgkSmHe6dDIOmfa-51v-YB0LEHoINZpTbLbXyUDwURQFhAircyg3Xic2XnnB2eascnenQ2K5xTswgtBVBJm4ccJbVfRXoKnNST8VHhYY_UGinagVpseaDmxh9pgJuwhC9V4wcd-OW8Dqu94rxkqtA5gxIOfICcKqbklEHpGzyNoqSxoaRB8y95wg0wSHUe57YwPbOURB1SkoAarI7TrL84u5"
    },
    {
      id: 3,
      name: "Pr. Marie Curie",
      code: "552-Y33C-1K9L",
      email: "m.curie@universite.fr",
      avatar: "https://lh3.googleusercontent.com/aida/ADBb0ujWbvdoxYvWL7CHFyEOtE8EMkRpRdk_Fg4xN5Q10VtnhggoUFw1cxTPusUvzHXe8PLsRpk7c_m-bMcn0o5tcFBEWyDDbWRjxbf8J9CBNds_em2QR3rwysR0chVHQGp-y6O7gf5CtZFwGcY8NMxHUXG8sbpPcb_qoh4oUHbV80k4t2DPWFVl_TOnTez5pAX_67KxxSgfQqNtiJPo-C8ouU_7t2wvATE61eDu1NYBLND7QYdJF_2Zi5ur"
    }
  ]);

  const [editProfessor, setEditProfessor] = useState({
    name: '',
    code: '',
    email: '',
    avatar: ''
  });

  // Filtrer les professeurs
  const filteredProfesseurs = professeurs.filter(prof => 
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Ouvrir/Fermer le menu
  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Générer un code aléatoire
  const generateCode = () => {
    const part1 = Math.random().toString(36).substring(2, 5).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part3 = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${part1}-${part2}-${part3}`;
  };

  // Supprimer un professeur
  const handleDeleteProfessor = (id, name) => {
    if (window.confirm(`Supprimer le professeur "${name}" ?`)) {
      setProfesseurs(professeurs.filter(prof => prof.id !== id));
    }
    setOpenMenuId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header avec barre de recherche - bordure solide grise 1px */}
      <header className="mb-8">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input 
            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-on-surface placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none text-sm rounded-lg" 
            id="search" 
            name="search" 
            placeholder="Rechercher un professeur par nom ou matière..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Liste des professeurs - Cartes sans bordure solide, uniquement box shadow */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} type="avatar" className="bg-white rounded-xl shadow-md p-4" />
            ))
          ) : (
            filteredProfesseurs.map((professeur) => (
              <article 
                key={professeur.id} 
                className="bg-white flex items-center p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow gap-4 relative"
              >
                {/* Avatar */}
                <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                  <img 
                    alt={professeur.name} 
                    className="w-full h-full object-cover" 
                    src={professeur.avatar} 
                  />
                </div>

                {/* Informations */}
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm text-on-surface truncate">{professeur.name}</h3>
                  <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-on-surface-variant opacity-60">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">qr_code</span>
                      <span className="">{professeur.code}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">mail</span>
                      <span className="truncate">{professeur.email}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton options (more_vert) */}
                <div className="relative">
                  <button 
                    onClick={(e) => toggleMenu(professeur.id, e)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                    aria-label="Options"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>

                  {/* Menu contextuel - uniquement Supprimer */}
                  {openMenuId === professeur.id && (
                    <div 
                      ref={menuRef}
                      className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]"
                    >
                      <button 
                        onClick={() => handleDeleteProfessor(professeur.id, professeur.name)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
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
        {filteredProfesseurs.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-gray-400">search_off</span>
            <p className="mt-2 text-gray-500">Aucun professeur trouvé</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfesseursPage;