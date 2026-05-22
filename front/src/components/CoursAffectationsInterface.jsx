import React, { useState } from 'react';
import AffectationPage from './AffectationPage';
import CoursPage from './CoursPage';

const CoursAffectationsLayout = () => {
  const [activeTab, setActiveTab] = useState('affectation');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fd' }}>
      <main className="flex-1">
        <div className=" max-w-[1000px] mx-auto">
          {/* Navigation par onglets avec boutons arrondis */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex  p-1 bg-white/50 backdrop-blur-sm rounded-full shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => setActiveTab('affectation')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === 'affectation'
                    ? 'bg-sky-500 text-white shadow-md transform scale-105'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={activeTab === 'affectation' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
              >
                <span className="flex items-center gap-1">
                  
                  Affectation
                </span>
              </button>
              <button
                onClick={() => setActiveTab('cours')}
                className={`px-8 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === 'cours'
                    ? 'bg-sky-500 text-white shadow-md transform scale-105'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={activeTab === 'cours' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
              >
                <span className="flex items-center gap-2">
                  
                  Cours
                </span>
              </button>
            </div>
          </div>

          {/* Contenu dynamique */}
          <div className="fade-in">
            {activeTab === 'affectation' ? <AffectationPage /> : <CoursPage />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursAffectationsLayout;