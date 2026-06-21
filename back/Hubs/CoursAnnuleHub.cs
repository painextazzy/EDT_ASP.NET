using Microsoft.AspNetCore.SignalR;

namespace back.Hubs
{
    public class CoursAnnuleHub : Hub
    {
        // Le serveur pousse les mises à jour via IHubContext (voir Controller).
        // Pas de méthode cliente nécessaire pour l'instant.
    }
}