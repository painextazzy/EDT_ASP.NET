// src/utils/pdfGenerator.js
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Map des couleurs par type (pour le rendu du tableau)
const typeColorMap = {
  'Cours': 'course-blue',
  'TD': 'course-orange',
  'TP': 'course-purple',
  'Examen': 'course-red',
  'Soutenance': 'course-red',
  'Conférence': 'course-green',
  'Atelier': 'course-peach',
  'Réunion': 'course-light-blue',
  'Projet': 'course-gray',
};

export const generateTimetableHTML = (events, currentDate, enseignantNom, getColorForType) => {
  // 1. Jours de la semaine (lundi → vendredi)
  const jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
  const horaires = [];
  for (let h = 7; h < 18; h++) {
    horaires.push(`${h}h00-${h+1}h00`);
  }

  // 2. Grille 5 jours × 11 créneaux
  const grid = Array.from({ length: 5 }, () => Array(11).fill(null));

  events.forEach(evt => {
    const start = new Date(evt.start);
    const end = new Date(evt.end);
    if (isNaN(start) || isNaN(end)) return;

    const dayIndex = start.getDay() - 1; // 0=lundi, 4=vendredi
    if (dayIndex < 0 || dayIndex > 4) return;

    const startHour = start.getHours();
    const hourIndex = startHour - 7;
    if (hourIndex < 0 || hourIndex >= 11) return;

    const durationMs = end - start;
    let durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    if (durationHours < 1) durationHours = 1;
    if (hourIndex + durationHours > 11) durationHours = 11 - hourIndex;

    for (let i = 0; i < durationHours; i++) {
      if (grid[dayIndex][hourIndex + i] === null) {
        grid[dayIndex][hourIndex + i] = { event: evt, rowspan: durationHours };
        for (let j = 1; j < durationHours; j++) {
          grid[dayIndex][hourIndex + j] = 'occupied';
        }
        break;
      }
    }
  });

  // 3. Construction des lignes HTML
  let rowsHtml = '';
  for (let h = 0; h < horaires.length; h++) {
    rowsHtml += `<tr>`;
    rowsHtml += `<td class="time-col">${horaires[h]}</td>`;

    for (let d = 0; d < 5; d++) {
      const cell = grid[d][h];
      if (cell === null || cell === 'occupied') {
        rowsHtml += `<td></td>`;
        continue;
      }
      const { event, rowspan } = cell;
      const colorClass = typeColorMap[event.type] || 'course-gray';
      const prof = event.professeur || event.enseignant || '';
      const salle = event.salle || '';
      const title = event.title || 'Cours';
      rowsHtml += `
        <td class="${colorClass}" rowspan="${rowspan}">
          <div class="font-bold">${title}</div>
          ${prof ? `<div class="text-[10px]">${prof}</div>` : ''}
          ${salle ? `<div class="text-[9px]">📍 ${salle}</div>` : ''}
        </td>
      `;
    }
    rowsHtml += `</tr>`;
  }

  // 4. Métadonnées
  const currentYear = format(currentDate, 'yyyy');
  const nextYear = parseInt(currentYear) + 1;
  const anneeUniversitaire = `${currentYear}-${nextYear}`;
  const semaineDébut = startOfWeek(currentDate, { weekStartsOn: 1 });
  const semaineFin = endOfWeek(currentDate, { weekStartsOn: 1 });
  const semaineStr = `du ${format(semaineDébut, 'dd/MM')} au ${format(semaineFin, 'dd/MM/yyyy')}`;

  // 5. HTML complet
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Emploi du temps</title>
      <style>
        body { font-family: 'Inter', sans-serif; background: white; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: 700; }
        .title { text-align: center; font-size: 24px; font-weight: 900; text-decoration: underline double; margin-bottom: 20px; }
        .schedule-table { width: 100%; border-collapse: collapse; }
        .schedule-table th, .schedule-table td { border: 1px solid #d1d5db; padding: 6px; text-align: center; font-size: 0.75rem; }
        .time-col { background-color: #f9fafb; font-weight: 600; width: 100px; }
        .day-header { background-color: #f3f4f6; font-weight: 700; text-transform: uppercase; }
        .course-blue { background-color: #38bdf8; color: white; }
        .course-orange { background-color: #fbbf24; color: black; }
        .course-purple { background-color: #d8b4fe; color: black; }
        .course-green { background-color: #86efac; color: black; }
        .course-gray { background-color: #9ca3af; color: white; }
        .course-peach { background-color: #ffedd5; color: black; }
        .course-light-blue { background-color: #bae6fd; color: black; }
        .course-red { background-color: #f87171; color: white; }
        .footer { margin-top: 20px; display: flex; justify-content: flex-end; }
        .stamp { width: 80px; height: 80px; border: 2px dashed #f87171; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-12deg); opacity: 0.6; }
        .stamp span { font-size: 0.5rem; font-weight: 700; color: #dc2626; text-align: center; line-height: 1.2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>ENSEIGNANT : ${enseignantNom.toUpperCase()}</div>
          <div>ANNÉE UNIVERSITAIRE : ${anneeUniversitaire}</div>
        </div>
        <div class="title">EMPLOI DU TEMPS</div>
        <p style="text-align:center; font-size:0.8rem; color:#4b5563;">${semaineStr}</p>
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="time-col">HORAIRES</th>
              ${jours.map(j => `<th class="day-header">${j}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <div class="stamp"><span>UNIVERSITÉ<br/>ÉCOLE<br/>APPROUVÉ</span></div>
        </div>
      </div>
    </body>
    </html>
  `;
};