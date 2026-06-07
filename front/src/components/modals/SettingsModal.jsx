// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { Settings, User, Mail, Shield, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, userSettings, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    role: 'ADMIN'
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (userSettings && isOpen) {
      setFormData({
        nom: userSettings.nom || '',
        email: userSettings.email || '',
        role: userSettings.role || 'ADMIN'
      });
    }
  }, [userSettings, isOpen]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      showNotification("Paramètres mis à jour avec succès", 'success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      showNotification(error.message || "Erreur lors de la mise à jour", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-800">Paramètres du compte</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mx-5 mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800' 
              : 'bg-rose-50 text-rose-800'
          }`}>
            {notification.type === 'success' 
              ? <CheckCircle className="w-4 h-4" /> 
              : <AlertCircle className="w-4 h-4" />
            }
            {notification.message}
          </div>
        )}

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Avatar / Initiales */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {formData.nom ? formData.nom.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Votre nom"
            />
            {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Rôle (lecture seule) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Shield className="w-4 h-4 inline mr-1" />
              Rôle
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
              {formData.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;