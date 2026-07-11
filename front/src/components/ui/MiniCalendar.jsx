// src/components/calendar/MiniCalendar.jsx
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({ 
  selectedDate, 
  onDateChange, 
  markedDates = [],
  compact = false 
}) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = compact ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    onDateChange(newDate);
  };

  const isMarked = (date) => {
    return markedDates.some(marked => isSameDay(marked, date));
  };

  return (
    <div className={`bg-white rounded-xl ${compact ? 'p-2' : 'p-4'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>

        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className={`rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center ${compact ? 'h-6 w-6' : 'h-7 w-7'}`}>
            <ChevronLeft className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>
          <button onClick={handleNextMonth} className={`rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center ${compact ? 'h-6 w-6' : 'h-7 w-7'}`}>
            <ChevronRight className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'} ${compact ? 'mb-1' : 'mb-2'}`}>
        {weekDays.map((day, idx) => (
          <div key={idx} className={`text-center font-medium text-gray-500 ${compact ? 'text-[8px]' : 'text-[10px]'} py-1`}>
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'}`}>
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = isSameDay(day, selectedDate);
          const isMarkedDay = isMarked(day);
          
          return (
            <button
              key={idx}
              onClick={() => {
                if (isCurrentMonth) {
                  onDateChange(day);
                }
              }}
              className={`
                rounded-full transition-all flex items-center justify-center
                ${compact ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-sm'}
                ${!isCurrentMonth && 'text-gray-300'}
                ${isSelected && 'bg-blue-500 text-white shadow-sm'}
                ${isMarkedDay && !isSelected && 'bg-blue-100 text-blue-600 font-medium'}
                ${isCurrentMonth && !isSelected && !isMarkedDay && 'hover:bg-gray-100'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;