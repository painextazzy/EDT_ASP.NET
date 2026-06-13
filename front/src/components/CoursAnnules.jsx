import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Info,
  XCircle,
  UserX,
  DoorClosed,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL;

export default function CoursAnnules() {
  const [cours, setCours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    matiere: "",
    description: "",
    icon: "",
    date: "",
    horaire: "",
    salle: "",
    motif: "",
  });

  // Chargement initial
  useEffect(() => {
    fetchCours();
  }, []);

  const fetchCours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/coursannules`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setCours(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les cours annulés");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const filteredCours = cours.filter(
    (c) =>
      c.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.motif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAnnulations = filteredCours.length;
  const absencesEnseignant = filteredCours.filter((c) =>
    c.motif.toLowerCase().includes("absence enseignant")
  ).length;
  const indisponibiliteSalle = totalAnnulations - absencesEnseignant;

  // Ouvrir modal d'ajout
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      matiere: "",
      description: "",
      icon: "",
      date: new Date().toISOString().slice(0, 10),
      horaire: "",
      salle: "",
      motif: "",
    });
    setIsModalOpen(true);
  };

  // Ouvrir modal d'édition
  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      matiere: c.matiere,
      description: c.description,
      icon: c.icon,
      date: c.date.slice(0, 10),
      horaire: c.horaire,
      salle: c.salle,
      motif: c.motif,
    });
    setIsModalOpen(true);
  };

  // Enregistrer (création ou modification)
  const handleSave = async () => {
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/coursannules/${editingId}`
        : `${API_URL}/coursannules`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
      fetchCours();
      setIsModalOpen(false);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  // Suppression
  const handleDelete = async (id, matiere) => {
    if (!confirm(`Supprimer la suppression du cours "${matiere}" ?`)) return;
    try {
      const response = await fetch(`${API_URL}/coursannules/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      fetchCours();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full h-20 bg-transparent flex items-center justify-between px-8 md:px-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-sky-500 hover:bg-sky-600"
          >
            <Plus className="w-4 h-4" />
            Ajouter une annulation
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <Button variant="outline" className="gap-2 rounded-lg border-gray-200">
            <Filter className="w-4 h-4" />
            Filtrer
          </Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 md:px-16 py-8">
        {/* Statistiques */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl border-l-4 border-l-red-500 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Annulations
                </p>
                <p className="text-3xl font-bold text-gray-900">{totalAnnulations}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserX className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absence Enseignant
                </p>
                <p className="text-3xl font-bold text-gray-900">{absencesEnseignant}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <DoorClosed className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indisponibilité Salle
                </p>
                <p className="text-3xl font-bold text-gray-900">{indisponibiliteSalle}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des annulations */}
        <div className="space-y-4">
          {filteredCours.map((c) => (
            <Card
              key={c.id}
              className="rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                {/* Icône + Titre */}
                <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">
                      {c.icon || "event_busy"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{c.matiere}</h3>
                    <p className="text-sm text-gray-500">{c.description}</p>
                  </div>
                </div>

                {/* Date et horaire */}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(c.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{c.horaire}</span>
                  </div>
                </div>

                {/* Salle et motif */}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{c.salle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <Info className="w-4 h-4" />
                    <p className="text-xs font-medium">{c.motif}</p>
                  </div>
                </div>

                {/* Badge et actions */}
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="gap-1 px-3 py-1 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Annulé
                  </Badge>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.matiere)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center justify-center py-10 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <span className="material-symbols-outlined text-lg">history</span>
            <span>Dernière mise à jour: {new Date().toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Les cours annulés sont automatiquement retirés de votre emploi du temps interactif.
            <br />
            Une notification est envoyée à tous les étudiants inscrits.
          </p>
        </div>
      </main>

      {/* Modal d'ajout / modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier l'annulation" : "Ajouter une annulation"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="matiere">Matière *</Label>
              <Input
                id="matiere"
                value={formData.matiere}
                onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="icon">Icône (nom Material Icon)</Label>
              <Input
                id="icon"
                placeholder="functions, terminal, science..."
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="horaire">Horaire *</Label>
              <Input
                id="horaire"
                placeholder="08:30 — 10:30"
                value={formData.horaire}
                onChange={(e) => setFormData({ ...formData, horaire: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="salle">Salle</Label>
              <Input
                id="salle"
                value={formData.salle}
                onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="motif">Motif *</Label>
              <Input
                id="motif"
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600">
              {editingId ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}