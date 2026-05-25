// src/components/SauvegardePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  FileText,
  Database,
  ChevronDown,
  Users,
  BookOpen,
  DoorOpen,
  Calendar,
  Settings,
  CloudUpload,
  FileUp,
  X
} from 'lucide-react';

const SauvegardePage = () => {
  const [recentActions, setRecentActions] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportTables, setExportTables] = useState({
    professeurs: true,
    cours: true,
    salles: true,
    emploisDuTemps: true
  });
  const [exportFileName, setExportFileName] = useState(`export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`);
  
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Charger les actions récentes
  useEffect(() => {
    loadRecentActions();
  }, []);

  const loadRecentActions = () => {
    const actions = JSON.parse(localStorage.getItem('recent_actions') || '[]');
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
    localStorage.setItem('recent_actions', JSON.stringify(updatedActions));
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
        alert('Veuillez déposer un fichier JSON valide');
      }
    }
  };

  const processImportFile = (file) => {
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setImportPreview(data);
        setShowImportModal(true);
      } catch (error) {
        alert('Fichier invalide. Veuillez sélectionner un fichier JSON valide.');
      }
    };
    reader.readAsText(file);
  };

  // Récupérer les données sélectionnées
  const getSelectedData = () => {
    const data = {};
    if (exportTables.professeurs) {
      data.professeurs = JSON.parse(localStorage.getItem('professeurs') || '[]');
    }
    if (exportTables.cours) {
      data.cours = JSON.parse(localStorage.getItem('cours') || '[]');
    }
    if (exportTables.salles) {
      data.salles = JSON.parse(localStorage.getItem('salles') || '[]');
    }
    if (exportTables.emploisDuTemps) {
      data.emploisDuTemps = JSON.parse(localStorage.getItem('emploisDuTemps') || '[]');
    }
    data.exportDate = new Date().toISOString();
    data.version = '1.0.0';
    return data;
  };

  // Export JSON
  const exportAsJSON = (data) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const fileName = `${exportFileName}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
    
    addRecentAction('Export JSON', `Export des données - ${fileName}`);
  };

  // Export CSV
  const exportAsCSV = (data) => {
    const tables = Object.keys(data).filter(key => !['exportDate', 'version'].includes(key));
    let allRows = [];
    let headers = [];

    tables.forEach(table => {
      const items = data[table];
      if (items && items.length > 0) {
        const tableHeaders = Object.keys(items[0]);
        headers = [...new Set([...headers, ...tableHeaders.map(h => `${table}_${h}`)])];
        items.forEach(item => {
          const row = {};
          tableHeaders.forEach(header => {
            row[`${table}_${header}`] = item[header] !== undefined ? item[header] : '';
          });
          allRows.push(row);
        });
      }
    });

    let csvContent = headers.join(',') + '\n';
    allRows.forEach(row => {
      const rowValues = headers.map(header => {
        let value = row[header] || '';
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
        return value;
      });
      csvContent += rowValues.join(',') + '\n';
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    
    addRecentAction('Export CSV', `Export des données - ${exportFileName}.csv`);
  };

  // Export TXT
  const exportAsTXT = (data) => {
    let txtContent = `========================================\n`;
    txtContent += `EXPORT DES DONNÉES - CALENDAR\n`;
    txtContent += `========================================\n\n`;
    txtContent += `Date d'export : ${new Date(data.exportDate).toLocaleString('fr-FR')}\n`;
    txtContent += `Version : ${data.version}\n\n`;
    txtContent += `========================================\n\n`;

    const tables = Object.keys(data).filter(key => !['exportDate', 'version'].includes(key));
    
    tables.forEach(table => {
      const items = data[table];
      txtContent += `📊 ${table.toUpperCase()} (${items.length} éléments)\n`;
      txtContent += `----------------------------------------\n`;
      
      if (items && items.length > 0) {
        items.forEach((item, index) => {
          txtContent += `\n[${index + 1}]\n`;
          Object.entries(item).forEach(([key, value]) => {
            txtContent += `  ${key}: ${value !== undefined ? value : ''}\n`;
          });
          txtContent += `\n`;
        });
      } else {
        txtContent += `Aucune donnée\n\n`;
      }
      txtContent += `----------------------------------------\n\n`;
    });

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName}.txt`);
    link.click();
    URL.revokeObjectURL(url);
    
    addRecentAction('Export TXT', `Export des données - ${exportFileName}.txt`);
  };

  const handleExport = () => {
    const data = getSelectedData();
    
    const hasData = Object.values(exportTables).some(v => v === true);
    if (!hasData) {
      alert('Veuillez sélectionner au moins une table à exporter');
      return;
    }
    
    switch (exportFormat) {
      case 'json':
        exportAsJSON(data);
        break;
      case 'csv':
        exportAsCSV(data);
        break;
      case 'txt':
        exportAsTXT(data);
        break;
      default:
        exportAsJSON(data);
    }
    
    setShowExportModal(false);
    alert('Export effectué avec succès !');
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

  const confirmImport = () => {
    if (importPreview) {
      if (importPreview.professeurs) localStorage.setItem('professeurs', JSON.stringify(importPreview.professeurs));
      if (importPreview.cours) localStorage.setItem('cours', JSON.stringify(importPreview.cours));
      if (importPreview.salles) localStorage.setItem('salles', JSON.stringify(importPreview.salles));
      if (importPreview.emploisDuTemps) localStorage.setItem('emploisDuTemps', JSON.stringify(importPreview.emploisDuTemps));
      
      addRecentAction('Import', `Import des données - ${importFile?.name}`);
      alert('Importation réussie !');
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview(null);
      window.location.reload();
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

  const getTableCount = (table) => {
    const data = JSON.parse(localStorage.getItem(table) || '[]');
    return data.length;
  };

  return (
    <div className="p-6 space-y-6" onDragEnter={handleDragEnter}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sauvegarde des données</h1>
        <p className="text-sm text-gray-500 mt-1">Exportez ou importez vos données</p>
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
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Multi-format</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Export des données</h3>
            <p className="text-sm text-gray-500 mb-6">
              Téléchargez vos données aux formats JSON, CSV ou TXT.
            </p>
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Configurer l'export
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
        
        <div className="divide-y divide-gray-100">
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

      {/* Modal d'export avec choix (inchangée) */}
      {showExportModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white/30 z-50"
            onClick={() => setShowExportModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Configurer l'export</h2>
                </div>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Choix du format */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Format d'export
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        exportFormat === 'json' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileJson className={`w-8 h-8 mx-auto mb-2 ${exportFormat === 'json' ? 'text-green-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${exportFormat === 'json' ? 'text-green-700' : 'text-gray-600'}`}>JSON</p>
                      <p className="text-xs text-gray-400 mt-1">Structure complète</p>
                    </button>
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        exportFormat === 'csv' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${exportFormat === 'csv' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${exportFormat === 'csv' ? 'text-blue-700' : 'text-gray-600'}`}>CSV</p>
                      <p className="text-xs text-gray-400 mt-1">Tableur Excel</p>
                    </button>
                    <button
                      onClick={() => setExportFormat('txt')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        exportFormat === 'txt' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className={`w-8 h-8 mx-auto mb-2 ${exportFormat === 'txt' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${exportFormat === 'txt' ? 'text-purple-700' : 'text-gray-600'}`}>TXT</p>
                      <p className="text-xs text-gray-400 mt-1">Lisible</p>
                    </button>
                  </div>
                </div>

                {/* Choix des tables */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tables à exporter
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">Professeurs</p>
                          <p className="text-xs text-gray-500">{getTableCount('professeurs')} enregistrements</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportTables.professeurs}
                        onChange={(e) => setExportTables({...exportTables, professeurs: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-gray-800">Cours</p>
                          <p className="text-xs text-gray-500">{getTableCount('cours')} enregistrements</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportTables.cours}
                        onChange={(e) => setExportTables({...exportTables, cours: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <DoorOpen className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-gray-800">Salles</p>
                          <p className="text-xs text-gray-500">{getTableCount('salles')} enregistrements</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportTables.salles}
                        onChange={(e) => setExportTables({...exportTables, salles: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-gray-800">Emplois du temps</p>
                          <p className="text-xs text-gray-500">{getTableCount('emploisDuTemps')} enregistrements</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportTables.emploisDuTemps}
                        onChange={(e) => setExportTables({...exportTables, emploisDuTemps: e.target.checked})}
                        className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Nom du fichier */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du fichier
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={exportFileName}
                      onChange={(e) => setExportFileName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="nom_du_fichier"
                    />
                    <span className="text-sm text-gray-500">
                      .{exportFormat}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button onClick={() => setShowExportModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
                  ✕
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Fichier : <span className="font-semibold">{importFile?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Professeurs</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.professeurs?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <BookOpen className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Cours</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.cours?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <DoorOpen className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Salles</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.salles?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Calendar className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Emplois du temps</p>
                    <p className="text-lg font-semibold text-gray-800">{importPreview.emploisDuTemps?.length || 0}</p>
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
    </div>
  );
};

export default SauvegardePage;