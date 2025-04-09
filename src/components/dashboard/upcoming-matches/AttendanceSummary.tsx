
import React from 'react';

interface AttendanceSummaryProps {
  attending?: number;
  notAttending?: number;
  pending?: number;
}

const AttendanceSummary = ({ attending = 0, notAttending = 0, pending = 0 }: AttendanceSummaryProps) => {
  return (
    <div className="flex justify-center gap-2 text-sm flex-wrap">
      <span className="text-green-600">{attending}명</span>/
      <span className="text-red-600">{notAttending}명</span>/
      <span className="text-gray-600">{pending}명</span>
    </div>
  );
};

export default AttendanceSummary;
