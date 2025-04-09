
import React from 'react';
import { AlertCircle } from 'lucide-react';

const NoUpcomingMatches = () => {
  return (
    <div className="text-center py-6">
      <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
      <p className="text-gray-500">예정된 경기가 없습니다.</p>
    </div>
  );
};

export default NoUpcomingMatches;
