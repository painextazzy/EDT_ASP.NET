// src/pages/PlanningPage.jsx
import React from 'react';
import BigCalendar from '../components/calendar/BigCalendar';

const PlanningPage = () => {
  return (
    <div className="h-screen p-6 bg-gray-50">
      <BigCalendar />
    </div>
  );
};

export default PlanningPage;