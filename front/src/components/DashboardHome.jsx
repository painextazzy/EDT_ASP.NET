// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, MoreVertical, Info,
  XCircle, Plus, File as FileIcon,
  FileSpreadsheet, FileCode, Archive,
  Calendar, Clock, MapPin, User, Users,
  BookOpen, DoorOpen, GraduationCap, Layers
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month'

  useEffect(() => {
    loadDashboardData(period);
  }, [period]);

  const loadDashboardData = async (selectedPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.dashboard?.getStats?.(selectedPeriod);
      
      if (!response) {
        setError("Aucune donnée disponible");
        setLoading(false);
        return;
      }

      setData(response);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getTypeColor = (type) => {
    const types = {
      'Cours': 'bg-blue-50 text-blue-700',
      'COURS': 'bg-blue-50 text-blue-700',
      'Examen': 'bg-emerald-50 text-emerald-700',
      'EXAMEN': 'bg-emerald-50 text-emerald-700',
      'Soutenance': 'bg-amber-50 text-amber-700',
      'SOUTENANCE': 'bg-amber-50 text-amber-700'
    };
    return types[type] || 'bg-gray-50 text-gray-700';
  };

  // Composant KPI Card
  const KpiCard = ({ label, value, color, progress }) => {
    const circumference = 2 * Math.PI * 40;
    const progressValue = (progress / 100) * circumference;
    
    return (
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all hover:translate-y-[-2px]">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" fill="transparent" r="40" stroke="#f1f4fa" strokeWidth="8" />
            <circle 
              cx="50%" cy="50%" fill="transparent" r="40" 
              stroke={color} 
              strokeDasharray={circumference} 
              strokeDashoffset={circumference - progressValue} 
              strokeLinecap="round" 
              strokeWidth="8" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#181c20]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {value}
            </span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-[#414754] uppercase tracking-wider font-body-md">
          {label}
        </p>
      </div>
    );
  };

  // Composant Sparkline (graphique en ligne SVG natif)
  const Sparkline = ({ data, height = 200, color = '#005bbf' }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data.map(d => d.count || 0), 1);
    const width = 1000;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.count / max) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
          <polygon
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill={`${color}10`}
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sparkline-path"
          />
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - (d.count / max) * chartHeight;
            return <circle key={i} cx={x} cy={y} fill={color} r="4" />;
          })}
        </svg>
        <div className="absolute bottom-0 w-full flex justify-between px-2 pt-2 text-[10px] font-bold text-[#414754]">
          {data.map((d, i) => (
            <span key={i}>{d.month || ''}</span>
          ))}
        </div>
        <style>{`
          .sparkline-path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: dash 2s ease-out forwards;
          }
          @keyframes dash {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    );
  };

  // Composant Donut Chart SVG natif
  const DonutChart = ({ data, total, colors = ['#005bbf', '#6ddd81', '#fbbc05'] }) => {
    if (!data || data.length === 0) return null;
    
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let currentAngle = 0;

    return (
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const strokeDasharray = (percentage / 100) * circumference;
            const offset = currentAngle;
            currentAngle += strokeDasharray;
            
            return (
              <circle
                key={index}
                cx="50%"
                cy="50%"
                r={radius}
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="20"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#181c20]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {total}
          </span>
          <span className="text-[10px] font-bold text-[#414754] uppercase tracking-wider">Total</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#F4F7FE] min-h-screen p-4 lg:p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)] animate-pulse">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#f1f4fa]"></div>
                <div className="h-4 bg-[#f1f4fa] rounded w-16 mx-auto mt-3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#F4F7FE] min-h-screen p-4 lg:p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)] overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#005bbf] via-[#1a73e8] to-[#005bbf]"></div>
            <div className="p-8 md:p-12 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#d8e2ff] to-[#f1f4fa] rounded-full flex items-center justify-center mx-auto">
                  <Archive className="w-12 h-12 text-[#005bbf]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#181c20] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Aucune donnée disponible
              </h2>
              <div className="bg-[#f1f4fa] rounded-xl p-4 mb-6 max-w-md mx-auto border border-[#dfe3e8]">
                <p className="text-[#414754] text-sm flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-[#005bbf] rounded-full animate-pulse"></span>
                  {error || "Aucune donnée dans la base"}
                </p>
              </div>
              <button 
                onClick={() => loadDashboardData(period)}
                className="px-8 py-3.5 bg-[#005bbf] text-white font-semibold rounded-xl shadow-[0_10px_40px_-10px_rgba(0,91,191,0.25)] hover:shadow-[0_12px_40px_rgba(0,91,191,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = data.stats || {};
  const monthlyEvents = data.monthlyEvents || [];
  const todaySchedule = data.todaySchedule || [];
  const topSalles = data.topSalles || [];
  const cancelledCourses = data.cancelledCourses || [];
  const backupHistory = data.backupHistory || [];
  const distribution = data.distribution || { cours: 0, examens: 0, tp: 0, total: 0 };

  const kpiData = [
    { label: 'Planning', value: stats.planning || 0, color: '#005bbf', progress: stats.planning > 0 ? Math.min(Math.round((stats.planning / 200) * 100), 100) : 0 },
    { label: 'Enseignants', value: stats.enseignants || 0, color: '#006e2c', progress: stats.enseignants > 0 ? Math.min(Math.round((stats.enseignants / 100) * 100), 100) : 0 },
    { label: 'Affectations', value: stats.affectations || 0, color: '#fbbc05', progress: stats.affectations > 0 ? Math.min(Math.round((stats.affectations / 100) * 100), 100) : 0 },
    { label: 'Cours', value: stats.cours || 0, color: '#005bbf', progress: stats.cours > 0 ? Math.min(Math.round((stats.cours / 150) * 100), 100) : 0 },
    { label: 'Salles', value: stats.salles || 0, color: '#006e2c', progress: stats.salles > 0 ? Math.min(Math.round((stats.salles / 50) * 100), 100) : 0 },
    { label: 'Annulés', value: stats.annules || 0, color: '#ba1a1a', progress: stats.annules > 0 ? Math.min(Math.round((stats.annules / 30) * 100), 100) : 0 },
    { label: 'Délégués', value: stats.delegues || 0, color: '#005bbf', progress: stats.delegues > 0 ? Math.min(Math.round((stats.delegues / 30) * 100), 100) : 0 },
    { label: 'Cours terminés', value: stats.coursTermines || 0, color: '#006e2c', progress: stats.coursTermines > 0 ? Math.min(Math.round((stats.coursTermines / 150) * 100), 100) : 0 }
  ];

  const donutData = [
    { label: 'Cours', value: distribution.cours || 0 },
    { label: 'Exams', value: distribution.examens || 0 },
    { label: 'Presentation', value: distribution.tp || 0 }
  ];

  // Déterminer le label de la période
  const getPeriodLabel = () => {
    switch(period) {
      case 'day': return 'Jour';
      case 'week': return 'Semaine';
      case 'month': return 'Mois';
      default: return 'Mois';
    }
  };

  return (
    <div className="bg-[#F4F7FE] min-h-screen p-4 lg:p-6 font-body-md text-[#181c20]">
      <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto">
        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col gap-8 pr-2">
          {/* Header avec filtres */}
          <header className="flex items-center justify-between">
            <div className="flex items-center bg-white p-1 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)]">
              <button 
                onClick={() => setPeriod('day')}
                className={`px-5 py-1.5 text-[10px] font-bold transition-colors rounded-full ${
                  period === 'day' 
                    ? 'bg-[#005bbf] text-white shadow-md' 
                    : 'text-[#414754] hover:text-[#181c20]'
                }`}
              >
                Jour
              </button>
              <button 
                onClick={() => setPeriod('week')}
                className={`px-5 py-1.5 text-[10px] font-bold transition-colors rounded-full ${
                  period === 'week' 
                    ? 'bg-[#005bbf] text-white shadow-md' 
                    : 'text-[#414754] hover:text-[#181c20]'
                }`}
              >
                Semaine
              </button>
              <button 
                onClick={() => setPeriod('month')}
                className={`px-5 py-1.5 text-[10px] font-bold transition-colors rounded-full ${
                  period === 'month' 
                    ? 'bg-[#005bbf] text-white shadow-md' 
                    : 'text-[#414754] hover:text-[#181c20]'
                }`}
              >
                Mois
              </button>
            </div>
            <span className="text-xs text-[#414754] font-medium">
              Période : {getPeriodLabel()}
            </span>
          </header>

          {/* KPI Section - 8 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            {kpiData.map((item, index) => (
              <KpiCard key={index} {...item} />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-[#181c20]">Volume d'Événements</h4>
                  <p className="text-xs text-[#414754]">Performance par {getPeriodLabel().toLowerCase()}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1.5 rounded-sm bg-[#005bbf]/20"></div>
                    <span className="text-[10px] font-bold text-[#414754]">Volume (Bars)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-[#005bbf]"></div>
                    <span className="text-[10px] font-bold text-[#414754]">Tendance (Line)</span>
                  </div>
                </div>
              </div>
              <Sparkline data={monthlyEvents} height={180} color="#005bbf" />
            </div>

            {/* Donut Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)] flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-[#181c20]">Répartition</h4>
                <MoreVertical className="w-5 h-5 text-[#414754] cursor-pointer" />
              </div>
              <DonutChart data={donutData} total={distribution.total || 0} />
              <div className="w-full grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[#005bbf]"></div>
                  <span className="text-[10px] font-bold text-[#414754]">Cours {distribution.total > 0 ? Math.round((distribution.cours / distribution.total) * 100) : 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[#006e2c]"></div>
                  <span className="text-[10px] font-bold text-[#414754]">Exams {distribution.total > 0 ? Math.round((distribution.examens / distribution.total) * 100) : 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[#fbbc05]"></div>
                  <span className="text-[10px] font-bold text-[#414754]">Presentation {distribution.total > 0 ? Math.round((distribution.tp / distribution.total) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Planning & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teacher Workload */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)] flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-[#181c20]">Taux d'occupation</h4>
                <Info className="w-5 h-5 text-[#414754] cursor-pointer" />
              </div>
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" fill="transparent" r="80" stroke="#f1f4fa" strokeWidth="20" />
                  <circle cx="50%" cy="50%" fill="transparent" r="80" stroke="#006e2c" strokeDasharray="502" strokeDashoffset={stats.planning > 0 ? 502 - Math.min((stats.planning / 200) * 502, 502) : 360} strokeLinecap="round" strokeWidth="20" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#181c20]">{stats.planning > 0 ? Math.min(Math.round((stats.planning / 200) * 100), 100) : 0}%</span>
                  <span className="text-[10px] font-bold text-[#414754] uppercase tracking-wider">Global</span>
                </div>
              </div>
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[#006e2c]"></div>
                  <span className="text-[10px] font-bold text-[#414754]">Salles occupées</span>
                </div>
              </div>
            </div>

            {/* Top Salles */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)]">
              <h4 className="text-lg font-semibold text-[#181c20] mb-6">Salles les plus utilisées</h4>
              <div className="grid grid-cols-1 gap-4">
                {topSalles.length > 0 ? (
                  topSalles.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-[#181c20]">{item.name}</span>
                        <span className="text-[10px] text-[#005bbf] font-bold">{item.rate || 0}%</span>
                      </div>
                      <div className="h-2 bg-[#ebeef4] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#005bbf]" 
                          style={{ width: `${Math.min(item.rate || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#414754] text-sm py-4">
                    Aucune salle utilisée
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 flex flex-col shrink-0 hidden xl:flex gap-4">
          {/* Backup History */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-[#181c20]">Historique des Sauvegardes</h4>
              <MoreVertical className="w-4 h-4 text-[#414754] cursor-pointer" />
            </div>
            <div className="space-y-4">
              {backupHistory.length > 0 ? (
                backupHistory.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group cursor-pointer p-2 hover:bg-[#f1f4fa] rounded-xl transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color || 'text-amber-500 bg-amber-50'}`}>
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h5 className="text-xs font-bold truncate text-[#181c20]">{item.name}</h5>
                      <p className="text-[10px] text-[#414754]">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#414754] text-xs py-4">
                  Aucune sauvegarde disponible
                </div>
              )}
            </div>
          </div>

          {/* Cancelled Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-[#181c20]">Cours Annulés</h4>
              <MoreVertical className="w-4 h-4 text-[#414754] cursor-pointer" />
            </div>
            <div className="space-y-4">
              {cancelledCourses.length > 0 ? (
                cancelledCourses.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group cursor-pointer p-2 hover:bg-[#f1f4fa] rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h5 className="text-xs font-bold truncate text-[#181c20]">{item.name}</h5>
                      <p className="text-[10px] font-medium text-red-600">{item.status}</p>
                      {item.date && <p className="text-[9px] text-[#414754]">{item.date}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#414754] text-xs py-4">
                  Aucun cours annulé
                </div>
              )}
            </div>
          </div>

          {/* Today Schedule */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[rgba(223,227,232,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-[#181c20]">Planning du Jour</h4>
              <MoreVertical className="w-4 h-4 text-[#414754] cursor-pointer" />
            </div>
            <div className="space-y-4">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-2 hover:bg-[#f1f4fa] rounded-xl transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center bg-[#005bbf]/5 rounded-lg px-2 py-1 shrink-0 min-w-[40px]">
                      <span className="text-xs font-bold text-[#005bbf]">
                        {item.horaire ? item.horaire.split(' - ')[0].split(':')[0] : '--'}
                      </span>
                      <span className="text-[8px] uppercase text-[#005bbf]">H</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h5 className="text-xs font-bold truncate text-[#181c20]">{item.matiere}</h5>
                      <div className="flex items-center gap-1 text-[10px] text-[#414754] mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.horaire}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#414754]">
                        <MapPin className="w-3 h-3" />
                        {item.salle}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[rgba(223,227,232,0.1)]">
                        <div className="w-5 h-5 rounded-full bg-[#005bbf]/10 flex items-center justify-center text-[8px] font-bold text-[#005bbf]">
                          {item.enseignant ? item.enseignant.charAt(0).toUpperCase() : 'N'}
                        </div>
                        <span className="text-[10px] font-medium text-[#414754]">{item.enseignant}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#414754] text-xs py-4">
                  Aucun cours aujourd'hui
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* FAB Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#005bbf] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 lg:hidden">
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};

export default Dashboard;