// src/components/ParcoursList.jsx
import React, { useState } from 'react';
import ItemCard from './shared/ItemCard';
import { Plus } from 'lucide-react';

const ParcoursList = ({ items, onAdd, onUpdate, onDelete }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
    setShowAddModal(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    onUpdate(editId, editName.trim());
    setEditId(null);
    setEditName('');
  };

  return (
    <>
      {/* Grille 5 colonnes avec grand gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {/* Carte "Ajouter" avec padding intérieur augmenté */}
        <div
          onClick={() => setShowAddModal(true)}
          className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-sky-500 hover:border-sky-500 transition-all cursor-pointer group min-h-[240px]"
        >
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-sky-500" />
          </div>
          <span className="font-semibold text-sm uppercase tracking-wider text-center">Ajouter un parcours</span>
        </div>

        {/* Cartes existantes */}
        {items.map((item) => (
          <div key={item.id}>
            {editId === item.id ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-3 min-h-[240px] flex flex-col justify-center">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditId(null)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-xs bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition shadow-sm"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <ItemCard
                item={item}
                icon={item.icon || 'school'}
                onEdit={() => handleEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal d'ajout (inchangée mais avec plus de padding) */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-scaleIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">Ajouter un parcours</h3>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  placeholder="Nom du parcours"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition shadow-sm"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ParcoursList;