
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Collapsible } from "@/components/ui/collapsible";
import MatchAttendanceDetails from './MatchAttendanceDetails';
import MatchStatusBadge from './MatchStatusBadge';
import AttendanceSummary from './AttendanceSummary';
import NoUpcomingMatches from './NoUpcomingMatches';

interface Player {
  id: string;
  name: string;
}

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'scheduled' | 'cancelled';
  attendingPlayers?: Player[];
  notAttendingPlayers?: Player[];
  pendingPlayers?: Player[];
}

interface UpcomingMatchesCardProps {
  upcomingMatches: UpcomingMatch[];
}

const UpcomingMatchesCard = ({ upcomingMatches }: UpcomingMatchesCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  
  const toggleExpand = (matchId: number) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };
  
  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-green-600" />
            다가오는 경기
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/matches')}
            className="whitespace-nowrap"
          >
            더 보기
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>상대팀</TableHead>
                  <TableHead className="hidden sm:table-cell">장소</TableHead>
                  <TableHead className="text-center">참석/불참/미정</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  {isAdmin() && <TableHead className="text-center">상세보기</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMatches.map((match) => (
                  <React.Fragment key={match.id}>
                    <TableRow className={match.status === 'cancelled' ? 'bg-red-50' : ''}>
                      <TableCell>
                        {new Date(match.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className={`font-medium ${match.status === 'cancelled' ? 'line-through text-red-500' : ''}`}>
                        {match.opponent}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{match.location}</TableCell>
                      <TableCell className="text-center">
                        <AttendanceSummary
                          attending={match.attending}
                          notAttending={match.notAttending}
                          pending={match.pending}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <MatchStatusBadge status={match.status} />
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleExpand(match.id)}
                            className="p-0 h-8 w-8"
                          >
                            {expandedMatch === match.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                    
                    {isAdmin() && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0 border-t-0">
                          <Collapsible open={expandedMatch === match.id}>
                            <MatchAttendanceDetails
                              isOpen={expandedMatch === match.id}
                              attending={match.attending}
                              notAttending={match.notAttending}
                              pending={match.pending}
                              attendingPlayers={match.attendingPlayers}
                              notAttendingPlayers={match.notAttendingPlayers}
                              pendingPlayers={match.pendingPlayers}
                            />
                          </Collapsible>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <NoUpcomingMatches />
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCard;
