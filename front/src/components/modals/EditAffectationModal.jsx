// src/components/modals/EditAffectationModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

const EditAffectationModal = ({ isOpen, onClose, onSave, editingCourse, editingMention, niveauxList }) => {
  const [formData, setFormData] = useState({
    name: '',
    professor: '',
    mention: '',
    niveau: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCourse && isOpen) {
      setFormData({
        name: editingCourse.name || '',
        professor: editingCourse.professor || '',
        mention: editingMention || '',
        niveau: editingCourse.niveau || ''
      });
    }
  }, [editingCourse, editingMention, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.professor) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  if (!isOpen || !editingCourse) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Modifier l'affectation</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              value={editingCourse.code || ''}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cours *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professeur *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.professor}
              onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mention</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.mention}
                onChange={(e) => setFormData({ ...formData, mention: e.target.value })}
              >
                <option value="Informatique">Informatique</option>
                <option value="Management">Management</option>
                <option value="Multimedia">Multimedia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.niveau}
                onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
              >
                {niveauxList.map(niveau => (
                  <option key={niveau.id || niveau} value={niveau.libelle || niveau}>
                    {niveau.libelle || niveau}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAffectationModal;