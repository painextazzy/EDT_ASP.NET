// src/pages/client/EnseignantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronLeft, ChevronRight, Bell, User, 
  LogOut, Plus, Home, Users, FileText, AlertCircle,
  Menu, X, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { authApi } from '../../services/auth';

const EnseignantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ Vérifier si authentifié
        if (!authApi.isAuthenticated()) {
          console.log('⚠️ Non authentifié, redirection vers login');
          navigate('/login');
          return;
        }

        // ✅ Vérifier le rôle
        const userData = authApi.getUser();
        if (userData?.role !== 'ENSEIGNANT') {
          console.log(`⚠️ Rôle incorrect: ${userData?.role}, attendu: ENSEIGNANT`);
          navigate('/login');
          return;
        }

        // ✅ Charger le profil
        setUser(userData);
        console.log('✅ Enseignant connecté:', userData.email);
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    authApi.logout();
  };

  // Fonctions du calendrier
  const getMonthName = (date) => {
    return date.toLocaleString('fr', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const courses = [
    { id: 1, name: 'Advanced Calculus II', day: 0, start: 9, end: 11, color: 'bg-purple-100 border-purple-500 text-purple-900', room: 'Salle 101' },
    { id: 2, name: 'Meeting Call', day: 0, start: 12, end: 14, color: 'bg-blue-100 border-blue-500 text-blue-900', room: 'Salle 203' },
    { id: 3, name: 'Berangkat Ke Bali', day: 2, start: 11, end: 14, color: 'bg-green-100 border-green-500 text-green-900', room: 'Salle 305' },
    { id: 4, name: 'Sharing Technical', day: 3, start: 9, end: 11, color: 'bg-cyan-100 border-cyan-500 text-cyan-900', room: 'Salle 102' },
    { id: 5, name: 'App Design', day: 4, start: 11, end: 13, color: 'bg-pink-100 border-pink-500 text-pink-900', room: 'Salle 204' },
  ];

  const getCoursePosition = (startHour) => {
    const startOfDay = 7;
    return (startHour - startOfDay) * 80;
  };

  const getCourseHeight = (startHour, endHour) => {
    return (endHour - startHour) * 80;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Erreur</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">📚 Calendrier Enseignant</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-200">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.email?.split('@')[0] || 'Enseignant'}&background=3b82f6&color=fff`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.email?.split('@')[0]}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-2">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-3">
            <Home className="w-5 h-5" />
            <span>Accueil</span>
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-3">
            <Calendar className="w-5 h-5" />
            <span>Planning</span>
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-3">
            <Users className="w-5 h-5" />
            <span>Étudiants</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center space-x-3 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* User Info */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-blue-100">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.email?.split('@')[0] || 'Enseignant'}&background=3b82f6&color=fff`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">{user?.email?.split('@')[0]}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{user?.role}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {user?.estValide ? '✅ Validé' : '⏳ En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm md:text-base">{getMonthName(currentDate)}</h3>
                <div className="flex space-x-1">
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-1 md:gap-y-2 text-center text-xs">
                {days.map((day, i) => (
                  <div key={i} className="text-gray-500 font-medium">{day}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-1"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth();
                  return (
                    <div 
                      key={day} 
                      className={`py-1 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${
                        isToday ? 'bg-blue-600 text-white font-bold' : ''
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-3">
                <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                  <h2 className="text-lg md:text-xl font-bold">
                    {currentDate.toLocaleDateString('fr', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-white rounded">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={goToday} className="px-2 py-1 text-xs font-bold hover:bg-white rounded">
                      Aujourd'hui
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-white rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 rounded-md text-xs md:text-sm font-bold transition-colors ${
                      viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Semaine
                  </button>
                  <button 
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 rounded-md text-xs md:text-sm font-bold transition-colors ${
                      viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Jour
                  </button>
                  <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-6 border-b border-gray-200 overflow-x-auto">
                <div className="p-3 md:p-4 bg-gray-50 w-20 md:w-24"></div>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, index) => (
                  <div key={index} className={`p-3 md:p-4 text-center ${index === 2 ? 'bg-blue-50' : ''}`}>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">{day}</p>
                    <p className={`text-lg md:text-xl font-bold ${index === 2 ? 'text-blue-600' : ''}`}>{16 + index}</p>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="relative overflow-y-auto" style={{ maxHeight: '500px' }}>
                <div className="flex">
                  <div className="w-20 md:w-24 flex-shrink-0 border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                    {hours.map((hour, index) => (
                      <div key={index} className="h-20 flex items-center justify-center text-[10px] md:text-xs text-gray-400 border-b border-gray-200">
                        {hour}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 grid grid-cols-5 relative">
                    {Array.from({ length: 12 * 5 }).map((_, index) => (
                      <div 
                        key={index} 
                        className={`h-20 border-r border-gray-200 border-b border-gray-200 ${
                          Math.floor(index / 12) === 2 ? 'bg-blue-50/30' : ''
                        }`}
                      />
                    ))}
                    {courses.map((course) => (
                      <div 
                        key={course.id}
                        className={`absolute ${course.color} border-l-4 p-1 md:p-2 rounded-lg shadow-sm m-0.5 md:m-1 cursor-pointer z-20 hover:scale-105 transition-transform`}
                        style={{
                          top: `${getCoursePosition(course.start)}px`,
                          left: `${course.day * 20}%`,
                          width: '19.2%',
                          height: `${getCourseHeight(course.start, course.end)}px`,
                        }}
                      >
                        <p className="font-bold text-[10px] md:text-xs leading-tight">{course.name}</p>
                        <p className="text-[8px] md:text-[10px] mt-0.5 md:mt-1 opacity-75">
                          {course.start}h - {course.end}h
                        </p>
                        <p className="text-[8px] md:text-[10px] opacity-50">{course.room}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center p-3 z-50">
        <button className="flex flex-col items-center space-y-1 text-blue-600">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Accueil</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-gray-500">
          <Calendar className="w-6 h-6" />
          <span className="text-[10px]">Planning</span>
        </button>
        <div className="flex flex-col items-center -mt-8">
          <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <button className="flex flex-col items-center space-y-1 text-gray-500">
          <Users className="w-6 h-6" />
          <span className="text-[10px]">Faculté</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-gray-500">
          <User className="w-6 h-6" />
          <span className="text-[10px]">Profil</span>
        </button>
      </nav>

      {/* PDF Button */}
      <button className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-blue-600 text-white flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg transition-all hover:scale-105 hover:bg-blue-700 z-50">
        <FileText className="w-4 h-4 md:w-5 md:h-5" />
        <span className="font-bold text-sm md:text-base">PDF</span>
      </button>
    </div>
  );
};

export default EnseignantDashboard;