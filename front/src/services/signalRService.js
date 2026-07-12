// src/services/signalRService.js
import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5181";
const getToken = () => localStorage.getItem("jwt_token");

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/mainHub`, {
        accessTokenFactory: () => getToken(),
        withCredentials: false,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 1000;
            if (retryContext.previousRetryCount === 2) return 3000;
            if (retryContext.previousRetryCount === 3) return 5000;
            if (retryContext.previousRetryCount === 4) return 10000;
            return 30000;
        }
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

// Gestion des événements de connexion
connection.onclose((error) => {
    console.error(' SignalR fermé:', error?.message || 'Erreur inconnue');
});

connection.onreconnecting((error) => {
    console.warn(' Reconnexion SignalR...', error?.message || '');
});

connection.onreconnected((connectionId) => {
    console.log(' SignalR reconnecté, ID:', connectionId);
});

// Démarrer la connexion automatiquement ?
// On peut le faire ici, mais mieux vaut le faire à l'initialisation de l'app.
// Exportons une fonction de démarrage.

let started = false;

export const startConnection = async () => {
    if (started) return;
    try {
        await connection.start();
        started = true;
        console.log('SignalR connecté');
    } catch (err) {
        console.error(' Erreur démarrage SignalR:', err);
        throw err;
    }
};

// Fonctions pour s'abonner aux événements
export const onDemandesCountUpdated = (callback) => {
    connection.on('DemandesCountUpdated', callback);
    // Retourner une fonction de désabonnement
    return () => {
        connection.off('DemandesCountUpdated', callback);
    };
};

export const onSallesUpdated = (callback) => {
    connection.on('SallesUpdated', callback);
    return () => {
        connection.off('SallesUpdated', callback);
    };
};

export const onError = (callback) => {
    connection.on('OnError', callback);
    return () => {
        connection.off('OnError', callback);
    };
};
// écouter les notifications de nouveau planning
export const onNewPlanning = (callback) => {
    connection.on('NewPlanningNotification', callback);
    return () => connection.off('NewPlanningNotification', callback);
};

export const onPlanningNotification = (callback) => {
    connection.on('PlanningNotification', callback);
    return () => connection.off('PlanningNotification', callback);
};

// Fonctions pour invoquer des méthodes du hub
export const refreshDemandesCount = async () => {
    try {
        await connection.invoke('RefreshDemandesCount');
    } catch (err) {
        console.error(' Erreur refreshDemandesCount:', err);
        throw err;
    }
};

export const refreshSalles = async () => {
    try {
        await connection.invoke('RefreshSalles');
    } catch (err) {
        console.error(' Erreur refreshSalles:', err);
        throw err;
    }
};

// Exposer la connexion si besoin
export default connection;