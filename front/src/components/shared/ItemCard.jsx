// src/components/shared/ItemCard.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const ItemCard = ({ item, onEdit, onDelete, icon, extraInfo }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 group relative overflow-hidden min-h-[240px] flex flex-col">
      {/* Barre colorée en haut */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500"></div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-sky-600 text-2xl">
              {icon || 'school'}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-sky-600 transition-colors line-clamp-2">
            {item.name}
          </h3>
          {extraInfo && (
            <p className="text-xs text-gray-400 font-mono bg-gray-50 inline-block px-2 py-1 rounded-md">
              {extraInfo}
            </p>
          )}
        </div>
      </div>

      {/* Boutons d'action - légèrement agrandis et mieux espacés */}
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
          title="Modifier"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;