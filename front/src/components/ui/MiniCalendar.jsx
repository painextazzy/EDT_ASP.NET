// src/components/ui/MiniCalendar.jsx
import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({
  currentDate = new Date(),
  onDateChange,
  selectedDate = new Date(),
  compact = true,
}) => {
  const [displayMonth, setDisplayMonth] = useState(currentDate);

  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const handlePrev = () => setDisplayMonth(subMonths(displayMonth, 1));
  const handleNext = () => setDisplayMonth(addMonths(displayMonth, 1));

  const handleDateClick = (date) => {
    if (onDateChange) onDateChange(date);
  };

  const isSelected = (date) => isSameDay(date, selectedDate);
  const isToday = (date) => isSameDay(date, new Date());

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">
            {format(displayMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <div className="flex gap-1">
            <button onClick={handlePrev} className="p-1 text-slate-400 hover:bg-slate-50 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNext} className="p-1 text-slate-400 hover:bg-slate-50 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {weekDays.map((d, i) => (
          <div key={i} className="font-bold text-slate-400">{d}</div>
        ))}
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, displayMonth);
          const selected = isSelected(day);
          const today = isToday(day);
          return (
            <button
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`
                w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-colors
                ${!isCurrentMonth && 'text-slate-300'}
                ${selected ? 'bg-blue-500 text-white shadow-sm' : ''}
                ${!selected && today ? 'bg-blue-100 text-blue-600' : ''}
                ${!selected && !today && isCurrentMonth ? 'hover:bg-slate-100' : ''}
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