// src/pages/client/EnseignantDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Bell, LogOut, Menu, Calendar as CalendarIcon, 
  FileText, Home, Users, Plus, AlertCircle, Download, RefreshCw, Settings, User,
  X, Save, Mail, Lock, UserCircle, CalendarDays, Clock, BookOpen, XCircle,
  BarChart3
} from 'lucide-react';
import { authApi } from '../../services/auth';
import api from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo.jpg'; // Import du logo

// Couleurs pour les cours
const courseColors = [
  { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-900', hex: '#8B5CF6' },
  { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900', hex: '#3B82F6' },
  { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900', hex: '#10B981' },
  { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-900', hex: '#06B6D4' },
  { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-900', hex: '#EC4899' },
  { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-900', hex: '#F59E0B' },
  { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-900', hex: '#6366F1' },
  { bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-900', hex: '#F43F5E' },
];

const EnseignantDashboard = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 22));
  const [viewMode, setViewMode] = useState('week');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // État pour la demande d'annulation
  const [showCancelRequestModal, setShowCancelRequestModal] = useState(false);
  const [selectedCancelCourse, setSelectedCancelCourse] = useState(null);
  const [cancelMotif, setCancelMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [userSettings, setUserSettings] = useState({
    nom: '',
    email: '',
    password: '',
    notifications: true,
    theme: 'light'
  });
  const [tempSettings, setTempSettings] = useState({});
  
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enseignantId, setEnseignantId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ========== CHARGEMENT DES COURS ==========
  const loadCourses = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setLoadingCourses(true);
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const id = userData.enseignantId || userData.id;
        const role = userData.role || 'enseignant';
        
        setEnseignantId(id);
        setIsAdmin(role === 'admin' || role === 'ADMIN');
        
        let data;
        if (role === 'admin' || role === 'ADMIN') {
          data = await api.planning.getAll();
        } else {
          if (api.planning.getByEnseignantId) {
            data = await api.planning.getByEnseignantId(id);
          } else {
            data = await api.planning.getAll();
          }
        }
        
        const formattedCourses = data.map((item, index) => {
          const startDate = new Date(item.dateDebut);
          const endDate = new Date(item.dateFin);
          const dayOfWeek = startDate.getDay();
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const color = courseColors[index % courseColors.length];
          
          let matiereName = 'Cours';
          if (item.titre) matiereName = item.titre;
          else if (item.matiere?.nom) matiereName = item.matiere.nom;
          else if (item.cours?.nom) matiereName = item.cours.nom;
          else if (item.enseignement?.cours?.nom) matiereName = item.enseignement.cours.nom;
          else if (item.name) matiereName = item.name;
          
          let enseignantName = '';
          if (item.enseignant?.nom) enseignantName = item.enseignant.nom;
          else if (item.enseignement?.enseignant?.nom) enseignantName = item.enseignement.enseignant.nom;
          
          let niveauName = '';
          if (item.niveau) niveauName = item.niveau;
          else if (item.enseignement?.niveau?.libelle) niveauName = item.enseignement.niveau.libelle;
          
          let roomName = 'Salle non définie';
          if (item.salles && Array.isArray(item.salles) && item.salles.length > 0) {
            roomName = item.salles.map(s => s.nom || s.numero).join(', ');
          }
          
          return {
            id: item.id,
            name: matiereName,
            matiere: matiereName,
            day: dayIndex,
            start: startDate.getHours(),
            end: endDate.getHours(),
            color: color,
            room: roomName,
            enseignant: enseignantName,
            niveau: niveauName,
            statut: item.statut || 'Actif',
            date: startDate
          };
        });
        
        setCourses(formattedCourses);
        
        if (userData) {
          setUserSettings({
            nom: userData.nom || userData.email?.split('@')[0] || 'Utilisateur',
            email: userData.email || '',
            password: '',
            notifications: true,
            theme: 'light'
          });
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Impossible de charger les cours');
    } finally {
      setLoadingCourses(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  // ========== AUTHENTIFICATION ==========
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authApi.isAuthenticated()) {
          navigate('/login');
          return;
        }
        const userData = authApi.getUser();
        setUser(userData);
        await loadCourses();
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // ========== NAVIGATION ==========
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      authApi.logout();
      navigate('/login');
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  // ========== FONCTIONS CALENDRIER ==========
  const getMonthName = (date) => date.toLocaleString('fr', { month: 'long', year: 'numeric' });
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const weekDays = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

  // ========== FILTRAGE DES COURS ==========
  const getCoursesForWeek = () => {
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const filtered = courses.filter(course => {
      if (!course.date) return false;
      const courseDate = new Date(course.date);
      return courseDate >= monday && courseDate <= friday;
    });

    return filtered;
  };

  const getCoursesForDay = () => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return courses.filter(course => {
      if (!course.date) return false;
      const courseDate = new Date(course.date);
      return courseDate >= today && courseDate < tomorrow;
    });
  };

  const getCancelledCourses = () => courses.filter(c => c.statut === 'Annule').slice(0, 5);

  const getCoursePosition = (startHour) => (startHour - 7) * 80;
  const getCourseHeight = (startHour, endHour) => {
    const height = (endHour - startHour) * 80;
    return Math.max(height, 35);
  };

  const filteredCourses = viewMode === 'day' ? getCoursesForDay() : getCoursesForWeek();
  const cancelledCourses = getCancelledCourses();

  // ========== DEMANDE D'ANNULATION ==========
  const openCancelRequestModal = (course) => {
    setSelectedCancelCourse(course);
    setCancelMotif('');
    setShowCancelRequestModal(true);
  };

  const closeCancelRequestModal = () => {
    setShowCancelRequestModal(false);
    setSelectedCancelCourse(null);
    setCancelMotif('');
    setSubmitting(false);
  };

  const handleSubmitCancelRequest = async () => {
    if (!cancelMotif.trim() || !selectedCancelCourse) return;
    
    setSubmitting(true);
    try {
      const result = await api.annulation.demander(selectedCancelCourse.id, cancelMotif);
      if (result.message) {
        alert('✅ Demande d\'annulation envoyée avec succès ! En attente de validation par l\'administrateur.');
        await loadCourses(true);
        closeCancelRequestModal();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi de la demande';
      alert(`❌ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== EXPORT PDF - VERSION PROFESSIONNELLE AVEC LOGO ==========
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '40px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      
      // ===== EN-TÊTE PROFESSIONNEL AVEC LOGO =====
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '25px';
      header.style.paddingBottom = '20px';
      header.style.borderBottom = '3px solid #1a237e';
      
      // Logo à gauche
      const logoDiv = document.createElement('div');
      logoDiv.style.width = '80px';
      logoDiv.style.height = '80px';
      logoDiv.style.flexShrink = '0';
      
      // Charger le logo depuis l'import
      const img = new Image();
      img.src = logo;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.alt = 'Logo';
      logoDiv.appendChild(img);
      
      // Titre au centre
      const titleDiv = document.createElement('div');
      titleDiv.style.textAlign = 'center';
      titleDiv.style.flex = '1';
      titleDiv.innerHTML = `
        <div style="font-size:26px;font-weight:bold;color:#1a237e;letter-spacing:2px;">EMPLOI DU TEMPS</div>
        <div style="font-size:16px;color:#333;margin-top:4px;font-weight:500;">${getMonthName(currentDate)}</div>
      `;
      
      // Date à droite
      const dateDiv = document.createElement('div');
      dateDiv.style.textAlign = 'right';
      dateDiv.style.flexShrink = '0';
      dateDiv.innerHTML = `
        <div style="font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Document</div>
        <div style="font-size:12px;color:#333;font-weight:500;">${new Date().toLocaleDateString('fr', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
      `;
      
      header.appendChild(logoDiv);
      header.appendChild(titleDiv);
      header.appendChild(dateDiv);
      container.appendChild(header);
      
      // ===== INFORMATIONS SUPPLEMENTAIRES =====
      const infoBar = document.createElement('div');
      infoBar.style.display = 'flex';
      infoBar.style.justifyContent = 'space-between';
      infoBar.style.marginBottom = '20px';
      infoBar.style.padding = '12px 16px';
      infoBar.style.backgroundColor = '#f5f5f5';
      infoBar.style.borderRadius = '4px';
      infoBar.style.fontSize = '11px';
      infoBar.style.color = '#555';
      infoBar.innerHTML = `
        <div><strong>Enseignant :</strong> ${user?.nom || user?.email?.split('@')[0] || 'Non défini'}</div>
        <div><strong>Semaine :</strong> ${filteredCourses.length > 0 ? '22 - 26 Juin 2026' : 'Aucun cours'}</div>
        <div><strong>Total :</strong> ${filteredCourses.length} cours</div>
      `;
      container.appendChild(infoBar);
      
      // ===== TABLEAU =====
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '11px';
      table.style.fontFamily = 'Arial, sans-serif';
      
      const colorMap = {
        'bg-purple-100': '#f3e8ff',
        'bg-blue-100': '#dbeafe',
        'bg-green-100': '#d1fae5',
        'bg-cyan-100': '#cffafe',
        'bg-pink-100': '#fce7f3',
        'bg-amber-100': '#fef3c7',
        'bg-indigo-100': '#e0e7ff',
        'bg-rose-100': '#ffe4e6',
      };
      
      const borderColorMap = {
        'border-purple-500': '#8B5CF6',
        'border-blue-500': '#3B82F6',
        'border-green-500': '#10B981',
        'border-cyan-500': '#06B6D4',
        'border-pink-500': '#EC4899',
        'border-amber-500': '#F59E0B',
        'border-indigo-500': '#6366F1',
        'border-rose-500': '#F43F5E',
      };
      
      let html = `
        <thead>
          <tr style="background-color: #1a237e;color:#ffffff;">
            <th style="padding:12px 10px;text-align:center;border:1px solid #2a3a7e;width:12%;font-size:12px;font-weight:600;letter-spacing:0.5px;">HORAIRE</th>
            <th style="padding:12px 10px;text-align:center;border:1px solid #2a3a7e;width:17.6%;font-size:12px;font-weight:600;letter-spacing:0.5px;">LUNDI<br><span style="font-weight:400;font-size:10px;">22 Juin</span></th>
            <th style="padding:12px 10px;text-align:center;border:1px solid #2a3a7e;width:17.6%;font-size:12px;font-weight:600;letter-spacing:0.5px;">MARDI<br><span style="font-weight:400;font-size:10px;">23 Juin</span></th>
            <th style="padding:12px 10px;text-align:center;border:1px solid #2a3a7e;width:17.6%;font-size:12px;font-weight:600;letter-spacing:0.5px;">MERCREDI<br><span style="font-weight:400;font-size:10px;">24 Juin</span></th>
            <th style="padding:12px 10px;text-align:center;border:1px solid #2a3a7e;width:17.6%;font-size:12px;font-weight:600;letter-spacing:0.5px;">JEUDI<br><span style="font-weight:400;font-size:10px;">25 Juin</span></th>
            <th style="padding:12px 10px;text-align:center;border:1px solid #2a3a7e;width:17.6%;font-size:12px;font-weight:600;letter-spacing:0.5px;">VENDREDI<br><span style="font-weight:400;font-size:10px;">26 Juin</span></th>
          </tr>
        </thead>
        <tbody>
      `;
      
      for (let i = 7; i <= 20; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        const isEven = i % 2 === 0;
        html += `<tr style="background-color: ${isEven ? '#fafafa' : '#ffffff'};">`;
        html += `<td style="padding:8px 10px;text-align:center;border:1px solid #ddd;font-weight:600;color:#333;background-color:#f0f0f0;">${hour}</td>`;
        
        for (let day = 0; day < 5; day++) {
          const coursesAtHour = filteredCourses.filter(c => c.day === day && c.start === i);
          let cellContent = '';
          
          if (coursesAtHour.length > 0) {
            coursesAtHour.forEach(c => {
              const isCancelled = c.statut === 'Annule';
              const colorKey = c.color?.bg || 'bg-blue-100';
              const borderKey = c.color?.border || 'border-blue-500';
              const bgHex = colorMap[colorKey] || '#dbeafe';
              const borderHex = borderColorMap[borderKey] || '#3B82F6';
              
              cellContent += `<div style="
                background-color: ${isCancelled ? '#fef2f2' : bgHex};
                border-left: 4px solid ${isCancelled ? '#ef4444' : borderHex};
                padding: 8px 10px;
                margin: 4px 0;
                border-radius: 4px;
                ${isCancelled ? 'opacity: 0.7;' : ''}
              ">
                <div style="font-weight:bold;font-size:12px;color:${isCancelled ? '#999' : '#1a1a1a'};">${c.matiere || c.name || 'Cours'}</div>
                <div style="font-size:9px;color:#666;margin-top:2px;">${c.room}</div>
                ${c.niveau ? `<div style="font-size:8px;color:#888;margin-top:1px;">${c.niveau}</div>` : ''}
                ${isCancelled ? '<div style="font-size:9px;color:#dc2626;font-weight:bold;margin-top:3px;">ANNULE</div>' : ''}
              </div>`;
            });
          }
          
          html += `<td style="padding:6px;border:1px solid #ddd;vertical-align:top;text-align:center;">${cellContent || ''}</td>`;
        }
        
        html += '</tr>';
      }
      
      html += '</tbody>';
      table.innerHTML = html;
      container.appendChild(table);
      
      // ===== PIED DE PAGE =====
      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.marginTop = '25px';
      footer.style.paddingTop = '15px';
      footer.style.borderTop = '2px solid #1a237e';
      footer.style.fontSize = '9px';
      footer.style.color = '#888';
      footer.innerHTML = `
        <div>Document généré automatiquement</div>
        <div>${user?.email || 'Utilisateur'} • ${new Date().toLocaleDateString('fr')}</div>
        <div>${filteredCourses.length} cours programmés</div>
      `;
      container.appendChild(footer);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(container, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;
            const color = style.color;
            const borderColor = style.borderColor;
            
            if (bgColor && (bgColor.includes('oklab') || bgColor.includes('oklch'))) {
              el.style.backgroundColor = '#ffffff';
            }
            if (color && (color.includes('oklab') || color.includes('oklch'))) {
              el.style.color = '#000000';
            }
            if (borderColor && (borderColor.includes('oklab') || borderColor.includes('oklch'))) {
              el.style.borderColor = '#999999';
            }
          });
        }
      });
      
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 280;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
      
      pdf.save(`Emploi_du_temps_${formatDate(currentDate)}.pdf`);
      
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleNotifications = () => {
    alert('📬 Vous avez 0 notifications non lues');
  };

  const handleAddCourse = () => {
    alert('➕ Fonctionnalité d\'ajout de cours à venir');
  };

  const handleRefresh = async () => {
    await loadCourses(true);
  };

  const openSettings = () => {
    setTempSettings({ ...userSettings });
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const saveSettings = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const updatedUser = { 
        ...userData, 
        nom: tempSettings.nom,
        email: tempSettings.email,
        preferences: {
          notifications: tempSettings.notifications,
          theme: tempSettings.theme
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    setUserSettings({ ...tempSettings });
    setShowSettings(false);
    alert('✅ Paramètres sauvegardés avec succès !');
  };

  const setDayView = () => setViewMode('day');
  const setWeekView = () => setViewMode('week');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Erreur</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={goToHome}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              C
            </div>
            <span className="font-semibold text-gray-800 text-sm hidden sm:block">Calendrier</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleNotifications}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={openSettings}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Paramètres"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <button 
              onClick={goToProfile}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:scale-105 transition-transform"
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </button>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.email?.split('@')[0]}</span>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-2 z-30 shadow-lg">
          <button 
            onClick={() => { setMobileMenuOpen(false); goToHome(); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
          >
            <Home className="w-5 h-5" /><span>Accueil</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
          >
            <CalendarIcon className="w-5 h-5" /><span>Planning</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); goToProfile(); }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
          >
            <User className="w-5 h-5" /><span>Profil</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
            className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-lg flex items-center gap-3 text-red-600"
          >
            <LogOut className="w-5 h-5" /><span>Déconnexion</span>
          </button>
        </div>
      )}

      {/* ===== MODALE PARAMÈTRES ===== */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Paramètres
              </h2>
              <button 
                onClick={closeSettings}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={tempSettings.nom || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, nom: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={tempSettings.email || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Votre email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={tempSettings.password || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Laissez vide pour conserver l'ancien</p>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.notifications || false}
                    onChange={(e) => setTempSettings({ ...tempSettings, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Thème</span>
                <select
                  value={tempSettings.theme || 'light'}
                  onChange={(e) => setTempSettings({ ...tempSettings, theme: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={closeSettings}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={saveSettings}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALE DE DEMANDE D'ANNULATION ===== */}
      {showCancelRequestModal && selectedCancelCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Demander l'annulation
              </h2>
              <button 
                onClick={closeCancelRequestModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-800">Cours à annuler</p>
                <p className="font-semibold">{selectedCancelCourse.matiere || selectedCancelCourse.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedCancelCourse.date?.toLocaleDateString('fr')} - {selectedCancelCourse.start}h à {selectedCancelCourse.end}h
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif d'annulation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelMotif}
                  onChange={(e) => setCancelMotif(e.target.value)}
                  placeholder="Veuillez expliquer la raison de l'annulation..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  rows="4"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Une demande sera envoyée à l'administrateur pour validation.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={closeCancelRequestModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSubmitCancelRequest}
                disabled={!cancelMotif.trim() || submitting}
                className={`px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 ${
                  !cancelMotif.trim() || submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Envoi...
                  </>
                ) : (
                  'Envoyer la demande'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          
          {/* ===== CALENDRIER ===== */}
          <div className="xl:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* En-tête */}
              <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg transition">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-3 font-semibold text-sm text-gray-800">{getMonthName(currentDate)}</span>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg transition">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button 
                    onClick={goToday} 
                    className="text-xs text-blue-600 font-medium hover:bg-blue-100 px-2 py-1 bg-blue-50 rounded-lg transition-colors"
                  >
                    Aujourd'hui
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={setWeekView}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    Semaine
                  </button>
                  <button 
                    onClick={setDayView}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    Jour
                  </button>
                  <button 
                    onClick={handleAddCourse}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm active:scale-95"
                    title="Ajouter un cours"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Jours */}
              <div className="grid grid-cols-6 border-b border-gray-200">
                <div className="p-2 bg-gray-50 w-16"></div>
                {viewMode === 'week' ? (
                  weekDays.map((day, index) => {
                    const dayDate = new Date(currentDate);
                    const dayOfWeek = dayDate.getDay();
                    const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
                    dayDate.setDate(dayDate.getDate() + mondayOffset + index);
                    const isToday = dayDate.toDateString() === new Date().toDateString();
                    return (
                      <div key={index} className={`p-2 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day}</p>
                        <p className={`text-base font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {dayDate.getDate()}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-5 p-2 text-center bg-blue-50">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {currentDate.toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                )}
              </div>

              {/* ===== GRILLE AVEC NOM DE LA MATIÈRE ===== */}
              <div ref={calendarRef} className="calendar-grid-container relative overflow-y-auto" style={{ maxHeight: '520px' }}>
                <div className="flex">
                  <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                    {hours.map((hour, index) => (
                      <div key={index} className="h-16 flex items-center justify-center text-[10px] text-gray-400 border-b border-gray-200 font-medium">
                        {hour}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`flex-1 grid ${viewMode === 'week' ? 'grid-cols-5' : 'grid-cols-1'} relative`}>
                    {Array.from({ length: hours.length * (viewMode === 'week' ? 5 : 1) }).map((_, index) => (
                      <div key={index} className={`h-16 border-r border-gray-200 border-b border-gray-200 ${Math.floor(index / hours.length) === 2 ? 'bg-blue-50/20' : ''}`} />
                    ))}
                    
                    {filteredCourses.map((course) => {
                      const isCancelled = course.statut === 'Annule';
                      const color = course.color || courseColors[0];
                      const matiereName = course.matiere || course.name || 'Cours';
                      
                      return (
                        <div 
                          key={course.id}
                          className={`absolute ${color.bg} border-l-4 p-1.5 rounded-md shadow-sm m-0.5 transition-all ${
                            isCancelled ? 'opacity-60 line-through' : 'hover:shadow-md cursor-pointer group'
                          }`}
                          style={{
                            top: `${getCoursePosition(course.start)}px`,
                            left: `${viewMode === 'week' ? (course.day || 0) * 20 : 0}%`,
                            width: viewMode === 'week' ? '19%' : '98%',
                            height: `${getCourseHeight(course.start, course.end)}px`,
                            minHeight: '35px',
                            borderLeftColor: color.hex || '#3B82F6',
                            backgroundColor: isCancelled ? '#fef2f2' : undefined,
                          }}
                          title={`${matiereName}\n${course.start}h - ${course.end}h\n${course.room}\n${course.niveau || ''}\n${course.enseignant || ''}`}
                        >
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-[11px] leading-tight truncate ${isCancelled ? 'text-gray-500' : color.text}`}>
                                  📖 {matiereName}
                                </p>
                                <p className={`text-[8px] opacity-75 ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                                  🕐 {course.start}h - {course.end}h
                                </p>
                                <p className="text-[7px] opacity-50 truncate text-gray-500">
                                  🏫 {course.room}
                                </p>
                                {course.niveau && (
                                  <p className="text-[7px] opacity-40 truncate text-gray-400">
                                    📚 {course.niveau}
                                  </p>
                                )}
                                {isCancelled && (
                                  <span className="text-[7px] text-red-500 font-bold">❌ ANNULÉ</span>
                                )}
                              </div>
                              {!isCancelled && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCancelRequestModal(course);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1 p-0.5 bg-red-500 hover:bg-red-600 rounded-full text-white"
                                  title="Demander l'annulation"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {course.enseignant && (
                              <div className="text-[6px] opacity-40 truncate text-gray-400 mt-0.5">
                                👨‍🏫 {course.enseignant}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PANEL LATÉRAL ===== */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Mini Calendrier */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-gray-700">{getMonthName(currentDate)}</span>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded transition">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded transition">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {days.map((day, i) => <div key={i} className="text-gray-400 font-medium py-1">{day}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="py-1"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                  const hasCourse = courses.some(c => c.date?.getDate() === day && c.date?.getMonth() === currentDate.getMonth());
                  return (
                    <div 
                      key={day} 
                      className={`py-1 rounded cursor-pointer transition ${isToday ? 'bg-blue-600 text-white font-bold' : hasCourse ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setDate(day);
                        setCurrentDate(newDate);
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cours Annulés */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Cours Annulés Récents
              </h3>
              {cancelledCourses.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cancelledCourses.map((course, index) => (
                    <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{course.matiere || course.name}</p>
                      <p className="text-xs text-gray-400">
                        {course.date?.toLocaleDateString('fr', { day: '2-digit', month: '2-digit' })} {course.start}h - {course.end}h
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded">ANNULÉ</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Aucun cours annulé</p>
              )}
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-800">{courses.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <CalendarDays className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{filteredCourses.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Semaine</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center col-span-2">
                  <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-500">{cancelledCourses.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Annulés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== BOUTON PDF ===== */}
      <button 
        onClick={exportToPDF} 
        disabled={isExporting}
        className={`fixed bottom-6 right-6 bg-blue-600 text-white flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 z-50 text-sm ${
          isExporting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Export...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span className="font-semibold">PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

export default EnseignantDashboard;