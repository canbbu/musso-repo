
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'scheduled' | 'cancelled';
}

interface UpcomingMatchesCardProps {
  upcomingMatches: UpcomingMatch[];
}

const UpcomingMatchesCard = ({ upcomingMatches }: UpcomingMatchesCardProps) => {
  const navigate = useNavigate();
  
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMatches.map((match) => (
                  <TableRow key={match.id} className={match.status === 'cancelled' ? 'bg-red-50' : ''}>
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
                  </TableRow>
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
