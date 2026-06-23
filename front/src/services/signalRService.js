// src/services/signalRService.js
import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5181";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/mainHub`, {
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
    console.error('🔴 SignalR fermé:', error?.message || 'Erreur inconnue');
});

connection.onreconnecting((error) => {
    console.warn('🔄 Reconnexion SignalR...', error?.message || '');
});

connection.onreconnected((connectionId) => {
    console.log('✅ SignalR reconnecté, ID:', connectionId);
});

export default connection;