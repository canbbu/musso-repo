
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Match } from '@/hooks/use-match-data';
import UpcomingMatchesCard from './upcoming-matches/UpcomingMatchesCard';

interface UpcomingMatchesCardWrapperProps {
  upcomingMatches: Match[];
}

const UpcomingMatchesCardWrapper = ({ upcomingMatches }: UpcomingMatchesCardWrapperProps) => {
  const { canManageMatches, canManageAnnouncements } = useAuth();
  const navigate = useNavigate();
  
  // Only coaches can manage matches directly
  const canManage = canManageMatches();
  
  // Only presidents and vice presidents can manage announcements (which includes scheduled matches)
  const canSchedule = canManageAnnouncements();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            다가오는 경기
          </CardTitle>
          
          {/* Only show management buttons to authorized users */}
          <div className="flex gap-2">
            {canManage && (
              <Button size="sm" onClick={() => navigate('/matches')}>
                경기 관리
              </Button>
            )}
            
            {canSchedule && (
              <Button variant="outline" size="sm" onClick={() => navigate('/announcement-management')}>
                <Plus className="h-4 w-4 mr-1" />
                새 경기 등록
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UpcomingMatchesCard upcomingMatches={upcomingMatches} />
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCardWrapper;
