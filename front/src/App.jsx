import React, { useState } from 'react';
import ProfesseursInterface from './components/Professeurs';
import DemandesInterface from './components/Demandes';

function App() {
  const [currentView, setCurrentView] = useState('professeurs');

  return (
    <>
      {currentView === 'professeurs' ? (
        <ProfesseursInterface setCurrentView={setCurrentView} />
      ) : (
        <DemandesInterface setCurrentView={setCurrentView} />
      )}
    </>
  );
}

export default App;