// src/components/DashboardAdmin.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, XCircle, Users, CheckCircle, 
  MoreVertical, ChevronDown, ChevronLeft, ChevronRight,
  FileText, Plus, Calendar, Clock, User, LayoutDashboard,
  Bell, Search, Menu, LogOut, Settings, HelpCircle,
  AlertCircle, Calendar as CalendarIcon,
  DoorOpen, CheckSquare
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardSkeleton from './ui/DashboardSkeleton';
import DonutChart from './ui/DonutChart';
import AreaChart from './ui/AreaChart';
import ProgressChart from './ui/ProgressChart';
import DashCalendar from './ui/DashCalendar';

// ========== DONNÉES DE FALLBACK ==========
const FALLBACK_DATA = {
  stats: {
    planning: 124,
    enseignants: 84,
    affectations: 42,
    cours: 60,
    salles: 32,
    annules: 8,
    delegues: 12,
    coursTermines: 95,
    reportes: 5
  },
  distribution: {
    cours: 60,
    examens: 25,
    presentations: 15,
    total: 100
  },
  topSalles: [
    { name: 'Salle 102', count: 45, rate: 88 },
    { name: 'Amphi A', count: 38, rate: 75 },
    { name: 'Labo Info 1', count: 32, rate: 62 }
  ],
  todaySchedule: [
    { enseignant: 'Dr. Martin', horaire: '09:00 - 11:00', matiere: 'Java Programming', type: 'Cours', salle: 'Salle 102', statut: 'Actif' },
    { enseignant: 'M. Lefebvre', horaire: '14:00 - 16:00', matiere: 'Réseaux Locaux', type: 'Cours', salle: 'Amphi A', statut: 'Actif' }
  ],
  cancelledCourses: [
    { name: 'Algorithmique II', status: 'Annulé', date: '30/07/2024', enseignant: 'Mme. Durand' },
    { name: 'Java Programming', status: 'Reporté', date: '29/07/2024', enseignant: 'Dr. Martin' }
  ],
  teacherLoad: [
    { name: 'Dr. Martin', count: 12, percentage: 40 },
    { name: 'Mme. Durand', count: 8, percentage: 27 }
  ],
  monthlyEvents: [
    { month: 'Jan', count: 40 },
    { month: 'Fév', count: 55 },
    { month: 'Mar', count: 45 },
    { month: 'Avr', count: 70 },
    { month: 'Mai', count: 60 },
    { month: 'Juin', count: 85 },
    { month: 'Juil', count: 75 },
    { month: 'Aoû', count: 90 },
    { month: 'Sep', count: 65 },
    { month: 'Oct', count: 50 },
    { month: 'Nov', count: 40 },
    { month: 'Déc', count: 30 }
  ]
};

