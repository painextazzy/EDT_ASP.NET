// src/components/ui/ProgressChart.jsx (version avec tooltip)
import React, { useState } from 'react';

const ProgressChart = ({ data, colors, showCount = true, height = 'auto' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        Aucune donnée disponible
      </div>
    );
  }

  const defaultColors = ['#3D5AFE', '#00C853', '#FFD600', '#845EC2', '#FF6B6B'];
  const defaultTextColors = ['text-blue-600', 'text-green-600', 'text-yellow-600', 'text-purple-600', 'text-red-600'];
  const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-red-50'];

  return (
    <div className="space-y-4 md:space-y-6" style={{ height }}>
      {data.map((item, index) => {
        const color = colors?.[index] || defaultColors[index % defaultColors.length];
        const textColor = defaultTextColors[index % defaultTextColors.length];
        const bgColor = bgColors[index % bgColors.length];
        const percentage = Math.min(item.rate || item.percentage || 0, 100);
        const isHovered = hoveredIndex === index;
        
        return (
          <div 
            key={index} 
            className={`space-y-1 p-3 rounded-xl transition-all duration-300 ${
              isHovered ? `${bgColor} shadow-sm scale-[1.02]` : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }} />
                {item.name || item.nom || `Salle ${index + 1}`}
              </span>
              <span className={`text-sm font-semibold ${textColor}`}>
                {percentage}%
              </span>
            </div>
            <div className="relative w-full h-2.5 md:h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color,
                  boxShadow: isHovered ? `0 0 20px ${color}60` : `0 0 10px ${color}40`
                }}
              />
              {/* Animation de pulsation */}
              <div 
                className="absolute inset-y-0 left-0 rounded-full animate-pulse opacity-20"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            {showCount && (
              <div className="flex justify-between items-center text-[10px] md:text-xs text-slate-400 mt-0.5">
                <span>{item.count || item.utilisations || 0} utilisations</span>
                {isHovered && (
                  <span className="text-slate-500 animate-fadeIn">
                    Taux d'occupation: {percentage}%
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressChart;