
import React from 'react';
import { CollapsibleContent } from "@/components/ui/collapsible";
import MatchPlayersList from './MatchPlayersList';

interface Player {
  id: string;
  name: string;
}

interface MatchAttendanceDetailsProps {
  isOpen: boolean;
  attending?: number;
  notAttending?: number;
  pending?: number;
  attendingPlayers?: Player[];
  notAttendingPlayers?: Player[];
  pendingPlayers?: Player[];
}

const MatchAttendanceDetails = ({ 
  isOpen,
  attending = 0,
  notAttending = 0,
  pending = 0,
  attendingPlayers,
  notAttendingPlayers,
  pendingPlayers
}: MatchAttendanceDetailsProps) => {
  if (!isOpen) return null;
  
  return (
    <CollapsibleContent className="p-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MatchPlayersList 
          title="참석자" 
          count={attending} 
          players={attendingPlayers} 
          textColor="text-green-600" 
        />
        
        <MatchPlayersList 
          title="불참자" 
          count={notAttending} 
          players={notAttendingPlayers} 
          textColor="text-red-600" 
        />
      </div>
    </CollapsibleContent>
  );
};

export default MatchAttendanceDetails;
