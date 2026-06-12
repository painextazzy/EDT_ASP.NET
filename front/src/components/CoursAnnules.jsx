import { useEffect, useState } from "react";
import axios from "axios";

const CoursAnnules = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCoursAnnules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "https://localhost:5001/api/cours/annules"
      );

      setCours(response.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des cours annulés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursAnnules();
  }, []);

  const filteredCours = cours.filter((c) =>
    c.titre?.toLowerCase().includes(search.toLowerCase()) ||
    c.enseignant?.toLowerCase().includes(search.toLowerCase()) ||
    c.salle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Cours annulés
        </h1>
        <p className="text-gray-500">
          Liste des cours qui ont été annulés
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="max-w-5xl mx-auto">
        {loading && (
          <p className="text-center text-gray-500">Chargement...</p>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && filteredCours.length === 0 && (
          <p className="text-center text-gray-500">
            Aucun cours annulé trouvé.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {filteredCours.map((cours) => (
            <div
              key={cours.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {cours.titre}
                </h2>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  Annulé
                </span>
              </div>

              <p className="text-gray-600">
                Enseignant : {cours.enseignant}
              </p>

              <p className="text-gray-600">
                Salle : {cours.salle}
              </p>

              <p className="text-gray-600">
                Heure : {cours.heure}
              </p>

              <p className="text-sm text-gray-400 mt-2">
                Motif : {cours.motif || "Non précisé"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursAnnules;