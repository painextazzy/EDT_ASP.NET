// src/components/TimetablePreview.jsx
import React, { useRef, useEffect } from 'react';
import { generateTimetableHTML } from '../utils/pdfGenerator';

const TimetablePreview = ({ events, currentDate, enseignantNom, getColorForType }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const html = generateTimetableHTML(events, currentDate, enseignantNom, getColorForType);
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [events, currentDate, enseignantNom, getColorForType]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      style={{ minHeight: '500px' }}
      title="Aperçu de l'emploi du temps"
    />
  );
};

export default TimetablePreview;