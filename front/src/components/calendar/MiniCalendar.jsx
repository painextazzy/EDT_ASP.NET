// src/components/calendar/MiniCalendar.jsx
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MiniCalendar = ({ selectedDate, onDateChange, markedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);

  React.useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1));
    setCurrentMonth(newMonth);
  };

  const isMarked = (date) => {
    return markedDates.some(marked => isSameDay(marked, date));
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isMarkedDay = isMarked(day);
          
          return (
            <button
              key={idx}
              onClick={() => {
                if (isCurrentMonth) {
                  setCurrentMonth(day);
                  onDateChange(day);
                }
              }}
              className={`
                h-8 w-8 text-sm rounded-full transition-all flex items-center justify-center
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