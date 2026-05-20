import React, { useState } from 'react';

const NouvelleAffectationModal = ({ isOpen, onClose, onAssign }) => {
  const [formData, setFormData] = useState({
    course: '',
    professor: '',
    parcours: '',
    niveau: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    if (onAssign) {
      onAssign(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background Screen Simulation (Blurred Background) */}
      <div className="fixed inset-0 z-0 filter blur-sm grayscale-[20%] opacity-80">
        {/* Replicating Shell Structure */}
        <div className="flex h-screen">
          {/* Sidebar Simulation */}
          <aside className="w-64 border-r border-outline-variant bg-surface-container-low p-4 flex flex-col gap-2" style={{ backgroundColor: '#f2f3f7', borderColor: '#c3c7c8' }}>
            <div className="mb-8 px-4">
              <h1 className="text-headline-md font-bold text-primary" style={{ color: '#181f21' }}>Calendar</h1>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest" style={{ color: '#434749', fontFamily: "'JetBrains Mono', monospace" }}>School Management</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-semibold" style={{ backgroundColor: '#4BB8FA20', color: '#4BB8FA' }}>
              <span className="material-symbols-outlined">assignment_ind</span>
              <span className="font-headline">Cours & Affectation</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant" style={{ color: '#434749' }}>
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-headline">Tableau de bord</span>
            </div>
          </aside>

          {/* Main Content Simulation */}
          <main className="flex-1 overflow-auto">
            <header className="h-16 px-6 bg-surface-bright border-b border-outline-variant flex items-center justify-between" style={{ backgroundColor: '#f8f9fd', borderColor: '#c3c7c8' }}>
              <div className="flex-1 max-w-md bg-surface-container rounded-lg px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#edeef2' }}>
                <span className="material-symbols-outlined text-outline" style={{ color: '#747879' }}>search</span>
                <span className="text-on-surface-variant" style={{ color: '#434749' }}>Rechercher...</span>
              </div>
            </header>
            <div className="p-8">
              <div className="grid grid-cols-12 gap-6">
                {/* Bento Grid Placeholder Content */}
                <div className="col-span-12 h-64 bg-surface-container-highest rounded-lg border border-outline-variant" style={{ backgroundColor: '#e1e2e6', borderColor: '#c3c7c8' }}></div>
                <div className="col-span-4 h-48 bg-surface-container-highest rounded-lg border border-outline-variant" style={{ backgroundColor: '#e1e2e6', borderColor: '#c3c7c8' }}></div>
                <div className="col-span-4 h-48 bg-surface-container-highest rounded-lg border border-outline-variant" style={{ backgroundColor: '#e1e2e6', borderColor: '#c3c7c8' }}></div>
                <div className="col-span-4 h-48 bg-surface-container-highest rounded-lg border border-outline-variant" style={{ backgroundColor: '#e1e2e6', borderColor: '#c3c7c8' }}></div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-md" style={{ backgroundColor: 'rgba(46, 49, 52, 0.3)' }}>
        <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ backgroundColor: '#ffffff' }}>
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between" style={{ borderColor: '#c3c7c8' }}>
            <h2 className="text-xl font-headline font-bold text-on-surface" style={{ color: '#191c1f' }}>Affectation d'un professeur</h2>
            <button 
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              style={{ color: '#434749' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="course" style={{ color: '#434749' }}>Cours</label>
              <div className="relative">
                <input 
                  className="w-full pl-4 pr-10 py-2 bg-surface rounded-lg border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-on-surface" 
                  style={{ backgroundColor: '#f8f9fd', borderColor: '#c3c7c8', color: '#191c1f' }}
                  id="course" 
                  placeholder="Rechercher un cours..." 
                  type="text"
                  value={formData.course}
                  onChange={handleChange}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ color: '#434749' }}>keyboard_arrow_down</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="professor" style={{ color: '#434749' }}>Professeur</label>
              <div className="relative">
                <select 
                  id="professor" 
                  className="w-full pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-on-surface"
                  style={{ borderColor: '#c3c7c8', backgroundColor: '#f8f9fd', color: '#191c1f' }}
                  value={formData.professor}
                  onChange={handleChange}
                >
                  <option value="" disabled>Nom du professeur...</option>
                  <option value="1">Dr. Jean Dupont</option>
                  <option value="2">Pr. Marie Curie</option>
                  <option value="3">M. Pierre Leroux</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ color: '#434749' }}>keyboard_arrow_down</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="parcours" style={{ color: '#434749' }}>Parcours</label>
              <div className="relative">
                <select 
                  id="parcours" 
                  className="w-full pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-on-surface"
                  style={{ borderColor: '#c3c7c8', backgroundColor: '#f8f9fd', color: '#191c1f' }}
                  value={formData.parcours}
                  onChange={handleChange}
                >
                  <option value="" disabled>Sélectionner un parcours...</option>
                  <option value="da2i">Informatique (DA2I)</option>
                  <option value="aes">Management (AES)</option>
                  <option value="icm">Multimédia (ICM)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ color: '#434749' }}>keyboard_arrow_down</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="niveau" style={{ color: '#434749' }}>Niveau</label>
              <div className="relative">
                <select 
                  id="niveau" 
                  className="w-full pl-4 pr-10 py-2 border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-on-surface"
                  style={{ borderColor: '#c3c7c8', backgroundColor: '#f8f9fd', color: '#191c1f' }}
                  value={formData.niveau}
                  onChange={handleChange}
                >
                  <option value="" disabled>Sélectionner un niveau...</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="M1">M1</option>
                  <option value="M2">M2</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ color: '#434749' }}>keyboard_arrow_down</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-surface-container-low flex items-center justify-end gap-3" style={{ backgroundColor: '#f2f3f7' }}>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              style={{ color: '#434749' }}
            >
              Annuler
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-secondary text-on-secondary rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              style={{ backgroundColor: '#4BB8FA', color: '#ffffff' }}
            >
              Assigner
            </button>
          </div>
        </div>
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
    </>
  );
};

export default NouvelleAffectationModal;