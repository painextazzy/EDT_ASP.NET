// src/components/dashboard/AcademicDashboard.jsx
import React, { useState } from 'react';
import { 
  Search, Star, TrendingUp, Video, Building, CalendarDays, 
  AlertTriangle, CheckCircle, Plus, ChevronLeft, ChevronRight,
  Calendar, Clock, MapPin, Users, GraduationCap, BookOpen,
  FileText, Award, Bell, Settings, LogOut, Menu, X
} from 'lucide-react';

const AcademicDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4, 1)); // Mai 2024
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 4, 17));

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDay = firstDayOfMonth.getDay();
    const startOffset = startDay === 0 ? 6 : startDay - 1;
    
    const days = [];
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, currentMonth: false });
    }
    
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, currentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, currentMonth: false });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day, currentMonthFlag) => {
    if (!currentMonthFlag) return false;
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day, currentMonthFlag) => {
    if (!currentMonthFlag) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth.getMonth() && 
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] p-4 md:p-6 lg:p-10 gap-10 font-['Poppins',sans-serif]">
      {/* Main Content Column */}
      <main className="flex-1 flex flex-col gap-8">
        {/* Top Bar */}
        <header className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-800">Bonjour, Professeur</h1>
            <p className="text-slate-500 text-sm">Bienvenue dans votre espace académique</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-11 pr-4 py-2 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 w-64"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold">
              JP
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Vos activités aujourd'hui</h2>
            <span className="text-2xl font-medium text-slate-400">(8)</span>
          </div>

          {/* Primary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Card 1: Total Cours */}
            <div className="bg-[#D4EDE9] p-8 rounded-[2rem] shadow-sm relative flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold border-2 border-white">
                    <GraduationCap className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold border-2 border-white">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold border-2 border-white">
                    +24
                  </div>
                </div>
                <div className="bg-white/60 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> 4.9
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Cours</p>
                  <h3 className="text-3xl font-bold">42</h3>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Card 2: Enseignants */}
            <div className="bg-[#FCE4EC] p-8 rounded-[2rem] shadow-sm relative flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold border-2 border-white">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold border-2 border-white">
                    12
                  </div>
                </div>
                <div className="bg-white/60 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> 4.8
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Enseignants</p>
                  <h3 className="text-3xl font-bold">18</h3>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress / Secondary Metrics */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Progression pédagogique</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#E2E8F0] p-6 rounded-[1.5rem] flex flex-col gap-4">
                <div className="flex justify-between items-center text-slate-500 font-medium text-sm">
                  <span>Salles Total</span>
                  <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-4xl font-bold">50</div>
              </div>
              <div className="bg-[#FFECB3] p-6 rounded-[1.5rem] flex flex-col gap-4">
                <div className="flex justify-between items-center text-slate-500 font-medium text-sm">
                  <span>Examens Actifs</span>
                  <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-4xl font-bold">12</div>
              </div>
              <div className="bg-[#E1BEE7] p-6 rounded-[1.5rem] flex flex-col gap-4">
                <div className="flex justify-between items-center text-slate-500 font-medium text-sm">
                  <span>Soutenances</span>
                  <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-4xl font-bold">04</div>
              </div>
            </div>
          </div>

          {/* Additional Stats List */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-[#FFECB3]/30 p-8 rounded-[2rem] border border-[#FFECB3] flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  Événements planifiés
                </div>
                <h4 className="text-3xl font-bold">86 Événements cette semaine</h4>
              </div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <TrendingUp className="w-6 h-6 text-slate-800" />
              </div>
            </div>

            <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-rose-500 uppercase tracking-widest">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  Conflits détectés
                </div>
                <h4 className="text-3xl font-bold text-rose-900">03 Attention requise</h4>
              </div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-6 h-6 text-rose-500 font-bold" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Right Sidebar: Lesson Schedule */}
      <aside className="w-96 flex-shrink-0 flex flex-col gap-10">
        {/* Mini Calendar */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <div className="flex gap-4">
              <button onClick={handlePrevMonth} className="text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-4 uppercase">
            {weekDays.map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                onClick={() => day.currentMonth && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date))}
                className={`
                  p-2 rounded-full transition-all
                  ${!day.currentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100'}
                  ${isToday(day.date, day.currentMonth) ? 'bg-slate-100 font-bold' : ''}
                  ${isSelected(day.date, day.currentMonth) ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}
                `}
              >
                {day.date}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Lessons List */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Séminaire Recherche 'IA & Ethique'</p>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-slate-900 h-full w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Cours: Architecture Logicielle</p>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-slate-900 h-full w-1/4 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-[#D4EDE9] p-6 rounded-[1.5rem] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Créneaux libres</p>
                <p className="text-xl font-bold">18 slots today</p>
              </div>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </aside>

      {/* Floating Action Button */}
      <div className="fixed bottom-10 right-10">
        <button className="w-20 h-20 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default AcademicDashboard;