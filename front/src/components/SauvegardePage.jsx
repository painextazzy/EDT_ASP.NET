// src/components/SauvegardePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileJson,
  Database,
  Users,
  BookOpen,
  DoorOpen,
  Calendar,
  CloudUpload,
  FileUp,
  X
} from 'lucide-react';
import api from '../services/api';

const SauvegardePage = () => {
  const [recentActions, setRecentActions] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Afficher une notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Charger les actions récentes depuis localStorage (historique local)
  useEffect(() => {
    loadRecentActions();
  }, []);

  const loadRecentActions = () => {
    const actions = JSON.parse(localStorage.getItem('recent_actions_backup') || '[]');
    setRecentActions(actions);
  };

  const addRecentAction = (action, details, status = 'success') => {
    const newAction = {
      id: Date.now(),
      action,
      details,
      status,
      date: new Date().toISOString(),
      user: 'Administrateur'
    };
    
    const updatedActions = [newAction, ...recentActions].slice(0, 20);
    setRecentActions(updatedActions);
    localStorage.setItem('recent_actions_backup', JSON.stringify(updatedActions));
  };

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        processImportFile(file);
      } else {
        showToast('Veuillez déposer un fichier JSON valide', 'error');
      }
    }
  };

  const processImportFile = async (file) => {
    setImportFile(file);
    
    try {
      // Valider le fichier
      const validation = await api.backup.validateFile(file);
      setImportPreview(validation);
      setShowImportModal(true);
    } catch (error) {
      showToast(error.message, 'error');
      setImportFile(null);
    }
  };

  // Export vers l'API
  const handleExport = async () => {
    setLoading(true);
    
    try {
      await api.backup.export({
        includeEnseignants: true,
        includeUtilisateurs: true,
        includeCours: true,
        includeNiveaux: true,
        includeParcours: true,
        includeEnseignements: true
      });
      
      addRecentAction('Export JSON', 'Export des données vers JSON');
      showToast('Export effectué avec succès !', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Erreur lors de l\'export: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Import des données
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImportFile(file);
    }
  };

  const confirmImport = async () => {
    if (!importFile) return;
    
    setLoading(true);
    
    try {
      const result = await api.backup.import(importFile);
      
      addRecentAction('Import', `Import des données - ${importFile.name}`);
      showToast(`${result.message} (${result.tablesRestored} tables restaurées)`, 'success');
      
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview(null);
      
      // Recharger la page après import
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      showToast('Erreur lors de l\'import: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    return `Il y a ${days} j`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Succès';
      case 'error':
        return 'Échec';
      default:
        return 'En cours';
    }
  };

  // Composant Toast
  const ToastNotification = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white min-w-[300px]`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6" onDragEnter={handleDragEnter}>
      {/* Toast Notification */}
      <ToastNotification />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 min-w-[300px] text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Traitement en cours...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sauvegarde des données</h1>
        <p className="text-sm text-gray-500 mt-1">Exportez ou importez vos données depuis la base</p>
      </div>

      {/* Cardboxes Export & Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Export */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Download className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">JSON uniquement</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Export des données</h3>
            <p className="text-sm text-gray-500 mb-6">
              Téléchargez toutes vos données au format JSON.
            </p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileJson className="w-4 h-4" />
              Exporter en JSON
            </button>
          </div>
        </div>

        {/* Card Import avec Drag & Drop */}
        <div 
          className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all duration-200 ${
            isDragging 
              ? 'border-green-500 border-2 bg-green-50 scale-[1.02]' 
              : 'border-gray-100 hover:shadow-lg'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                isDragging ? 'bg-green-200' : 'bg-purple-100'
              }`}>
                {isDragging ? (
                  <CloudUpload className="w-7 h-7 text-green-600 animate-bounce" />
                ) : (
                  <Upload className="w-7 h-7 text-purple-600" />
                )}
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Glisser-Déposer</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Import des données</h3>
            <p className="text-sm text-gray-500 mb-6">
              {isDragging 
                ? 'Déposez votre fichier JSON ici' 
                : 'Glissez-déposez un fichier JSON ou cliquez pour sélectionner'
              }
            </p>
            
            {/* Zone de drop */}
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-purple-400 bg-gray-50'
              }`}
              onClick={handleImportClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isDragging ? (
                <>
                  <CloudUpload className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
                  <p className="text-green-600 font-medium">Relâchez pour importer</p>
                  <p className="text-xs text-green-500 mt-1">Fichier JSON uniquement</p>
                </>
              ) : (
                <>
                  <FileUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Cliquez ou glissez un fichier</p>
                  <p className="text-xs text-gray-400 mt-1">Format JSON accepté</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des actions récentes */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Actions récentes</h2>
            <span className="text-xs text-gray-400 ml-auto">{recentActions.length} actions</span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {recentActions.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune action récente</p>
              <p className="text-xs text-gray-400 mt-1">Les exports et imports apparaîtront ici</p>
            </div>
          ) : (
            recentActions.map((action) => (
              <div key={action.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                      {action.action.includes('Export') ? (
                        <Download className="w-4 h-4 text-green-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{action.action}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          action.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {getStatusText(action.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{action.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{formatDate(action.date)}</p>
                    {getStatusIcon(action.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal d'import */}
      {showImportModal && importPreview && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white/30 z-50"
            onClick={() => setShowImportModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileJson className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Confirmer l'import</h2>
                </div>
                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Fichier : <span className="font-semibold">{importFile?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Enseignants</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.counts?.enseignants || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Utilisateurs</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.counts?.utilisateurs || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <BookOpen className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Cours</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.counts?.cours || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Calendar className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Niveaux</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.counts?.niveaux || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <BookOpen className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Parcours</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.counts?.parcours || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Database className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Enseignements</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.counts?.enseignements || 0}</p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs text-amber-700">
                    ⚠️ L'importation remplacera toutes les données actuelles.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={confirmImport} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
                  Importer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SauvegardePage;