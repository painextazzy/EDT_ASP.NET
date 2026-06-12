import { useState } from "react";
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
} from "lucide-react";

// Données statiques (inchangées)
const initialCards = [
  {
    id: 1,
    matiere: "Mathématiques",
    description: "Analyse complexe - TD Gr. B",
    icon: "functions",
    date: "Mardi 24 Octobre 2023",
    horaire: "08:30 — 10:30",
    salle: "Amphi A2 (Bâtiment Nord)",
    motif: "Absence enseignant (Maladie)",
  },
  {
    id: 2,
    matiere: "Algorithmique",
    description: "Structures de données avancées",
    icon: "terminal",
    date: "Mercredi 25 Octobre 2023",
    horaire: "14:00 — 17:00",
    salle: "Labo Info 04",
    motif: "Maintenance réseau planifiée",
  },
  {
    id: 3,
    matiere: "Physique Quantique",
    description: "Introduction aux états liés",
    icon: "science",
    date: "Jeudi 26 Octobre 2023",
    horaire: "10:45 — 12:45",
    salle: "Salle S-302",
    motif: "Réunion pédagogique urgente",
  },
  {
    id: 4,
    matiere: "Design Industriel",
    description: "Ergonomie et interface",
    icon: "architecture",
    date: "Vendredi 27 Octobre 2023",
    horaire: "09:00 — 12:00",
    salle: "Atelier Maquettes",
    motif: "Indisponibilité du matériel",
  },
  {
    id: 5,
    matiere: "Anglais Technique",
    description: "Business Communication",
    icon: "language",
    date: "Lundi 30 Octobre 2023",
    horaire: "15:30 — 17:30",
    salle: "Salle B-12",
    motif: "Absence enseignant",
  },
];

export default function CoursAnnules() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards = initialCards.filter(
    (card) =>
      card.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.motif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAnnulations = filteredCards.length;
  const absencesEnseignant = filteredCards.filter((c) =>
    c.motif.toLowerCase().includes("absence enseignant")
  ).length;
  const indisponibiliteSalle = totalAnnulations - absencesEnseignant;

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
          {/* Total Annulations */}
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

          {/* Absence Enseignant */}
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

          {/* Indisponibilité Salle */}
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
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              className="rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => console.log("Viewing details for:", card.matiere)}
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                {/* Icône + Titre */}
                <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">
                      {card.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{card.matiere}</h3>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                </div>

                {/* Date et horaire */}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{card.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{card.horaire}</span>
                  </div>
                </div>

                {/* Salle et motif */}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{card.salle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <Info className="w-4 h-4" />
                    <p className="text-xs font-medium">{card.motif}</p>
                  </div>
                </div>

                {/* Badge Annulé */}
                <Badge variant="destructive" className="gap-1 px-3 py-1 rounded-full">
                  <XCircle className="w-3 h-3" />
                  Annulé
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center justify-center py-10 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <span className="material-symbols-outlined text-lg">history</span>
            <span>Dernière mise à jour: Aujourd'hui à 11:24</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Les cours annulés sont automatiquement retirés de votre emploi du temps interactif.
            <br />
            Une notification est envoyée à tous les étudiants inscrits.
          </p>
        </div>
      </main>
    </div>
  );
}