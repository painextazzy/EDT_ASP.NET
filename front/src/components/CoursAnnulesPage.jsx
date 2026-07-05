import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, Save, AlertCircle } from 'lucide-react';
import coursAnnulesApi from '../services/coursAnnulesApi';
import { format } from 'date-fns';

const CoursAnnulesPage = () => {
  const [annules, setAnnules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAnnules();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAnnules = async () => {
    setLoading(true);
    try {
      const data = await coursAnnulesApi.getAll();
      setAnnules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement annulés:', error);
      showToast("Erreur lors du chargement des cours annulés", 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportJson = (items) => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `cours_annules_${new Date().toISOString().slice(0,10)}.json`);
    linkElement.click();
    showToast('Export JSON téléchargé', 'success');
  };

  const saveLocal = (items) => {
    try {
      localStorage.setItem('cours_annules_history', JSON.stringify(items));
      showToast('Historique enregistré localement', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement local', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'} border px-4 py-2 rounded-xl`}>{toast.message}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historique des cours annulés</h1>
          <p className="text-sm text-gray-500 mt-1">Liste des cours annulés avec motif et détails.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadAnnules()} className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => exportJson(annules)} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button onClick={() => saveLocal(annules)} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2">
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">Chargement...</div>
        )}

        {!loading && annules.length === 0 && (
          <div className="col-span-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">Aucun cours annulé trouvé</div>
        )}

        {annules.map((item) => {
          const title = item.enseignement?.cours?.nom || item.typeEvenement || 'Cours';
          const prof = item.enseignement?.enseignant?.nom || '';
          const motif = item.motifAnnulation?.trim();
          const motifLabel = motif ? motif : 'Aucun motif n’a été renseigné.';
          const salles = item.salles && Array.isArray(item.salles) ? item.salles.map(s => s.nom || s).join(', ') : '—';

          const toDate = (val) => {
            if (!val) return null;
            const d = new Date(val);
            return isNaN(d.getTime()) ? null : d;
          };

          const start = toDate(item.dateDebut);
          const end = toDate(item.dateFin);

          const formatSafe = (d, fmt) => {
            if (!d) return '—';
            try {
              return format(d, fmt);
            } catch (e) {
              return '—';
            }
          };

          return (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                  <p className="text-xs text-gray-500">{prof}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{formatSafe(start, 'dd/MM/yyyy')}</div>
                  <div>{formatSafe(start, 'HH:mm')} - {formatSafe(end, 'HH:mm')}</div>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-sm text-gray-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Cours annulé
                </div>
                <p><span className="font-medium">Salles:</span> {salles}</p>
                <div className={`rounded-xl border p-3 ${motif ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Motif d’annulation</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">{motifLabel}</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursAnnulesPage;
