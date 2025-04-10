import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Match } from '@/hooks/use-match-data';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface UpcomingMatchesCardProps {
  upcomingMatches: Match[];
}

const UpcomingMatchesCard = ({ upcomingMatches }: UpcomingMatchesCardProps) => {
  const navigate = useNavigate();
  
  const formatMatchDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'M월 d일 (EEE) HH:mm', { locale: ko });
  };

  return (
    <>
      {upcomingMatches.length > 0 ? (
        <div className="space-y-4">
          {upcomingMatches.map((match) => (
            <div key={match.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{match.opponent}</h3>
                  <p className="text-gray-600">{formatMatchDate(match.date)}</p>
                  <p className="text-gray-600">{match.location}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={match.status === 'upcoming' ? 'outline' : 'default'}>
                    {match.status === 'upcoming' ? '예정됨' : '완료'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/matches?id=${match.id}`)}
                  >
                    상세 보기
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span className="font-medium">참석:</span> {match.attendees?.length || 0}명
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span className="font-medium">불참:</span> {match.absentees?.length || 0}명
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span className="font-medium">미정:</span> {match.undecided?.length || 0}명
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">예정된 경기가 없습니다.</p>
        </div>
      )}
    </>
  );
};

export default UpcomingMatchesCard;