// ========== COMPOSANT PRINCIPAL ==========
const DashboardAdmin = () => {
  const navigate = useNavigate();
  
  // États avec valeurs par défaut
  const [stats, setStats] = useState(FALLBACK_DATA.stats);
  const [distribution, setDistribution] = useState(FALLBACK_DATA.distribution);
  const [todaySchedule, setTodaySchedule] = useState(FALLBACK_DATA.todaySchedule);
  const [topSalles, setTopSalles] = useState(FALLBACK_DATA.topSalles);
  const [cancelledCourses, setCancelledCourses] = useState(FALLBACK_DATA.cancelledCourses);
  const [monthlyEvents, setMonthlyEvents] = useState(FALLBACK_DATA.monthlyEvents);
  const [teacherLoad, setTeacherLoad] = useState(FALLBACK_DATA.teacherLoad);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period] = useState('week');
  
  const isMounted = useRef(true);
  const hasLoaded = useRef(false);

  // État du calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ========== FORMATAGE DES DATES ==========
  const getMonthYear = (date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  };

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isSelected = (day, month, year) => {
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  // ========== FORMATAGE DU TEMPS RELATIF ==========
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString('fr-FR');
  };

  // ========== CHARGEMENT DES DONNÉES ==========
  const loadDashboardData = useCallback(async () => {
    if (hasLoaded.current) return;
    if (!isMounted.current) return;
    
    hasLoaded.current = true;
    
    const safetyTimeout = setTimeout(() => {
      if (isMounted.current && loading) {
        setLoading(false);
      }
    }, 5000);

    try {
      const response = await dashboardApi.getStats(period);

      if (!isMounted.current) {
        clearTimeout(safetyTimeout);
        return;
      }

      if (response && response.stats) {
        setStats({
          planning: response.stats.planning || 0,
          enseignants: response.stats.enseignants || 0,
          affectations: response.stats.affectations || 0,
          cours: response.stats.cours || 0,
          salles: response.stats.salles || 0,
          annules: response.stats.annules || 0,
          delegues: response.stats.delegues || 0,
          coursTermines: response.stats.coursTermines || 0,
          reportes: response.stats.reportes || 0
        });

        if (response.distribution) {
          setDistribution({
            cours: response.distribution.cours || 0,
            examens: response.distribution.examens || 0,
            presentations: response.distribution.tp || 0,
            total: response.distribution.total || 0
          });
        }

        if (response.todaySchedule) setTodaySchedule(response.todaySchedule);
        if (response.topSalles) setTopSalles(response.topSalles);
        if (response.cancelledCourses) setCancelledCourses(response.cancelledCourses);
        if (response.teacherLoad) setTeacherLoad(response.teacherLoad);
        
        // Formater les données pour le graphique
        if (response.monthlyEvents && response.monthlyEvents.length > 0) {
          // Vérifier si les données sont déjà au bon format
          if (response.monthlyEvents[0].month && response.monthlyEvents[0].count !== undefined) {
            setMonthlyEvents(response.monthlyEvents);
          } else {
            // Transformer les données si nécessaire
            const formattedData = response.monthlyEvents.map(item => ({
              month: item.month || item.label || 'Mois',
              count: item.count || item.value || 0
            }));
            setMonthlyEvents(formattedData);
          }
        }
        
        setError(null);
      }

    } catch (err) {
      if (isMounted.current) {
        setError(err.message || 'Erreur de chargement');
      }
    } finally {
      clearTimeout(safetyTimeout);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [period, loading]);

  // ========== INITIALISATION ==========
  useEffect(() => {
    loadDashboardData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // ========== NAVIGATION CALENDRIER ==========
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day, month, year) => {
    setSelectedDate(new Date(year, month, day));
  };

  // ========== AFFICHAGE DU SKELETON ==========
  if (loading) {
    return <DashboardSkeleton />;
  }

  const monthDays = getMonthDays(currentDate);
  const monthYear = getMonthYear(currentDate);
  const dayName = getDayName(selectedDate);

  // Calcul pour le donut
  const total = distribution.total > 0 ? distribution.total : 1;

  return (
    <div className="bg-[#F8F9FE] min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 pt-4 md:pt-6 lg:pt-0 order-1 lg:order-none">
        {/* ===== AFFICHAGE ERREUR ===== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-600">Affichage des données de secours</p>
            </div>
          </div>
        )}

        {/* ===== KPI ROW 1 ===== */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Planning KPI */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center border border-slate-100 shadow-sm">
            <p className="text-xs md:text-sm text-slate-800 mb-2 md:mb-4">Planning</p>
            <div className="relative w-20 h-20 md:w-28 md:h-28 mb-2 md:mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="48" stroke="#f0f2f5" strokeWidth="8" />
                <circle 
                  cx="50%" cy="50%" fill="transparent" r="48" 
                  stroke="#3D5AFE" 
                  strokeDasharray="301" 
                  strokeDashoffset={Math.max(0, 301 - (stats.planning / 200) * 301)} 
                  strokeLinecap="round" 
                  strokeWidth="8" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl text-slate-800">{stats.planning}</span>
              </div>
            </div>
          </div>

          {/* Enseignants KPI */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center border border-slate-100 shadow-sm">
            <p className="text-xs md:text-sm text-slate-800 mb-2 md:mb-4">Enseignants</p>
            <div className="relative w-20 h-20 md:w-28 md:h-28 mb-2 md:mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="48" stroke="#f0f2f5" strokeWidth="8" />
                <circle 
                  cx="50%" cy="50%" fill="transparent" r="48" 
                  stroke="#00C853" 
                  strokeDasharray="301" 
                  strokeDashoffset={Math.max(0, 301 - (stats.enseignants / 100) * 301)} 
                  strokeLinecap="round" 
                  strokeWidth="8" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl text-slate-800">{stats.enseignants}</span>
              </div>
            </div>
          </div>

          {/* Affectations KPI */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center border border-slate-100 shadow-sm">
            <p className="text-xs md:text-sm text-slate-800 mb-2 md:mb-4">Affectations</p>
            <div className="relative w-20 h-20 md:w-28 md:h-28 mb-2 md:mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="48" stroke="#f0f2f5" strokeWidth="8" />
                <circle 
                  cx="50%" cy="50%" fill="transparent" r="48" 
                  stroke="#FFD600" 
                  strokeDasharray="301" 
                  strokeDashoffset={Math.max(0, 301 - (stats.affectations / 100) * 301)} 
                  strokeLinecap="round" 
                  strokeWidth="8" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl text-slate-800">{stats.affectations}</span>
              </div>
            </div>
          </div>

          {/* Cours KPI */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center border border-slate-100 shadow-sm">
            <p className="text-xs md:text-sm text-slate-800 mb-2 md:mb-4">Cours</p>
            <div className="relative w-20 h-20 md:w-28 md:h-28 mb-2 md:mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="48" stroke="#f0f2f5" strokeWidth="8" />
                <circle 
                  cx="50%" cy="50%" fill="transparent" r="48" 
                  stroke="#3D5AFE" 
                  strokeDasharray="301" 
                  strokeDashoffset={Math.max(0, 301 - (stats.cours / 200) * 301)} 
                  strokeLinecap="round" 
                  strokeWidth="8" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl text-slate-800">{stats.cours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ADDITIONAL KPI AND CHARTS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Minor KPIs */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center justify-between border border-slate-100 shadow-sm">
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">SALLES</p>
                <p className="text-lg md:text-xl text-slate-800">{stats.salles}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Building2 className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center justify-between border border-slate-100 shadow-sm">
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">ANNULÉS</p>
                <p className="text-lg md:text-xl text-red-600">{stats.annules}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <XCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center justify-between border border-slate-100 shadow-sm">
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">DÉLÉGUÉS</p>
                <p className="text-lg md:text-xl text-slate-800">{stats.delegues}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center justify-between border border-slate-100 shadow-sm">
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">TERMINÉS</p>
                <p className="text-lg md:text-xl text-green-600">{stats.coursTermines}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>

          {/* Main Volume Chart - Area Chart ShadCN */}
          <div className="lg:col-span-9 bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 md:mb-8">
              <h4 className="text-base md:text-lg text-slate-800">Volume d'Événements</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Période:</span>
                <span className="bg-slate-50 px-3 py-1.5 rounded-lg text-xs border border-slate-100 text-slate-600">
                  {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : 'Mois'}
                </span>
              </div>
            </div>
            
            <div className="h-48 md:h-64">
              <AreaChart 
                data={monthlyEvents}
                dataKey="count"
                xAxisKey="month"
                color="#3D5AFE"
                height={250}
              />
            </div>
          </div>
        </div>

        {/* ===== DISTRIBUTION AND STATS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
  {/* Donut Distribution - ShadCN */}
  <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center border border-slate-100 shadow-sm">
    <div className="w-full flex justify-between items-center mb-4 md:mb-8">
      <h4 className="text-base md:text-lg text-slate-800">Répartition</h4>
      <MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-slate-400 cursor-pointer" />
    </div>
    
    <div className="w-full">
      <DonutChart 
        data={[
          { 
            name: 'Cours', 
            value: distribution.cours, 
            color: '#3D5AFE' 
          },
          { 
            name: 'Examens', 
            value: distribution.examens, 
            color: '#00C853' 
          },
          { 
            name: 'Présentations', 
            value: distribution.presentations, 
            color: '#FFD600' 
          }
        ]}
        centerText={distribution.total}
        centerSubtext="Total"
        height={280}
        innerRadius={60}
        outerRadius={85}
      />
    </div>
  </div>

  {/* Usage Progress bars - Top Salles */}
 <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-6 md:mb-8">
      <h4 className="text-base md:text-lg text-slate-800">Top Salles</h4>
      <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
        {topSalles.length} salles
      </span>
    </div>
    
    {topSalles.length > 0 ? (
      <ProgressChart 
        data={topSalles.map(item => ({
          name: item.name || item.nom || 'Salle',
          rate: item.rate || item.taux || 0,
          count: item.count || item.utilisations || 0
        }))}
        colors={['#3D5AFE', '#00C853', '#FFD600', '#845EC2', '#FF6B6B']}
        showCount={true}
      />
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Activity className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-sm">Aucune donnée d'occupation</p>
        <p className="text-xs text-slate-300 mt-1">Les statistiques apparaîtront ici</p>
      </div>
    )}
  </div>
</div>
      </div>

      {/* ===== SIDEBAR DROITE (Widgets) - Responsive ===== */}
      <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-slate-100 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F8F9FE] order-2 lg:order-none">
        {/* Calendar Widget */}
                
        <DashCalendar 
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="mb-4 md:mb-6"
          weekStartsOn={1}
          events={todaySchedule.map(event => ({
            date: new Date().toISOString().split('T')[0],
            title: event.matiere
          }))}
        />

        {/* Planning du Jour */}
        <div className="bg-white border border-slate-100 shadow-sm p-4 md:p-6 rounded-2xl md:rounded-3xl mb-4 md:mb-6">
          <h4 className="text-sm text-slate-800 mb-4 md:mb-6">Planning du Jour</h4>
          <div className="space-y-3 md:space-y-4">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((event, index) => {
                const colors = ['purple', 'yellow', 'red', 'blue', 'green'];
                const color = colors[index % colors.length];
                const colorMap = {
                  purple: 'border-purple-400',
                  yellow: 'border-yellow-400',
                  red: 'border-red-400',
                  blue: 'border-blue-400',
                  green: 'border-green-400'
                };
                const dotColorMap = {
                  purple: 'bg-purple-400',
                  yellow: 'bg-yellow-400',
                  red: 'bg-red-400',
                  blue: 'bg-blue-400',
                  green: 'bg-green-400'
                };
                return (
                  <div key={index} className={`relative pl-4 md:pl-6 border-l-2 ${colorMap[color] || 'border-blue-400'}`}>
                    <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${dotColorMap[color] || 'bg-blue-400'}`} />
                    <p className="text-[10px] text-slate-400">{event.horaire}</p>
                    <h5 className="text-xs text-slate-800">{event.matiere}</h5>
                    <p className="text-[10px] text-slate-500">{event.enseignant} — {event.salle}</p>
                    <span className={`text-[8px] uppercase ${event.statut === 'Actif' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.statut}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Aucun événement aujourd'hui</p>
            )}
          </div>
        </div>

        {/* Cours Annulés */}
        <div className="bg-white border border-slate-100 shadow-sm p-4 md:p-6 rounded-2xl md:rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm text-slate-800">Cours Annulés</h4>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2 md:space-y-3">
            {cancelledCourses.length > 0 ? (
              cancelledCourses.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-red-600 shrink-0">
                    <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="text-xs text-slate-800 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-500">{item.date} - {item.enseignant}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Aucun cours annulé</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;