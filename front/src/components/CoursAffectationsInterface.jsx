import React, { useState } from 'react';

const CoursAffectationsInterface = ({ onOpenModal }) => {
  const [activeTab, setActiveTab] = useState('affectation');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMention, setSelectedMention] = useState('Toutes les Mentions');
  const [selectedNiveau, setSelectedNiveau] = useState('Tous les Niveaux');

  const courses = {
    Informatique: [
      {
        id: 1,
        code: "INFO-402",
        name: "Algorithmique Avancée",
        professor: "Pr. Marc Lefebvre",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0uj3r36Vo_Q1OXgDVTMTTiHV_CxzzQBSlLj7NrayZQaulvmLWnyYvVVChZ8pe4ajSEaBg5ImGES1XbeR9pF6-1lTgI-WhlempworGeCUVXNamYpowmRUyOnAa4FhBqrr8JpgxBUqmUxUB98Qmi_YlhPFVRN1cDQj-hO6LcL0DvA1UWUm6E_wwVA5v1JTnihT2v6E8EJPU08E-gRwnpO4wQVQgK0jQUaHZ8OCRbVNspTc7YGOHR7Hzdkd",
        niveau: "L3"
      },
      {
        id: 2,
        code: "INFO-403",
        name: "Programmation Web",
        professor: "Pr. Marc Lefebvre",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0uj3r36Vo_Q1OXgDVTMTTiHV_CxzzQBSlLj7NrayZQaulvmLWnyYvVVChZ8pe4ajSEaBg5ImGES1XbeR9pF6-1lTgI-WhlempworGeCUVXNamYpowmRUyOnAa4FhBqrr8JpgxBUqmUxUB98Qmi_YlhPFVRN1cDQj-hO6LcL0DvA1UWUm6E_wwVA5v1JTnihT2v6E8EJPU08E-gRwnpO4wQVQgK0jQUaHZ8OCRbVNspTc7YGOHR7Hzdkd",
        niveau: "L3"
      },
      {
        id: 3,
        code: "INFO-404",
        name: "Bases de Données",
        professor: "Pr. Marc Lefebvre",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0uj3r36Vo_Q1OXgDVTMTTiHV_CxzzQBSlLj7NrayZQaulvmLWnyYvVVChZ8pe4ajSEaBg5ImGES1XbeR9pF6-1lTgI-WhlempworGeCUVXNamYpowmRUyOnAa4FhBqrr8JpgxBUqmUxUB98Qmi_YlhPFVRN1cDQj-hO6LcL0DvA1UWUm6E_wwVA5v1JTnihT2v6E8EJPU08E-gRwnpO4wQVQgK0jQUaHZ8OCRbVNspTc7YGOHR7Hzdkd",
        niveau: "L3"
      }
    ],
    Management: [
      {
        id: 4,
        code: "MGMT-101",
        name: "Introduction au Management",
        professor: "Mme. Sarah Bernard",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ug5MsUgqCqklRqxYxiubo-zWXA2BMrW-amDvJ7bAqIEdibpdIEh_hLeFPpwb5GZX8cXrd5b5Rs5_k-BEOuUxqTDAF9LuD5TaQ_ozX1ENLGUiL5QeaDxr_fnAF8j-_2zuYOtnpcZxoHcEauXa2BS6wXxYc8qLF2sjexL1BdDx6rIyhmzTckx5whFj0Z_At-RSOBjtLxXGeUNNeRkGqJSo3QigZ7JpfOEu5RqxuPPRa1RSLLEOB7EbUJ3",
        niveau: "L1"
      },
      {
        id: 5,
        code: "MGMT-102",
        name: "Marketing Digital",
        professor: "Mme. Sarah Bernard",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ug5MsUgqCqklRqxYxiubo-zWXA2BMrW-amDvJ7bAqIEdibpdIEh_hLeFPpwb5GZX8cXrd5b5Rs5_k-BEOuUxqTDAF9LuD5TaQ_ozX1ENLGUiL5QeaDxr_fnAF8j-_2zuYOtnpcZxoHcEauXa2BS6wXxYc8qLF2sjexL1BdDx6rIyhmzTckx5whFj0Z_At-RSOBjtLxXGeUNNeRkGqJSo3QigZ7JpfOEu5RqxuPPRa1RSLLEOB7EbUJ3",
        niveau: "L1"
      },
      {
        id: 6,
        code: "MGMT-103",
        name: "Gestion de Projet",
        professor: "Mme. Sarah Bernard",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ug5MsUgqCqklRqxYxiubo-zWXA2BMrW-amDvJ7bAqIEdibpdIEh_hLeFPpwb5GZX8cXrd5b5Rs5_k-BEOuUxqTDAF9LuD5TaQ_ozX1ENLGUiL5QeaDxr_fnAF8j-_2zuYOtnpcZxoHcEauXa2BS6wXxYc8qLF2sjexL1BdDx6rIyhmzTckx5whFj0Z_At-RSOBjtLxXGeUNNeRkGqJSo3QigZ7JpfOEu5RqxuPPRa1RSLLEOB7EbUJ3",
        niveau: "L1"
      }
    ],
    Multimedia: [
      {
        id: 7,
        code: "MM-305",
        name: "Design UI/UX",
        professor: "Pr. David Roche",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ugRnC3mfVhjcPyJXez2EiXR1j-c1m6vIdWLW7dl_A7E6RQR-5Fo2lMZw3Ng4ZvHold_5btTYj_lqW5JQAgecbUpEqB0o70rur-5WkyFmopZKeamARFjv7L2ZHkAkZ2UWQqu45KQIpIfaffcFr0X8E_b67Nh8wjPypt6JsnQhP6J5G_7S0sYKlL4LEDCz6lz9CxNGqNvoTXlw9-pFU_diGrp1YA0IOHsljldqwf7Sgo97XpT9PGc93oH",
        niveau: "L3"
      },
      {
        id: 8,
        code: "MM-306",
        name: "Animation 3D",
        professor: "Pr. David Roche",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ugRnC3mfVhjcPyJXez2EiXR1j-c1m6vIdWLW7dl_A7E6RQR-5Fo2lMZw3Ng4ZvHold_5btTYj_lqW5JQAgecbUpEqB0o70rur-5WkyFmopZKeamARFjv7L2ZHkAkZ2UWQqu45KQIpIfaffcFr0X8E_b67Nh8wjPypt6JsnQhP6J5G_7S0sYKlL4LEDCz6lz9CxNGqNvoTXlw9-pFU_diGrp1YA0IOHsljldqwf7Sgo97XpT9PGc93oH",
        niveau: "L3"
      },
      {
        id: 9,
        code: "MM-307",
        name: "Montage Vidéo",
        professor: "Pr. David Roche",
        professorAvatar: "https://lh3.googleusercontent.com/aida/ADBb0ugRnC3mfVhjcPyJXez2EiXR1j-c1m6vIdWLW7dl_A7E6RQR-5Fo2lMZw3Ng4ZvHold_5btTYj_lqW5JQAgecbUpEqB0o70rur-5WkyFmopZKeamARFjv7L2ZHkAkZ2UWQqu45KQIpIfaffcFr0X8E_b67Nh8wjPypt6JsnQhP6J5G_7S0sYKlL4LEDCz6lz9CxNGqNvoTXlw9-pFU_diGrp1YA0IOHsljldqwf7Sgo97XpT9PGc93oH",
        niveau: "L3"
      }
    ]
  };

  return (
    <div className="bg-background text-on-surface flex min-h-screen" style={{ backgroundColor: '#f8f9fd', color: '#191c1f' }}>
      <main className="flex-1 min-h-screen">
        <div className="p-8 max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-primary tracking-tight mb-2" style={{ color: '#181f21' }}>Cours & Affectations</h1>
              <div className="flex gap-4"></div>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant rounded-xl" style={{ backgroundColor: '#f2f3f7', borderColor: '#c3c7c8' }}>
              <button 
                onClick={() => setActiveTab('affectation')}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'affectation' 
                    ? 'text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                style={activeTab === 'affectation' ? { backgroundColor: '#4BB8FA' } : { color: '#434749' }}
              >
                Affectation
              </button>
              <button 
                onClick={() => setActiveTab('cours')}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'cours' 
                    ? 'text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                style={activeTab === 'cours' ? { backgroundColor: '#4BB8FA' } : { color: '#434749' }}
              >
                Cours
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row items-center gap-4 mb-12">
            <div className="relative flex-1 w-full lg:w-auto">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ color: '#747879' }}>search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all outline-none text-sm" 
                style={{ backgroundColor: '#f2f3f7', borderColor: '#c3c7c8' }}
                placeholder="Rechercher un cours ou un professeur..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              <div className="relative group">
                <select 
                  className="appearance-none bg-surface-container-low border border-outline-variant px-4 py-3 pr-10 rounded-xl text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-secondary outline-none cursor-pointer"
                  style={{ backgroundColor: '#f2f3f7', borderColor: '#c3c7c8', color: '#434749' }}
                  value={selectedMention}
                  onChange={(e) => setSelectedMention(e.target.value)}
                >
                  <option>Toutes les Mentions</option>
                  <option>Informatique</option>
                  <option>Management</option>
                  <option>Multimedia</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ color: '#434749' }}>expand_more</span>
              </div>
              <div className="relative group">
                <select 
                  className="appearance-none bg-surface-container-low border border-outline-variant px-4 py-3 pr-10 rounded-xl text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-secondary outline-none cursor-pointer"
                  style={{ backgroundColor: '#f2f3f7', borderColor: '#c3c7c8', color: '#434749' }}
                  value={selectedNiveau}
                  onChange={(e) => setSelectedNiveau(e.target.value)}
                >
                  <option>Tous les Niveaux</option>
                  <option>L1</option>
                  <option>L2</option>
                  <option>L3</option>
                  <option>M1</option>
                  <option>M2</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ color: '#434749' }}>expand_more</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-12">
            {/* Informatique Section */}
            {(selectedMention === 'Toutes les Mentions' || selectedMention === 'Informatique') && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" style={{ backgroundColor: '#4BB8FA' }}></span>
                  <h2 className="text-xl font-bold text-primary" style={{ color: '#181f21' }}>Informatique</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:grid-cols-3">
                  {courses.Informatique.map((course) => (
                    <div key={course.id} className="p-6 rounded-xl border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow relative bg-white shadow-md" style={{ borderColor: '#c3c7c8' }}>
                      <div className="flex flex-col">
                        <span className="text-xs font-label mb-1" style={{ color: '#4BB8FA', fontFamily: "'JetBrains Mono', monospace" }}>{course.code}</span>
                        <h3 className="text-lg font-bold text-primary" style={{ color: '#181f21' }}>{course.name}</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium -mb-3" style={{ color: '#636e72' }}>Assigné à</span>
                      <div className="flex items-center gap-2">
                        <img src={course.professorAvatar} alt={course.professor} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm text-on-surface-variant" style={{ color: '#434749' }}>{course.professor}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 text-xs border border-outline-variant rounded-full text-on-surface-variant bg-surface-container-lowest" style={{ borderColor: '#c3c7c8', color: '#434749', backgroundColor: '#ffffff' }}>Informatique</span>
                        <span className="px-3 py-1 text-xs border border-outline-variant rounded-full text-on-surface-variant bg-surface-container-lowest" style={{ borderColor: '#c3c7c8', color: '#434749', backgroundColor: '#ffffff' }}>{course.niveau}</span>
                      </div>
                      <button className="absolute bottom-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors" style={{ color: '#434749' }}>
                        <span className="material-symbols-outlined">settings</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Management Section */}
            {(selectedMention === 'Toutes les Mentions' || selectedMention === 'Management') && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" style={{ backgroundColor: '#4BB8FA' }}></span>
                  <h2 className="text-xl font-bold text-primary" style={{ color: '#181f21' }}>Management</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:grid-cols-3">
                  {courses.Management.map((course) => (
                    <div key={course.id} className="p-6 rounded-xl border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow relative bg-white shadow-md" style={{ borderColor: '#c3c7c8' }}>
                      <div className="flex flex-col">
                        <span className="text-xs font-label mb-1" style={{ color: '#4BB8FA', fontFamily: "'JetBrains Mono', monospace" }}>{course.code}</span>
                        <h3 className="text-lg font-bold text-primary" style={{ color: '#181f21' }}>{course.name}</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium -mb-3" style={{ color: '#636e72' }}>Assigné à</span>
                      <div className="flex items-center gap-2">
                        <img src={course.professorAvatar} alt={course.professor} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm text-on-surface-variant" style={{ color: '#434749' }}>{course.professor}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 text-xs border border-outline-variant rounded-full text-on-surface-variant bg-surface-container-lowest" style={{ borderColor: '#c3c7c8', color: '#434749', backgroundColor: '#ffffff' }}>Management</span>
                        <span className="px-3 py-1 text-xs border border-outline-variant rounded-full text-on-surface-variant bg-surface-container-lowest" style={{ borderColor: '#c3c7c8', color: '#434749', backgroundColor: '#ffffff' }}>{course.niveau}</span>
                      </div>
                      <button className="absolute bottom-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors" style={{ color: '#434749' }}>
                        <span className="material-symbols-outlined">settings</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Multimedia Section */}
            {(selectedMention === 'Toutes les Mentions' || selectedMention === 'Multimedia') && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" style={{ backgroundColor: '#4BB8FA' }}></span>
                  <h2 className="text-xl font-bold text-primary" style={{ color: '#181f21' }}>Multimedia</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:grid-cols-3">
                  {courses.Multimedia.map((course) => (
                    <div key={course.id} className="p-6 rounded-xl border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow relative bg-white shadow-md" style={{ borderColor: '#c3c7c8' }}>
                      <div className="flex flex-col">
                        <span className="text-xs font-label mb-1" style={{ color: '#4BB8FA', fontFamily: "'JetBrains Mono', monospace" }}>{course.code}</span>
                        <h3 className="text-lg font-bold text-primary" style={{ color: '#181f21' }}>{course.name}</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium -mb-3" style={{ color: '#636e72' }}>Assigné à</span>
                      <div className="flex items-center gap-2">
                        <img src={course.professorAvatar} alt={course.professor} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm text-on-surface-variant" style={{ color: '#434749' }}>{course.professor}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 text-xs border border-outline-variant rounded-full text-on-surface-variant bg-surface-container-lowest" style={{ borderColor: '#c3c7c8', color: '#434749', backgroundColor: '#ffffff' }}>Multimedia</span>
                        <span className="px-3 py-1 text-xs border border-outline-variant rounded-full text-on-surface-variant bg-surface-container-lowest" style={{ borderColor: '#c3c7c8', color: '#434749', backgroundColor: '#ffffff' }}>{course.niveau}</span>
                      </div>
                      <button className="absolute bottom-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors" style={{ color: '#434749' }}>
                        <span className="material-symbols-outlined">settings</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* FAB Action - AJOUT DE LA FONCTIONNALITÉ D'OUVERTURE DE MODALE */}
      <div className="fixed bottom-8 right-8">
        <button 
          onClick={onOpenModal}
          className="w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          style={{ backgroundColor: '#4BB8FA', color: '#ffffff' }}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      <style>{`
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

export default CoursAffectationsInterface;