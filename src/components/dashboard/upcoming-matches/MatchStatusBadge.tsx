
import React from 'react';

interface MatchStatusBadgeProps {
  status?: 'scheduled' | 'cancelled';
}

const MatchStatusBadge = ({ status }: MatchStatusBadgeProps) => {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        취소됨
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      예정됨
    </span>
  );
};

export default MatchStatusBadge;
