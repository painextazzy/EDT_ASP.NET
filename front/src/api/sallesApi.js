const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      data?.message ??
      (res.status === 404 ? "Ressource introuvable."
       : res.status === 409 ? "Conflit : cette salle existe déjà dans ce bâtiment."
       : res.status === 400 ? "Données invalides. Vérifiez les champs."
       : "Une erreur serveur s'est produite. Réessayez.");
    throw new Error(msg);
  }
  return data;
}

export const sallesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    ).toString();
    return request(`/salles${qs ? "?" + qs : ""}`);
  },
  getBatiments: () => request("/salles/batiments"),
  getEtages:    () => request("/salles/etages"),
  create: (dto) => request("/salles", { method: "POST", body: JSON.stringify(dto) }),
  update: (id, dto) => request(`/salles/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id) => request(`/salles/${id}`, { method: "DELETE" }),
};