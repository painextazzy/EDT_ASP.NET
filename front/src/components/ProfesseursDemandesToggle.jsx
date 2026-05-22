// src/components/ProfesseursDemandesToggle.jsx
import React, { useState } from 'react';
import ProfesseursPage from './ProfesseursPage';
import DemandesPage from './DemandesPage';

const ProfesseursDemandesToggle = () => {
  const [activeTab, setActiveTab] = useState('professeurs');

  return (
    <div className="w-full">
      <main className="flex-1">
        <div className="max-w-[1000px] mx-auto">
          {/* Navigation par onglets avec boutons arrondis */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-full shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              {/* Professeurs Toggle */}
              <button
                onClick={() => setActiveTab('professeurs')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === 'professeurs'
                    ? 'bg-sky-500 text-white shadow-md transform scale-105'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={activeTab === 'professeurs' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
              >
                <span className="flex items-center ">
                  
                  Professeurs
                </span>
              </button>

              {/* Demandes Toggle */}
              <button
                onClick={() => setActiveTab('demandes')}
                className={`px-8 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === 'demandes'
                    ? 'bg-sky-500 text-white shadow-md transform scale-105'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={activeTab === 'demandes' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
              >
                <span className="flex items-center">
                  
                  Demandes
                </span>
              </button>
            </div>
          </div>

          {/* Contenu dynamique */}
          <div className="fade-in">
            {activeTab === 'professeurs' ? <ProfesseursPage /> : <DemandesPage />}
          </div>
        </div>
      </main>

     
    </div>
  );
};

export default ProfesseursDemandesToggle;