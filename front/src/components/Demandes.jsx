import React, { useState } from 'react';

const DemandesInterface = ({ setCurrentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const requests = [
    {
      id: 1,
      name: "M. Jean Valjean",
      idNumber: "IM-48291",
      email: "j.valjean@univ.fr",
      status: "En attente",
      statusColor: "amber",
      type: "Demande de stage",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8NT18MfPgnHKcUPdv2U3rzU8CU5KoRRyfAaV9CwutxAJHjCV4Cw7tG-wHa01PNoCCgDgXSPdFIyGxhto9TZ3WWMz_gZ0vrT6JFknhEDDAP1v0LZ9guVmSIka5K5sLrPExGqB9MdAuOad1bDe2kz0CctX_W-ZXkHGE9j6uolBw2hyGRGN1zBDqtQFAFwHEaUE7dy6vvrTDYZeNjnphgi1uCgEULl1ebTGY-I0yYVLCSg194O941anxI7fnOfVyWcCqwfF4uT5r"
    },
    {
      id: 2,
      name: "Mme. Sophie Martin",
      idNumber: "Changement d'horaire",
      email: "s.martin@univ.fr",
      status: "Validé",
      statusColor: "green",
      type: "Modification emploi du temps",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDEG1BFgsMe4LF977OK-Q3tLm1GE2tu_tlRQ7_Zy01rtMdHd7G1q8wKLTJajDzI9Pa1ZqgtQELcXxloHJjN8md9pDkrEb_HncQ1M9uB3sXiGLiUASrriMNOyXOF7LtH19DBGUAKegU31RlAK7qV5aWjcLffszZg0sx2Zu2UiINs7qRMqAtNgfLxt5-_ObEP_jUN66R_VhlXXT6NiwplRssDrzpjzNGHqg_GzWPSUP9K1UX3hIYzxpdXv6yHzrQS4aXe5wkc12"
    },
    {
      id: 3,
      name: "Dr. René Descartes",
      idNumber: "Budget épuisé",
      email: "r.descartes@univ.fr",
      status: "Refusé",
      statusColor: "red",
      type: "Demande de budget",
      avatar: null
    },
    {
      id: 4,
      name: "Luc Simon",
      idNumber: "Badge accès",
      email: "l.simon@univ.fr",
      status: "En attente",
      statusColor: "amber",
      type: "Accès laboratoire",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3u5nesjz-UqmD7zERXbgZHiQW8m9ULfmdzy9KT-AEuo-tabaPRh34xoF9BqEaalR7SmU4gVLdsGoo9KDGhhmnspnItiX0o5ic7uu1gmuZEy6v7pwl5A91dMwHIK_6VyiSXSQPiaMu5hOXU97qbCeCeJ0LvESdnYAgFKUeByFeYdhUTerADENXcGXPFcTRlZ23heiE9MWF_556jBDUu5tc_ztOrb-Iop9HfsyZiVfEUDnJk3X8ZlZHAAryT-D-0baG_ArA1fx3"
    }
  ];

  const handleAccept = (request) => {
    showToastMessage(`Demande de ${request.name} acceptée`);
  };

  const handleReject = (request) => {
    showToastMessage(`Demande de ${request.name} refusée`);
  };

  const handleRefresh = (request) => {
    showToastMessage(`Demande de ${request.name} rechargée`);
  };

  const handleDelete = (request) => {
    showToastMessage(`Demande de ${request.name} supprimée`);
  };

  const getStatusBadgeClasses = (statusColor) => {
    const baseClasses = "absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider label-mono border";
    switch(statusColor) {
      case 'amber':
        return `${baseClasses} bg-amber-100 text-amber-700 border-amber-200`;
      case 'green':
        return `${baseClasses} bg-green-100 text-green-700 border-green-200`;
      case 'red':
        return `${baseClasses} bg-red-100 text-red-700 border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 border-gray-200`;
    }
  };

  return (
    <div className="bg-[#f8f9fd] text-[#191c1f] min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Header: Segmented Control */}
        <header className="flex flex-col items-center gap-12 mb-12">
          <div className="flex items-center gap-2 p-1 bg-[#edeef2] rounded-full shadow-sm border border-[#c3c7c8]">
            <button 
              onClick={() => setCurrentView('professeurs')}
              className="px-8 py-2.5 rounded-full text-[#191c1f] font-semibold transition-all duration-200 hover:bg-[#e7e8ec]"
            >
              Professeurs
            </button>
            <button 
              onClick={() => setCurrentView('demandes')}
              className="px-8 py-2.5 rounded-full text-white font-semibold shadow-md active:scale-95 transition-all duration-200"
              style={{ backgroundColor: '#06d6a0' }}
            >
              Demandes
            </button>
          </div>

          {/* Search & Filters */}
          <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full md:w-1/2">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#747879]">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#dfe6e9] rounded-xl focus:ring-2 focus:ring-[#001f3c] focus:border-[#001f3c] outline-none transition-all placeholder:text-[#747879]/60" 
                placeholder="Rechercher une demande..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[#dfe6e9] rounded-xl hover:bg-[#edeef2] transition-colors group">
                <span className="text-body-sm font-medium">date</span>
                <span className="material-symbols-outlined text-[#747879] group-hover:text-[#181f21] transition-colors">expand_more</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[#dfe6e9] rounded-xl hover:bg-[#edeef2] transition-colors group">
                <span className="text-body-sm font-medium">Statut</span>
                <span className="material-symbols-outlined text-[#747879] group-hover:text-[#181f21] transition-colors">expand_more</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="space-y-16">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-white p-6 rounded-xl border border-[#dfe6e9] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center relative group hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-300 min-h-[320px]"
                >
                  <span className={getStatusBadgeClasses(request.statusColor)}>
                    {request.status}
                  </span>
                  
                  {request.avatar ? (
                    <img 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#edeef2] mb-4" 
                      src={request.avatar}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#00345f] text-[#3e9eff] flex items-center justify-center font-bold text-xl border-2 border-[#edeef2] mb-4">
                      RD
                    </div>
                  )}
                  
                  <h3 className="font-bold text-base text-[#181f21] leading-tight">{request.name}</h3>
                  <p className="text-[#636e72] text-xs mt-1">{request.idNumber}</p>
                  <p className="text-[#636e72] text-[11px] mt-1 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] opacity-70">mail</span>
                    {request.email}
                  </p>
                  
                  <div className="flex gap-2 mt-auto w-full pt-4">
                    {request.status === "Validé" ? (
                      <>
                        <button className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#edeef2] text-[#747879]" disabled>
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#edeef2] text-[#747879]" disabled>
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : request.status === "Refusé" ? (
                      <>
                        <button 
                          onClick={() => handleRefresh(request)}
                          className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#6dfad2] text-[#00725b] hover:scale-[1.02] transition-transform"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(request)}
                          className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#ffdad6] text-[#93000a] hover:scale-[1.02] transition-transform"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAccept(request)}
                          className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#6dfad2] text-[#00725b] hover:scale-[1.02] transition-transform"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button 
                          onClick={() => handleReject(request)}
                          className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#ffdad6] text-[#93000a] hover:scale-[1.02] transition-transform"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Success Toast */}
      <div 
        className={`fixed bottom-8 right-8 flex items-center gap-3 bg-[#001f3c] text-white px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 ${
          showToast ? 'opacity-100 pointer-events-auto transform translate-y-0' : 'opacity-0 pointer-events-none transform translate-y-4'
        }`}
      >
        <span className="material-symbols-outlined text-[#3e9eff]">check_circle</span>
        <span className="font-medium">{toastMessage}</span>
      </div>

      <style>{`
        .label-mono { 
          font-family: 'JetBrains Mono', monospace; 
          font-size: 12px; 
          letter-spacing: 0.05em; 
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  );
};

export default DemandesInterface;