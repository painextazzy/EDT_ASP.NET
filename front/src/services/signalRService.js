// src/services/signalRService.js
import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5181";
const getToken = () => localStorage.getItem("jwt_token");

let connection = null;
let startPromise = null;
let isStarted = false;

// Fonction pour créer la connexion (lazy)
const getConnection = () => {
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
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
            console.error('🔌 SignalR fermé:', error?.message || 'Erreur inconnue');
            isStarted = false;
            startPromise = null;
        });

        connection.onreconnecting((error) => {
            console.warn('🔄 Reconnexion SignalR...', error?.message || '');
        });

        connection.onreconnected((connectionId) => {
            console.log('✅ SignalR reconnecté, ID:', connectionId);
            isStarted = true;
        });
    }
    return connection;
};

export const startConnection = async () => {
    // Si déjà connecté, on retourne directement
    const conn = getConnection();
    if (conn.state === signalR.HubConnectionState.Connected) {
        console.log('✅ SignalR déjà connecté');
        return;
    }

    // Si un démarrage est en cours, on attend sa fin
    if (startPromise) {
        console.log('⏳ SignalR démarrage en cours...');
        return startPromise;
    }

    // Si la connexion est en cours de reconnexion, on attend
    if (conn.state === signalR.HubConnectionState.Reconnecting) {
        console.log('⏳ SignalR en reconnexion...');
        // On attend qu'elle soit reconnectée (via un événement)
        return new Promise((resolve) => {
            const check = () => {
                if (conn.state === signalR.HubConnectionState.Connected) {
                    resolve();
                } else {
                    setTimeout(check, 500);
                }
            };
            check();
        });
    }

    // Démarrer uniquement si l'état est 'Disconnected'
    if (conn.state === signalR.HubConnectionState.Disconnected) {
        console.log('🔄 Démarrage SignalR...');
        startPromise = conn.start()
            .then(() => {
                console.log('✅ SignalR connecté');
                isStarted = true;
                startPromise = null;
            })
            .catch((err) => {
                console.error('❌ Erreur démarrage SignalR:', err);
                startPromise = null;
                throw err;
            });
        return startPromise;
    } else {
        // État inattendu (Disconnecting, etc.)
        console.log(`⚠️ État SignalR inattendu : ${conn.state}`);
        return Promise.resolve();
    }
};

// Fonctions pour s'abonner aux événements
export const onDemandesCountUpdated = (callback) => {
    const conn = getConnection();
    conn.on('DemandesCountUpdated', callback);
    return () => {
        conn.off('DemandesCountUpdated', callback);
    };
};

export const onSallesUpdated = (callback) => {
    const conn = getConnection();
    conn.on('SallesUpdated', callback);
    return () => {
        conn.off('SallesUpdated', callback);
    };
};

export const onError = (callback) => {
    const conn = getConnection();
    conn.on('OnError', callback);
    return () => {
        conn.off('OnError', callback);
    };
};

export const onNewPlanning = (callback) => {
    const conn = getConnection();
    conn.on('NewPlanningNotification', callback);
    return () => conn.off('NewPlanningNotification', callback);
};

export const onPlanningNotification = (callback) => {
    const conn = getConnection();
    conn.on('PlanningNotification', callback);
    return () => conn.off('PlanningNotification', callback);
};

// Fonctions pour invoquer des méthodes du hub
export const refreshDemandesCount = async () => {
    try {
        await getConnection().invoke('RefreshDemandesCount');
    } catch (err) {
        console.error('❌ Erreur refreshDemandesCount:', err);
        throw err;
    }
};

export const refreshSalles = async () => {
    try {
        await getConnection().invoke('RefreshSalles');
    } catch (err) {
        console.error('❌ Erreur refreshSalles:', err);
        throw err;
    }
};

// Exposer la connexion si besoin
export default getConnection();