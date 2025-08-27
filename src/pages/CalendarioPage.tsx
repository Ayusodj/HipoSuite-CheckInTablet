import React from 'react';

const CalendarioPage: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
      <iframe
        src="https://calendar.google.com/calendar/embed?src=es.spanish%23holiday%40group.v.calendar.google.com&ctz=Europe%2FMadrid"
        title="Calendario de Google"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

export default CalendarioPage;
