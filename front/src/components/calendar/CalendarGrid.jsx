// src/components/Calendar/CalendarGrid.jsx
import React, { useState, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuration du localizer pour react-big-calendar
const locales = {
  'fr': frLocale,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarGrid = ({ events, setEvents, currentDate, setCurrentDate, view, setView, onCancelEvent }) => {
  const calendarRef = useRef(null);

  // Export PDF
  const exportToPDF = async () => {
    const calendarElement = document.querySelector('.rbc-calendar');
    if (!calendarElement) return;

    const originalOverflow = calendarElement.style.overflow;
    calendarElement.style.overflow = 'visible';
    
    try {
      const canvas = await html2canvas(calendarElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`calendrier_${format(currentDate, 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Une erreur est survenue lors de l\'export PDF');
    } finally {
      calendarElement.style.overflow = originalOverflow;
    }
  };

  // Composant personnalisé pour l'événement
  const EventComponent = ({ event }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getEventStyle = () => {
      if (event.status === 'cancelled') {
        return {
          backgroundColor: '#fef2f2',
          borderLeft: `3px solid #f87171`,
          color: '#991b1b',
          textDecoration: 'line-through',
          opacity: 0.7,
        };
      }
      return {
        backgroundColor: `${event.color}15`,
        borderLeft: `3px solid ${event.color}`,
        color: '#1f2937',
      };
    };

    return (
      <div
        className="rbc-event-content"
        style={{ ...getEventStyle(), borderRadius: '4px', padding: '2px 4px', height: '100%', position: 'relative' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10px', paddingRight: '14px' }}>{event.title}</div>
          <div style={{ fontSize: '8px', opacity: 0.7 }}>
            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
          </div>
        </div>
        {event.status === 'active' && isHovered && (
          <button
            onClick={(e) => onCancelEvent(event, e)}
            style={{
              position: 'absolute',
              top: '0px',
              right: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>close</span>
          </button>
        )}
        {event.status === 'cancelled' && (
          <span style={{ position: 'absolute', top: '0px', right: '2px', fontSize: '8px', color: '#f87171' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>cancel</span>
          </span>
        )}
      </div>
    );
  };

  const eventPropGetter = (event) => {
    let style = {
      borderRadius: '4px',
      fontSize: '10px',
      padding: '0px',
      fontWeight: '500',
      transition: 'all 0.2s',
      cursor: 'pointer',
    };

    if (event.status === 'cancelled') {
      style = {
        ...style,
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        opacity: 0.7,
      };
    } else {
      style = {
        ...style,
        backgroundColor: `${event.color}15`,
        border: `1px solid ${event.color}`,
      };
    }

    return { style };
  };

  const components = {
    event: EventComponent,
  };

  const formats = {
    timeGutterFormat: (date, culture, localizer) => {
      return localizer.format(date, 'HH:mm', culture);
    },
    eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
      return `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`;
    },
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: '<',
    next: '>',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Cours',
    showMore: (total) => `+ ${total} autres`,
    noEventsInRange: 'Aucun cours sur cette période',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-3 pt-0 relative">
      <div ref={calendarRef} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 140px)', minHeight: '450px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={setCurrentDate}
          view={view}
          onView={setView}
          formats={formats}
          messages={messages}
          eventPropGetter={eventPropGetter}
          components={components}
          defaultView="week"
          views={['week', 'day']}
          step={30}
          timeslots={2}
          min={new Date(2026, 4, 25, 7, 0)}
          max={new Date(2026, 4, 25, 18, 0)}
          culture="fr"
          className="h-full"
        />
      </div>
      
      {/* Bouton flottant Export PDF dans le calendrier */}
      <button
        onClick={exportToPDF}
        className="absolute bottom-6 right-6 z-20 bg-white hover:bg-gray-50 text-sky-600 font-medium py-2.5 px-5 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 flex items-center gap-2 hover:shadow-xl text-sm"
      >
        <span className="material-symbols-outlined text-sky-500 text-base">picture_as_pdf</span>
        Export PDF
      </button>
    </div>
  );
};

export default CalendarGrid;