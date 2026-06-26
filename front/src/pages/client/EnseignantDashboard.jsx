// src/pages/client/EnseignantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, User, LogOut, Home, FileText, AlertCircle,
  Calendar as CalendarIcon, XCircle, CheckCircle, Clock,
  ChevronLeft, ChevronRight, Trash2, Eye
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { authApi } from '../../services/auth';
import NavbarAdmin from '../../components/NavbarAdmin';
import { SidebarProvider, useSidebar } from '../../components/SidebarContext';

// ===== COMPOSANT CONTENU =====
const EnseignantContent = () => {
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'

  // ✅ Charger les cours de l'enseignant
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authApi.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const userData = authApi.getUser();
        if (userData?.role !== 'ENSEIGNANT') {
          navigate('/login');
          return;
        }

        setUser(userData);
        loadCourses();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // ✅ Chargement des cours (simulé)
  const loadCourses = async () => {
    try {
      // Simuler des cours (à remplacer par votre API)
      const today = new Date();
      const demoCourses = [
        {
          id: 1,
          title: 'Advanced Calculus II',
          day: 0, // 0 = lundi
          start: 9,
          end: 11,
          room: 'Salle 101',
          professor: 'Dr. Martin',
          status: 'confirmed',
          students: 12,
          color: 'purple'
        },
        {
          id: 2,
          title: 'Meeting Call',
          day: 0,
          start: 12,
          end: 14,
          room: 'Salle 203',
          professor: 'Dr. Bernard',
          status: 'confirmed',
          students: 8,
          color: 'blue'
        },
        {
          id: 3,
          title: 'Berangkat Ke Bali',
          day: 2,
          start: 11,
          end: 14,
          room: 'Salle 305',
          professor: 'Dr. Dubois',
          status: 'cancelled',
          students: 15,
          color: 'green'
        },
        {
          id: 4,
          title: 'Sharing Technical',
          day: 3,
          start: 9,
          end: 11,
          room: 'Salle 102',
          professor: 'Dr. Petit',
          status: 'confirmed',
          students: 10,
          color: 'cyan'
        },
        {
          id: 5,
          title: 'App Design',
          day: 4,
          start: 11,
          end: 13,
          room: 'Salle 204',
          professor: 'Dr. Moreau',
          status: 'confirmed',
          students: 6,
          color: 'pink'
        }
      ];
      setCourses(demoCourses);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      showNotification('Erreur lors du chargement des cours', 'error');
    }
  };

  // ✅ Notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ✅ Annuler un cours
  const handleCancelCourse = async () => {
    if (!selectedCourse) return;

    try {
      // Simuler l'annulation (à remplacer par votre API)
      setCourses(courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, status: 'cancelled' } 
          : c
      ));
      
      showNotification(`✅ Cours "${selectedCourse.title}" annulé avec succès`, 'success');
      setShowConfirmModal(false);
      setSelectedCourse(null);
    } catch (error) {
      showNotification('❌ Erreur lors de l\'annulation', 'error');
    }
  };

  // ✅ Ouvrir le modal de confirmation
  const openCancelModal = (course) => {
    if (course.status === 'cancelled') {
      showNotification('Ce cours est déjà annulé', 'error');
      return;
    }
    setSelectedCourse(course);
    setShowConfirmModal(true);
  };

  // ✅ Navigation dans le calendrier
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();
  const weekDayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // ✅ Couleurs des cours
  const getColorClasses = (color, status) => {
    if (status === 'cancelled') {
      return 'bg-gray-100 border-gray-400 text-gray-500';
    }
    const colors = {
      purple: 'bg-purple-50 border-purple-500 text-purple-900',
      blue: 'bg-blue-50 border-blue-500 text-blue-900',
      green: 'bg-green-50 border-green-500 text-green-900',
      cyan: 'bg-cyan-50 border-cyan-500 text-cyan-900',
      pink: 'bg-pink-50 border-pink-500 text-pink-900',
      orange: 'bg-orange-50 border-orange-500 text-orange-900',
      red: 'bg-red-50 border-red-500 text-red-900'
    };
    return colors[color] || colors.blue;
  };

  // ✅ Filtrer les cours du jour
  const getCoursesForDay = (dayIndex) => {
    return courses.filter(c => c.day === dayIndex && c.status !== 'cancelled');
  };

  const getCancelledCoursesForDay = (dayIndex) => {
    return courses.filter(c => c.day === dayIndex && c.status === 'cancelled');
  };

  // ✅ Heures
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7h à 18h

  const handleLogout = () => {
    authApi.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9ff]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005bbf] mx-auto"></div>
          <p className="mt-4 text-[#414754]">Chargement de votre planning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9ff]">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-[#ba1a1a] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#181c20]">Erreur</h2>
          <p className="text-[#414754] mt-2">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-[#005bbf] text-white rounded-lg hover:bg-[#004a9f] transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const userSettings = {
    nom: user?.email?.split('@')[0] || 'Enseignant',
    email: user?.email || 'enseignant@example.com',
    avatar: user?.avatar || null,
  };

  // ✅ Compter les cours
  const totalCourses = courses.filter(c => c.status === 'confirmed').length;
  const cancelledCourses = courses.filter(c => c.status === 'cancelled').length;
  const todayCourses = courses.filter(c => {
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    return c.day === todayIndex && c.status === 'confirmed';
  });

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20]">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg transition-all ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Navbar */}
      <NavbarAdmin 
        userSettings={userSettings}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181c20]">
              📚 Mon Planning
            </h1>
            <p className="text-[#414754] text-sm mt-1">
              Gérez vos cours et annulations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#ebeef4] rounded-lg p-1">
              <button 
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                  viewMode === 'week' ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                Semaine
              </button>
              <button 
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                  viewMode === 'day' ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                Jour
              </button>
            </div>
            <button 
              onClick={goToday}
              className="px-4 py-2 bg-[#005bbf] text-white rounded-lg hover:bg-[#004a9f] transition-colors text-sm font-bold"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-[#414754]">Total cours</p>
            <p className="text-2xl font-bold text-[#005bbf]">{totalCourses}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-[#414754]">Cours aujourd'hui</p>
            <p className="text-2xl font-bold text-[#005bbf]">{todayCourses.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-[#414754]">Annulés</p>
            <p className="text-2xl font-bold text-[#ba1a1a]">{cancelledCourses}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-[#414754]">Étudiants total</p>
            <p className="text-2xl font-bold text-[#005bbf]">
              {courses.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + (c.students || 0), 0)}
            </p>
          </div>
        </div>

        {/* Navigation semaine */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={prevWeek}
              className="p-2 hover:bg-[#ebeef4] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-[#181c20]">
              {format(weekDays[0], 'd MMM', { locale: fr })} - {format(weekDays[4], 'd MMM yyyy', { locale: fr })}
            </span>
            <button 
              onClick={nextWeek}
              className="p-2 hover:bg-[#ebeef4] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm text-[#414754]">
            Semaine {format(currentDate, 'w', { locale: fr })}
          </span>
        </div>

        {/* Grille des cours */}
        <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden border border-[#c1c6d6]">
          {/* En-tête des jours */}
          <div className="grid grid-cols-6 border-b border-[#c1c6d6]">
            <div className="p-3 bg-[#f1f4fa] w-16"></div>
            {weekDays.map((day, index) => {
              const dayCourses = getCoursesForDay(index);
              const cancelledDayCourses = getCancelledCoursesForDay(index);
              const isTodayDate = isToday(day);
              return (
                <div 
                  key={index} 
                  className={`p-3 text-center ${isTodayDate ? 'bg-[#f1f4fa]/50' : ''}`}
                >
                  <p className="text-xs font-bold text-[#727785] uppercase">
                    {weekDayNames[index]}
                  </p>
                  <p className={`text-lg font-bold ${isTodayDate ? 'text-[#005bbf]' : ''}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="flex justify-center gap-1 mt-1">
                    {dayCourses.length > 0 && (
                      <span className="text-xs text-green-600">● {dayCourses.length}</span>
                    )}
                    {cancelledDayCourses.length > 0 && (
                      <span className="text-xs text-red-500">✕ {cancelledDayCourses.length}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corps avec les heures */}
          <div className="relative overflow-x-auto" style={{ maxHeight: '500px' }}>
            <div className="flex min-w-[700px]">
              {/* Colonne des heures */}
              <div className="w-16 flex-shrink-0 bg-[#f1f4fa] border-r border-[#c1c6d6] sticky left-0 z-10">
                {hours.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-20 flex items-center justify-center text-xs text-[#727785] border-b border-[#c1c6d6]"
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Colonnes des jours */}
              <div className="flex-1 grid grid-cols-5 relative">
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="relative">
                    {hours.map((hour) => (
                      <div 
                        key={hour} 
                        className={`h-20 border-b border-[#edf2f7] ${
                          dayIndex < 4 ? 'border-r border-[#edf2f7]' : ''
                        } ${isToday(day) ? 'bg-[#f7f9ff]' : ''}`}
                      />
                    ))}

                    {/* Afficher les cours */}
                    {courses
                      .filter(c => c.day === dayIndex)
                      .map((course) => {
                        const isCancelled = course.status === 'cancelled';
                        const top = (course.start - 7) * 80;
                        const height = (course.end - course.start) * 80;
                        const colorClass = getColorClasses(course.color, course.status);
                        
                        return (
                          <div
                            key={course.id}
                            className={`absolute ${colorClass} border-l-4 p-2 rounded-lg shadow-sm m-1 transition-all ${
                              !isCancelled ? 'hover:scale-105 hover:shadow-md cursor-pointer' : 'opacity-60'
                            }`}
                            style={{
                              top: `${top}px`,
                              left: '4px',
                              right: '4px',
                              height: `${height}px`,
                              zIndex: isCancelled ? 5 : 10,
                            }}
                            onClick={() => !isCancelled && openCancelModal(course)}
                          >
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <p className={`font-bold text-xs leading-tight ${isCancelled ? 'line-through' : ''}`}>
                                  {course.title}
                                </p>
                                <p className="text-[10px] opacity-75">
                                  {course.start}h - {course.end}h
                                </p>
                                <p className="text-[10px] opacity-50">{course.room}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                {!isCancelled ? (
                                  <span className="text-[10px] font-medium text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {course.students || 0} étudiants
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Annulé
                                  </span>
                                )}
                                {!isCancelled && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openCancelModal(course);
                                    }}
                                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Annuler ce cours"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-sm text-[#727785] flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" /> Confirmé
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-500" /> Annulé
          </span>
          <span className="flex items-center gap-1">
            <Trash2 className="w-4 h-4 text-red-400" /> Cliquer pour annuler
          </span>
        </div>
      </main>

      {/* ✅ Modal de confirmation d'annulation */}
      {showConfirmModal && selectedCourse && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#181c20]">Annuler le cours</h3>
                  <p className="text-[#414754] text-sm mt-1">
                    Êtes-vous sûr de vouloir annuler ce cours ?
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-bold text-[#181c20]">{selectedCourse.title}</p>
                <p className="text-sm text-[#414754]">
                  {selectedCourse.start}h - {selectedCourse.end}h • {selectedCourse.room}
                </p>
                <p className="text-sm text-[#414754]">
                  {selectedCourse.students || 0} étudiants
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleCancelCourse}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-[#f7f9ff] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center p-3 z-40">
        <button className="flex flex-col items-center space-y-1 text-[#005bbf]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Accueil</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-[#414754]">
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px]">Planning</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-[#414754]">
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center space-y-1 text-[#ba1a1a]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Déconnexion</span>
        </button>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .bg-background {
          background-color: #f7f9ff;
        }
        .text-on-surface {
          color: #181c20;
        }
      `}</style>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
const EnseignantDashboard = () => {
  return (
    <SidebarProvider>
      <EnseignantContent />
    </SidebarProvider>
  );
};

export default EnseignantDashboard;