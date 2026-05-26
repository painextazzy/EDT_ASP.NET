// src/components/Calendar/SettingsModal.jsx
import React from 'react';

const SettingsModal = ({ isOpen, onClose, userSettings, tempUserSettings, setTempUserSettings, onSave }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-scaleIn">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-600">settings</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Paramètres du compte</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-base">person</span>
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  value={tempUserSettings.nom}
                  onChange={(e) => setTempUserSettings({ ...tempUserSettings, nom: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-base">mail</span>
                </span>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  value={tempUserSettings.email}
                  onChange={(e) => setTempUserSettings({ ...tempUserSettings, email: e.target.value })}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-base">lock</span>
                </span>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  value={tempUserSettings.password}
                  onChange={(e) => setTempUserSettings({ ...tempUserSettings, password: e.target.value })}
                  placeholder="Nouveau mot de passe"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Laissez vide pour conserver le mot de passe actuel</p>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Annuler
            </button>
            <button 
              onClick={onSave}
              className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-sm font-medium"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default SettingsModal;