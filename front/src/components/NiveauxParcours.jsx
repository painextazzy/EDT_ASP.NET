// src/components/NiveauxParcours.jsx
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ParcoursList from './ParcoursList';
import NiveauxList from './NiveauxList';

const initialParcours = [
  { id: 1, name: "Administration Économique et Sociale", icon: "account_balance" },
  { id: 2, name: "Dév. et Administration de l'Infra.", icon: "terminal" },
  { id: 3, name: "Ingénierie de Contenus Multimédia", icon: "video_library" }
];

const initialNiveaux = [
  { id: 1, name: "Licence 1 (L1)", code: "L1" },
  { id: 2, name: "Licence 2 (L2)", code: "L2" },
  { id: 3, name: "Licence 3 (L3)", code: "L3" },
  { id: 4, name: "Master 1 (M1)", code: "M1" },
  { id: 5, name: "Master 2 (M2)", code: "M2" }
];

const NiveauxParcours = () => {
  const [activeTab, setActiveTab] = useState('parcours');
  const [parcours, setParcours] = useLocalStorage('admin_parcours', initialParcours);
  const [niveaux, setNiveaux] = useLocalStorage('admin_niveaux', initialNiveaux);

  const addParcours = (name) => {
    const newId = Date.now();
    setParcours([...parcours, { id: newId, name, icon: 'school' }]);
  };

  const updateParcours = (id, newName) => {
    setParcours(parcours.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const deleteParcours = (id) => {
    if (window.confirm('Supprimer ce parcours ?')) {
      setParcours(parcours.filter(p => p.id !== id));
    }
  };

  const addNiveau = (name) => {
    const newId = Date.now();
    setNiveaux([...niveaux, { id: newId, name, code: name.substring(0, 3).toUpperCase() }]);
  };

  const updateNiveau = (id, newName) => {
    setNiveaux(niveaux.map(n => n.id === id ? { ...n, name: newName, code: newName.substring(0, 3).toUpperCase() } : n));
  };

  const deleteNiveau = (id) => {
    if (window.confirm('Supprimer ce niveau ?')) {
      setNiveaux(niveaux.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-8 p-2 md:p-4">
      {/* Onglets */}
      <div className="flex justify-center">
        <div className="inline-flex bg-white/50 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('parcours')}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === 'parcours'
                ? 'bg-sky-500 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            style={activeTab === 'parcours' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
          >
            Parcours
          </button>
          <button
            onClick={() => setActiveTab('niveaux')}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === 'niveaux'
                ? 'bg-sky-500 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            style={activeTab === 'niveaux' ? { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}}
          >
            Niveaux
          </button>
        </div>
      </div>

      {/* Contenu avec marge supplémentaire */}
      <div className="mt-6">
        {activeTab === 'parcours' ? (
          <ParcoursList
            items={parcours}
            onAdd={addParcours}
            onUpdate={updateParcours}
            onDelete={deleteParcours}
          />
        ) : (
          <NiveauxList
            items={niveaux}
            onAdd={addNiveau}
            onUpdate={updateNiveau}
            onDelete={deleteNiveau}
          />
        )}
      </div>
    </div>
  );
};

export default NiveauxParcours;