// src/components/ProfesseursDemandesToggle.jsx
import React, { useState, useContext } from 'react';
import ProfesseursPage from './ProfesseursPage';
import DemandesPage from './DemandesPage';
import { DemandesContext } from '../context/DemandesContext';

const ProfesseursDemandesToggle = () => {
  const [activeTab, setActiveTab] = useState('professeurs');
  const { count } = useContext(DemandesContext);

  return (
    <div className="w-full">
      <main className="flex-1">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-full shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => setActiveTab('professeurs')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === 'professeurs'
                    ? 'bg-sky-500 text-white shadow-md transform scale-105'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={activeTab === 'professeurs' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
              >
                Professeurs
              </button>

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
                  {count > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 animate-pulse">
                      {count}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="fade-in">
            {activeTab === 'professeurs' ? <ProfesseursPage /> : <DemandesPage />}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ProfesseursDemandesToggle;