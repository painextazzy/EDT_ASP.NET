// src/components/ui/DonutChart.jsx
import React from 'react';
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3">
        <p className="text-sm font-medium text-slate-800">{data.name}</p>
        <p className="text-sm" style={{ color: data.color }}>
          {data.value} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600">
            {entry.payload.name} {entry.payload.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ data, colors, innerRadius = 60, outerRadius = 80, height = 300 }) => {
  // Si les données sont vides
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Aucune donnée disponible
      </div>
    );
  }

  // Calculer le total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Ajouter le pourcentage à chaque élément
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));

  // Couleurs par défaut
  const defaultColors = ['#3D5AFE', '#00C853', '#FFD600', '#FF6B6B', '#845EC2'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={dataWithPercentage}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          stroke="white"
          strokeWidth={3}
        >
          {dataWithPercentage.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || colors?.[index] || defaultColors[index % defaultColors.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;