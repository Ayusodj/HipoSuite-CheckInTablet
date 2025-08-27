import React from 'react';

const ReviewProPage: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
      <iframe
        src="https://app.reviewpro.com/login"
        title="ReviewPro"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

export default ReviewProPage;
