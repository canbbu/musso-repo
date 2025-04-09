
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronRight, AlertCircle, Users, ChevronDown, ChevronUp } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
                        <div className="flex justify-center gap-2 text-sm flex-wrap">
                          <span className="text-green-600">{match.attending}명</span>/
                          <span className="text-red-600">{match.notAttending}명</span>/
                          <span className="text-gray-600">{match.pending}명</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {match.status === 'cancelled' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            취소됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            예정됨
                          </span>
                        )}
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
                    
                    {isAdmin() && expandedMatch === match.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0 border-t-0">
                          <Collapsible open={expandedMatch === match.id}>
                            <CollapsibleContent className="p-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium flex items-center text-green-600 mb-2">
                                    <Users className="h-4 w-4 mr-1" /> 참석자 ({match.attending}명)
                                  </h4>
                                  {match.attendingPlayers && match.attendingPlayers.length > 0 ? (
                                    <ul className="text-sm pl-6 list-disc">
                                      {match.attendingPlayers.map(player => (
                                        <li key={player.id}>{player.name}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500 pl-6">참석자가 없습니다.</p>
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium flex items-center text-red-600 mb-2">
                                    <Users className="h-4 w-4 mr-1" /> 불참자 ({match.notAttending}명)
                                  </h4>
                                  {match.notAttendingPlayers && match.notAttendingPlayers.length > 0 ? (
                                    <ul className="text-sm pl-6 list-disc">
                                      {match.notAttendingPlayers.map(player => (
                                        <li key={player.id}>{player.name}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500 pl-6">불참자가 없습니다.</p>
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium flex items-center text-gray-600 mb-2">
                                    <Users className="h-4 w-4 mr-1" /> 미정 ({match.pending}명)
                                  </h4>
                                  {match.pendingPlayers && match.pendingPlayers.length > 0 ? (
                                    <ul className="text-sm pl-6 list-disc">
                                      {match.pendingPlayers.map(player => (
                                        <li key={player.id}>{player.name}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500 pl-6">미정인 회원이 없습니다.</p>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
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
          <div className="text-center py-6">
            <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-gray-500">예정된 경기가 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCard;
