// src/components/EnseignantDashboard.jsx
import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Settings,
  LogOut,
  Check,
  Printer,
  ChevronDown,
  Menu,
} from 'lucide-react';
import BigCalendar from '../../components/ui/BigCalendar';
import MiniCalendar from '../../components/ui/MiniCalendar';

const EnseignantDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Données fictives pour la sidebar
  const todayCourses = [
    { time: '09:00 - 11:00', title: 'Machine Learning Fondamentaux', room: 'Amphi Turing' },
    { time: '11:00 - 13:00', title: 'Deep Learning & Architectures', room: 'Lab 10B' },
    { time: '14:00 - 16:00', title: 'Éthique et IA', room: 'Salle 402' },
  ];

  const completedCourses = [
    "Introduction à l'IA",
    'Algorithmique Avancée',
    'Mathématiques Discrètes',
  ];

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const SidebarContent = () => (
    <>
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">
            {format(currentDate, 'MMMM yyyy', { locale: fr })
              .charAt(0)
              .toUpperCase() +
              format(currentDate, 'MMMM yyyy', { locale: fr }).slice(1)}
          </h3>
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              className="p-1 text-slate-400 hover:bg-slate-50 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              className="p-1 text-slate-400 hover:bg-slate-50 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <MiniCalendar
          currentDate={currentDate}
          onDateChange={handleDateChange}
          selectedDate={selectedDate}
          compact={true}
        />
      </div>

      <div className="bg-sky-50 rounded-2xl p-4 md:p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-3 md:mb-4 text-slate-800">Cours d'aujourd'hui</h3>
          <div className="space-y-3 md:space-y-4">
            {todayCourses.map((course, idx) => (
              <div
                key={idx}
                className={
                  idx < todayCourses.length - 1
                    ? 'border-b border-white/20 pb-2 md:pb-3'
                    : 'pb-1'
                }
              >
                <p className="text-[10px] opacity-80 mb-0.5 text-slate-600">{course.time}</p>
                <h4 className="font-semibold text-sm text-slate-800">{course.title}</h4>
                <p className="text-[10px] opacity-70 text-slate-600">{course.room}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">Liste cours terminés</h3>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        <div className="space-y-2 md:space-y-3">
          {completedCourses.map((course, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                {course}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-body flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />

      <main className="flex-1 flex gap-4 md:gap-8 p-3 md:p-8 overflow-hidden bg-zinc-50 relative">
        <aside
          className={`
            fixed inset-0 z-40 w-72 md:w-[300px] bg-zinc-50 p-4 md:p-0 md:static md:bg-transparent
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            flex flex-col gap-4 md:gap-6 overflow-y-auto no-scrollbar shrink-0
          `}
        >
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-[-1]"
              onClick={toggleSidebar}
            />
          )}
          <SidebarContent />
        </aside>

        <section className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden min-w-0">
          <div className="flex items-center justify-between shrink-0 flex-wrap gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                className="p-1.5 md:p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
              </button>
              <h2 className="text-sm md:text-2xl font-bold text-slate-800 truncate max-w-[180px] md:max-w-none">
                {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM', { locale: fr })} -{' '}
                {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: fr })}
              </h2>
              <button
                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                className="p-1.5 md:p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex gap-2 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2 p-1 bg-white rounded-xl shadow-sm border border-outline-variant">
                <button className="px-2 md:px-4 py-1 text-[10px] md:text-xs font-semibold text-slate-400 hover:text-slate-600">
                  Jours
                </button>
                <button className="px-2 md:px-4 py-1 text-[10px] md:text-xs font-bold bg-slate-50 text-slate-800 rounded-lg shadow-sm">
                  Semaine
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-outline-variant overflow-hidden min-h-[500px]">
            <BigCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              currentDate={currentDate}
              onDateChangeParent={setCurrentDate}
            />
          </div>
        </section>
      </main>

      <button className="fixed bottom-4 right-4 md:bottom-10 md:right-10 bg-slate-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-slate-700 w-12 h-12 md:w-14 md:h-14 shadow-2xl rounded-full group">
        <Printer className="w-5 h-5 md:w-6 md:h-6" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl pointer-events-none whitespace-nowrap">
          Imprimer
        </div>
      </button>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .border-outline-variant { border-color: #e2e8f0; }
        .bg-sky-50 { background-color: #f0f9ff; }
      `}</style>
    </div>
  );
};

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="border-b border-outline-variant px-3 md:px-8 py-3 md:py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm bg-white shadow-md">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 md:hidden text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span
          className="text-xl md:text-2xl font-bold text-sky-500"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Calendar.
        </span>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-1.5 md:p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-1 right-1 md:top-2 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="relative group">
          <button className="flex items-center gap-1 md:gap-2 p-1 hover:bg-slate-50 rounded-full transition-colors">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU0mRT3tjM2y3_fDnluuwFO_8Z6EBlhR1UtByUdj1p8e50aE05cwUwQxKYSHZ9Bxb2eVRuxP1cBIpdtkaBWTlBqBMShW-vqtbTN1Ca9KDUTHf08m2TTsZ2pmtQOf16i8Q1kg-55JN8atBJ2x640x_IUUt2_0AjxRt4H_HmZ-6pvE6X1cLrMVTtTNWXeufwmo7UHzB3zS7C9QTW0ft2-HT0LiYxyWJFRucTK7CK1aa-qBHvDXGyI_c"
              className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-outline-variant"
              alt="User profile"
            />
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-outline-variant py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <User className="w-4 h-4" /> Mon Profil
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Settings className="w-4 h-4" /> Paramètres
            </a>
            <div className="my-1 border-t border-outline-variant" />
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Déconnexion
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EnseignantDashboard;