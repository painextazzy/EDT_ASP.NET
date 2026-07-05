// src/contexts/DemandesContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { startConnection, onDemandesCountUpdated, refreshDemandesCount } from '../services/signalRService';

// ✅ Exporter le contexte pour une utilisation directe
export const DemandesContext = createContext();

export const DemandesProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    startConnection().catch(err => console.warn('⚠️ SignalR déjà en cours', err));

    const unsubscribe = onDemandesCountUpdated((newCount) => {
      setCount(newCount);
    });

    return () => unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    await refreshDemandesCount();
  }, []);

  return (
    <DemandesContext.Provider value={{ count, refresh }}>
      {children}
    </DemandesContext.Provider>
  );
};