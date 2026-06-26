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
  X,
  Loader2,
  FileCheck,
  File
} from 'lucide-react';
import api from '../services/api';
import { authApi } from '../services/auth'; // ✅ Import authApi pour le token

const SauvegardePage = () => {
  const [recentActions, setRecentActions] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState(null);
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
    setImportStatus('idle');
    setImportProgress(0);
    
    try {
      const validation = await api.backup.validateFile(file);
      setImportPreview(validation);
      setShowImportModal(true);
    } catch (error) {
      showToast(error.message, 'error');
      setImportFile(null);
    }
  };

  // ✅ Export avec vérification du token
  const handleExport = async () => {
    // ✅ Vérifier si l'utilisateur est authentifié
    if (!authApi.isAuthenticated()) {
      showToast('Veuillez vous reconnecter pour exporter', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const result = await api.backup.export({
        includeEnseignants: true,
        includeUtilisateurs: true,
        includeCours: true,
        includeNiveaux: true,
        includeParcours: true,
        includeEnseignements: true,
        includeSalles: true,
        includeDelegues: true,
        includePlannings: true,
        includePlanningSalles: true
      });
      
      addRecentAction('Export JSON', 'Export des données vers JSON');
      showToast('Export effectué avec succès !', 'success');
    } catch (error) {
      console.error('Export error:', error);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showToast('Session expirée, veuillez vous reconnecter', 'error');
        setTimeout(() => authApi.logout(), 2000);
      } else {
        showToast('Erreur lors de l\'export: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImportFile(file);
    }
    event.target.value = '';
  };

  // ✅ CONFIRMATION IMPORT avec vérification du token
  const confirmImport = async () => {
    if (!importFile) return;
    
    // ✅ Vérifier si l'utilisateur est authentifié
    if (!authApi.isAuthenticated()) {
      showToast('Veuillez vous reconnecter pour importer', 'error');
      return;
    }
    
    setShowImportModal(false);
    setImportStatus('loading');
    setImportProgress(10);
    
    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      }, 300);
      
      const result = await api.backup.import(importFile);
      clearInterval(progressInterval);
      
      setImportProgress(100);
      setImportStatus('success');
      
      addRecentAction('Import', `Import des données - ${importFile.name}`);
      showToast(`${result.message} (${result.tablesRestored} tables restaurées)`, 'success');
      
      setTimeout(() => {
        setImportStatus(null);
        setImportProgress(0);
        setImportFile(null);
        setImportPreview(null);
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      setImportStatus('error');
      setImportProgress(0);
      console.error('Import error:', error);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showToast('Session expirée, veuillez vous reconnecter', 'error');
        setTimeout(() => authApi.logout(), 2000);
      } else {
        showToast('Erreur lors de l\'import: ' + error.message, 'error');
      }
      
      setTimeout(() => {
        setImportStatus(null);
        setImportFile(null);
        setImportPreview(null);
      }, 3000);
    }
  };

  const cancelImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportStatus(null);
    setImportProgress(0);
    setShowImportModal(false);
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

  const ToastNotification = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white min-w-[300px] max-w-md`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="hover:opacity-80 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6" onDragEnter={handleDragEnter}>
      <ToastNotification />

      {/* ✅ Vérification d'authentification */}
      {!authApi.isAuthenticated() && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          Vous n'êtes pas authentifié. Veuillez vous reconnecter pour utiliser la sauvegarde.
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 min-w-[300px] text-center shadow-2xl">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Exportation en cours...</p>
            <p className="text-xs text-gray-400 mt-1">Préparation du fichier JSON</p>
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
              disabled={loading || importStatus === 'loading' || !authApi.isAuthenticated()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4" />
                  Exporter en JSON
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Import */}
        <div 
          className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all duration-200 ${
            isDragging 
              ? 'border-green-500 border-2 bg-green-50 scale-[1.02]' 
              : 'border-gray-100 hover:shadow-lg'
          } ${importStatus === 'loading' ? 'border-purple-500 border-2' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                isDragging ? 'bg-green-200' : 'bg-purple-100'
              } ${importStatus === 'loading' ? 'bg-purple-200' : ''}`}>
                {importStatus === 'loading' ? (
                  <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
                ) : isDragging ? (
                  <CloudUpload className="w-7 h-7 text-green-600 animate-bounce" />
                ) : (
                  <Upload className="w-7 h-7 text-purple-600" />
                )}
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {importStatus === 'loading' ? 'Import en cours...' : 'Glisser-Déposer'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Import des données</h3>
            <p className="text-sm text-gray-500 mb-6">
              {isDragging 
                ? 'Déposez votre fichier JSON ici' 
                : importStatus === 'loading'
                ? 'Importation en cours, veuillez patienter...'
                : 'Glissez-déposez un fichier JSON ou cliquez pour sélectionner'
              }
            </p>
            
            {/* Barre de progression */}
            {importStatus === 'loading' && (
              <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-700">Importation en cours...</span>
                  <span className="text-sm font-bold text-purple-700">{importProgress}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">
                  Fichier : <span className="font-medium">{importFile?.name}</span>
                </p>
              </div>
            )}

            {/* Message de succès */}
            {importStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">✅ Import réussi !</p>
                    <p className="text-xs text-gray-500 truncate">
                      Fichier : <span className="font-medium">{importFile?.name}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {importStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">❌ Erreur lors de l'import</p>
                    <p className="text-xs text-gray-500 truncate">
                      Fichier : <span className="font-medium">{importFile?.name}</span>
                    </p>
                  </div>
                  <button 
                    onClick={cancelImport}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Zone de drop */}
            {importStatus !== 'loading' && importStatus !== 'success' && (
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-purple-400 bg-gray-50'
                } ${!authApi.isAuthenticated() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={authApi.isAuthenticated() ? handleImportClick : undefined}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={authApi.isAuthenticated() ? handleDrop : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={!authApi.isAuthenticated()}
                />
                {!authApi.isAuthenticated() ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 font-medium">Connectez-vous pour importer</p>
                    <p className="text-xs text-red-400 mt-1">Session expirée</p>
                  </>
                ) : isDragging ? (
                  <>
                    <CloudUpload className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
                    <p className="text-green-600 font-medium">Relâchez pour importer</p>
                    <p className="text-xs text-green-500 mt-1">Fichier JSON uniquement</p>
                  </>
                ) : importFile ? (
                  <>
                    <FileCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-600 font-medium">Fichier sélectionné</p>
                    <p className="text-xs text-gray-500 mt-1">{importFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Cliquez pour changer de fichier</p>
                  </>
                ) : (
                  <>
                    <FileUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Cliquez ou glissez un fichier</p>
                    <p className="text-xs text-gray-400 mt-1">Format JSON accepté</p>
                  </>
                )}
              </div>
            )}

            {/* Bouton Importer */}
            {importFile && importStatus !== 'loading' && importStatus !== 'success' && importStatus !== 'error' && (
              <div className="mt-4">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{importFile.name}</p>
                      <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={cancelImport}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={confirmImport}
                    disabled={!authApi.isAuthenticated()}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    Importer maintenant
                  </button>
                </div>
              </div>
            )}
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