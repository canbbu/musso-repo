
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Match, useMatchData } from '@/hooks/use-match-data';
import UpcomingMatchCard from './UpcomingMatchCard';

interface UpcomingMatchesCardWrapperProps {
  upcomingMatches: Match[];
}

const UpcomingMatchesCardWrapper = ({ upcomingMatches }: UpcomingMatchesCardWrapperProps) => {
  const { canManageMatches, canManageAnnouncements } = useAuth();
  const { handleAttendanceChange } = useMatchData();
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
        <div className="space-y-4">
          {upcomingMatches.map((match) => (
            <div key={match.id} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold mb-1">vs {match.opponent}</h3>
                  <p className="text-gray-600 mb-1">
                    {new Date(match.date).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-600 mb-3">{match.location}</p>
                  
                  <div className="flex gap-4 text-sm">
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <span className="font-medium">참석:</span> {match.attendance.attending}명
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <span className="font-medium">불참:</span> {match.attendance.notAttending}명
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <span className="font-medium">미정:</span> {match.attendance.pending}명
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button 
                      variant={match.userResponse === 'attending' ? 'default' : 'secondary'} 
                      className={`flex items-center justify-center ${
                        match.userResponse === 'attending' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : ''
                      }`}
                      onClick={() => handleAttendanceChange(match.id, 'attending')}
                    >
                      참석
                    </Button>
                    <Button 
                      variant={match.userResponse === 'notAttending' ? 'destructive' : 'secondary'} 
                      className="flex items-center justify-center"
                      onClick={() => handleAttendanceChange(match.id, 'notAttending')}
                    >
                      불참
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/matches?id=${match.id}`)}
                  >
                    상세보기
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {upcomingMatches.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">예정된 경기가 없습니다.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCardWrapper;
