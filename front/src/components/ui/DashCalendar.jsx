// src/components/ui/DashCalendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

const DashCalendar = ({ 
  value, 
  onChange, 
  events = [],
  className = '',
  showOutsideDays = true,
  weekStartsOn = 1, // 0 = Dimanche, 1 = Lundi
}) => {
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const daysOfWeek = weekStartsOn === 0 
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Vérifier si une date a des événements
  const hasEvent = (date) => {
    return events.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Obtenir les jours du mois
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // Ajuster pour que la semaine commence le bon jour
    const startOffset = weekStartsOn === 0 ? startDayOfWeek : (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1);

    const days = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    // Jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    if (onChange) {
      onChange(today);
    }
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const dayName = selectedDate ? selectedDate.toLocaleDateString('fr-FR', { weekday: 'long' }) : '';
  const dayNumber = selectedDate ? selectedDate.getDate() : '';

  const days = getDaysInMonth(currentDate);

  // Couleurs pour les événements
  const eventColors = ['#3D5AFE', '#00C853', '#FFD600', '#FF6B6B', '#845EC2'];

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            {monthName}
          </h4>
          {selectedDate && (
            <p className="text-xs text-slate-400 mt-0.5">
              {dayName} {dayNumber}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-[10px] font-medium text-slate-400">
            {day}
          </span>
        ))}
      </div>

      {/* Jours du mois */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
        {days.map((item, index) => {
          const isTodayDate = isToday(item.date);
          const isSelectedDate = isSelected(item.date);
          const isCurrentMonth = item.isCurrentMonth;
          const hasEventOnDate = hasEvent(item.date);

          let className = "relative text-xs p-1.5 rounded-full transition-all duration-200 ";
          
          if (!isCurrentMonth && !showOutsideDays) {
            className += "text-slate-200 ";
          } else if (!isCurrentMonth) {
            className += "text-slate-300 ";
          }
          
          if (isTodayDate && isCurrentMonth) {
            className += "bg-blue-600 text-white font-semibold hover:bg-blue-700 ";
          } else if (isSelectedDate && isCurrentMonth && !isTodayDate) {
            className += "bg-blue-100 text-blue-600 font-semibold ";
          } else if (isCurrentMonth && !isTodayDate && !isSelectedDate) {
            className += "text-slate-700 hover:bg-slate-100 cursor-pointer ";
          }
          
          if (!isCurrentMonth || isTodayDate || isSelectedDate) {
            className += "cursor-default ";
          }

          return (
            <div
              key={index}
              className={className}
              onClick={() => {
                if (isCurrentMonth && !isTodayDate && !isSelectedDate) {
                  handleDateClick(item.date);
                }
              }}
            >
              {item.day}
              {/* Indicateur d'événement */}
              {hasEventOnDate && isCurrentMonth && (
                <Circle 
                  className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5"
                  style={{ 
                    fill: eventColors[index % eventColors.length],
                    color: eventColors[index % eventColors.length]
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-[10px] text-slate-500">Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-100" />
          <span className="text-[10px] text-slate-500">Sélectionné</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="text-[10px] text-slate-500">Autre mois</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-2 h-2 text-blue-500" />
          <span className="text-[10px] text-slate-500">Événement</span>
        </div>
      </div>
    </div>
  );
};

export default DashCalendar;