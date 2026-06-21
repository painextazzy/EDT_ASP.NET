// src/services/signalr/coursAnnuleSocket.js
//
// Fichier de configuration dédié au websocket "Cours Annulés".
// Toute personne qui veut écouter/ajouter un événement temps réel
// pour ce module ajoute son code ici, sans toucher au reste du projet.

import * as signalR from '@microsoft/signalr';

const HUB_URL = `${import.meta.env.VITE_API_URL}/hubs/cours-annule`;

let connection = null;

/**
 * Crée (ou réutilise) la connexion SignalR vers le hub Cours Annulés.
 * Démarre automatiquement la reconnexion en cas de coupure réseau.
 */
export const getCoursAnnuleConnection = () => {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // backoff progressif
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
};

/**
 * Démarre la connexion si elle n'est pas déjà active.
 * Sûr à appeler plusieurs fois (idempotent).
 */
export const startCoursAnnuleConnection = async () => {
  const conn = getCoursAnnuleConnection();

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
      console.log('[SignalR] Connecté au hub cours-annule');
    } catch (error) {
      console.error('[SignalR] Échec de connexion au hub cours-annule', error);
    }
  }

  return conn;
};

/**
 * Arrête proprement la connexion (à appeler au démontage du composant
 * si plus personne n'écoute ce hub).
 */
export const stopCoursAnnuleConnection = async () => {
  if (connection) {
    await connection.stop();
  }
};

/**
 * Permet d'écouter un événement précis envoyé par le hub.
 * Exemple d'utilisation dans un composant :
 *
 *   useEffect(() => {
 *     const conn = getCoursAnnuleConnection();
 *     onCoursAnnuleEvent('coursAnnulesUpdated', () => loadData());
 *     return () => offCoursAnnuleEvent('coursAnnulesUpdated');
 *   }, []);
 */
export const onCoursAnnuleEvent = (eventName, callback) => {
  const conn = getCoursAnnuleConnection();
  conn.on(eventName, callback);
};

export const offCoursAnnuleEvent = (eventName) => {
  if (connection) {
    connection.off(eventName);
  }
};