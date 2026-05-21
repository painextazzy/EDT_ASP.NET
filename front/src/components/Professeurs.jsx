import React, { useState } from 'react';

const ProfesseursInterface = ({ setCurrentView }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const professors = [
    {
      id: 1,
      name: "Dr. Jean Dupont",
      idNumber: "IM-48291",
      email: "p.leroux@univ.fr",
      status: "En ligne",
      statusType: "online",
      imageUrl: "https://lh3.googleusercontent.com/aida/ADBb0ugD3IJV1Ll1UYzpN83ctv5Uyfp2lslYSJ4WbOePPOUh-c8GdmEVBsWz6DvXqOvqpi2ikjQ22huJsQnjJwRvBpIPZJ25hpc6FbONFr3r0ea8_OYyZz6E9KZROBqpfOREfFWrAEPSHSsJ7VYSXzo-YzmuymGjby_bS3x79x__799wR6KzUDhfGqMd2SgcL6ODvML_g0HPfI-wteYK_iqHvjNIyS9JWg7QjY4OcvmG3jTdEKwEULgLs0E9",
      department: "Informatique"
    },
    {
      id: 2,
      name: "Pr. Marie Curie",
      idNumber: "IM-99201",
      email: "m.curie@univ.fr",
      status: "En ligne il y a 15m",
      statusType: "offline",
      imageUrl: "https://lh3.googleusercontent.com/aida/ADBb0uhfG5s4k8pQoOAhL880rhF2FyZ-dx9dDtRx2lvcQewo0pfgXmjaUcgifvgqtP0lp-J9cmAtx8GwmYJ3hAfZicIFKVaRU_yqIhlxDbFQqjtS2_UuB5GPL9jQA_3UXRuJFJP804i0uk8JHczujRpkkpLLA40ThQm9n3dC9m6uQO5iJpvqMjyXHOoprVH--4z7i0FykvYzZfdRR0zf_QNkTzwbt6STJ-XgG1kCAaB2jw0-tsZXW4o-sgVf",
      department: "Informatique"
    },
    {
      id: 3,
      name: "M. Pierre Leroux",
      idNumber: "IM-10293",
      email: "j.dupont@univ.fr",
      status: "En ligne",
      statusType: "online",
      imageUrl: "https://lh3.googleusercontent.com/aida/ADBb0ujlEXVlDcAgNHg57LGCwMtJFD7wyk7MIzGmlNVk8tahUW4xk8r-C-oqhhLJpDzxeuoliRc39BkCSRzbSd20qFsE2xQuRX9KIsiEgkVaZFFwtSvZEY9hXMDTrQA7OW8KVOSKX1vY47OUq8eiJ-W-smsUQVoF_01ie3O6-wwDMpkx2_tyhQvG5R3ZiehzASy8JcOUzFPpH2f9NkSTTXCM3Y1512sR12Yjty1LOIfjKLRJrggq1QZxeIX3",
      department: "Langues"
    }
  ];

  const getStatusBadgeClasses = (statusType) => {
    if (statusType === 'online') {
      return "px-3 py-1 rounded-full bg-[#6dfad2] text-[#00725b] font-label text-[10px] font-bold shadow-sm uppercase";
    }
    return "px-3 py-1 rounded-full bg-[#e7e8ec] text-[#434749] font-label text-[10px] font-bold shadow-sm uppercase";
  };

  return (
    <div className="bg-[#f8f9fd] font-body text-[#191c1f] antialiased min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Segmented Control Navigation - STYLE DEMANDES */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 p-1 bg-[#edeef2] rounded-full shadow-sm border border-[#c3c7c8]">
              <button 
                onClick={() => setCurrentView('professeurs')}
                className="px-8 py-2.5 rounded-full text-white font-semibold shadow-md active:scale-95 transition-all duration-200"
                style={{ backgroundColor: '#06d6a0' }}
              >
                Professeurs
              </button>
              <button 
                onClick={() => setCurrentView('demandes')}
                className="px-8 py-2.5 rounded-full text-[#191c1f] font-semibold transition-all duration-200 hover:bg-[#e7e8ec]"
              >
                Demandes
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#434749]/60 text-xl">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 border border-[#c3c7c8]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#181f21]/10 focus:border-[#181f21] transition-all placeholder:text-[#434749]/50 bg-white" 
                placeholder="Rechercher un professeur..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none inline-flex items-center justify-between gap-2 px-5 py-3 border border-[#c3c7c8]/20 rounded-xl text-sm font-medium text-[#434749] hover:bg-[#edeef2] transition-colors bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">route</span>
                  Parcours
                </span>
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </button>
              <button className="flex-1 md:flex-none inline-flex items-center justify-between gap-2 px-5 py-3 border border-[#c3c7c8]/20 rounded-xl text-sm font-medium text-[#434749] hover:bg-[#edeef2] transition-colors bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">layers</span>
                  Niveau
                </span>
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </button>
              <button className="p-3 text-[#434749] hover:bg-[#e1e2e6]/50 rounded-xl transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </div>

          {/* Department: Informatique */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {professors.filter(p => p.department === "Informatique").map((professor) => (
                <div 
                  key={professor.id}
                  className="bg-white rounded-xl shadow-lg shadow-black/5 overflow-hidden flex flex-col border border-[#c3c7c8]/10 hover:translate-y-[-4px] transition-all duration-300"
                >
                  <div className="relative h-48 w-full">
                    <img 
                      alt={professor.name} 
                      className="w-full h-full object-cover" 
                      src={professor.imageUrl}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={getStatusBadgeClasses(professor.statusType)}>
                        {professor.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h4 className="font-display text-xl font-bold text-[#191c1f]">{professor.name}</h4>
                    </div>
                    <div className="space-y-3 mb-6">
                      <p className="text-sm text-[#434749] flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg text-[#08D9D6]">fingerprint</span>
                        <span>{professor.idNumber}</span>
                      </p>
                      <p className="text-sm text-[#434749] flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg text-[#08D9D6]">mail</span>
                        <span>{professor.email}</span>
                      </p>
                    </div>
                    <div className="flex items-center mt-auto pt-4 border-t border-[#c3c7c8]/10 justify-end">
                      <button className="p-2 rounded-full hover:bg-[#e1e2e6]/50 transition-colors text-[#434749]">
                        <span className="material-symbols-outlined">settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Department: Langues */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {professors.filter(p => p.department === "Langues").map((professor) => (
                <div 
                  key={professor.id}
                  className="bg-white rounded-xl shadow-lg shadow-black/5 overflow-hidden flex flex-col border border-[#c3c7c8]/10 hover:translate-y-[-4px] transition-all duration-300"
                >
                  <div className="relative h-48 w-full">
                    <img 
                      alt={professor.name} 
                      className="w-full h-full object-cover" 
                      src={professor.imageUrl}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={getStatusBadgeClasses(professor.statusType)}>
                        {professor.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h4 className="font-display text-xl font-bold text-[#191c1f]">{professor.name}</h4>
                    </div>
                    <div className="space-y-3 mb-6">
                      <p className="text-sm text-[#434749] flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg text-[#08D9D6]">fingerprint</span>
                        <span>{professor.idNumber}</span>
                      </p>
                      <p className="text-sm text-[#434749] flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg text-[#08D9D6]">mail</span>
                        <span>{professor.email}</span>
                      </p>
                    </div>
                    <div className="flex items-center mt-auto pt-4 border-t border-[#c3c7c8]/10 justify-end">
                      <button className="p-2 rounded-full hover:bg-[#e1e2e6]/50 transition-colors text-[#434749]">
                        <span className="material-symbols-outlined">settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfesseursInterface;