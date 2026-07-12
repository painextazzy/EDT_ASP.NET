import React from 'react';
import { History, CalendarX2, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TeacherHistoryPanel = ({ cancelledEvents = [] }) => {
  if (!cancelledEvents.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        <div className="flex items-center gap-2 mb-2 text-slate-600">
          <History className="w-4 h-4" />
          Historique des cours annulés
        </div>
        <p>Aucun cours annulé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
        <History className="w-4 h-4" />
        Historique des cours annulés
      </div>
      <div className="space-y-3">
        {cancelledEvents.map((event) => (
          <div key={event.id} className="rounded-xl border border-rose-100 bg-rose-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{event.title}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <CalendarX2 className="w-3.5 h-3.5" />
                  {format(new Date(event.start), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-rose-100 text-rose-700">Annulé</span>
            </div>
            <div className="text-xs text-slate-600 mt-2 flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" />
              {format(new Date(event.start), 'HH:mm', { locale: fr })} - {format(new Date(event.end), 'HH:mm', { locale: fr })}
            </div>
            {event.reason && (
              <p className="text-xs text-slate-600 mt-2"><span className="font-medium">Motif :</span> {event.reason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherHistoryPanel;
