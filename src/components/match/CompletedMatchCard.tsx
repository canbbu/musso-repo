
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChartBar, Clipboard, ChevronDown, ChevronUp } from "lucide-react";
import { Match } from '@/hooks/use-match-data';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompletedMatchCardProps {
  match: Match;
}

const CompletedMatchCard = ({ match }: CompletedMatchCardProps) => {
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleManageMatch = () => {
    navigate(`/matches?tab=stats&matchId=${match.id}`);
  };

  // 가상의 경기 상세 데이터
  const playerStats = [
    { id: 1, name: '김선수', attended: true, goals: 1, assists: 0, rating: 8.5, notes: '좋은 활약' },
    { id: 2, name: '이공격수', attended: true, goals: 1, assists: 1, rating: 9.0, notes: '맨 오브 더 매치' },
    { id: 3, name: '박수비', attended: true, goals: 0, assists: 0, rating: 7.5, notes: '안정적인 수비' },
    { id: 4, name: '정미드필더', attended: false, goals: 0, assists: 0, rating: 0, notes: '불참' },
    { id: 5, name: '최골키퍼', attended: true, goals: 0, assists: 0, rating: 8.0, notes: '선방 여러차례' },
  ];

  return (
    <Card className={`border-l-4 ${match.result === 'win' ? 'border-l-green-500' : match.result === 'loss' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="match-info mb-4 md:mb-0">
            <div className="flex items-center mb-1">
              <h3 className="text-xl font-semibold">vs {match.opponent}</h3>
              <span className={`ml-3 px-2 py-1 ${
                match.result === 'win' 
                  ? 'bg-green-100 text-green-800' 
                  : match.result === 'loss' 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              } text-sm rounded-full`}>
                {match.result === 'win' ? '승리' : match.result === 'loss' ? '패배' : '무승부'} {match.score}
              </span>
            </div>
            <p className="text-gray-600 mb-1">
              {new Date(match.date).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-gray-600">{match.location}</p>
            
            <div className="flex gap-4 text-sm mt-2">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full mr-1">
                  <Check size={12} />
                </span>
                <span>참석: {match.attendance.attending}명</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              등록자: {match.createdBy}
              {match.updatedBy && (
                <span> | 최종 수정: {match.updatedBy} ({match.updatedAt})</span>
              )}
            </div>
          </div>
          <div className="match-actions flex flex-col gap-2">
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setIsOpen(true)}
            >
              <ChartBar className="mr-2 h-4 w-4" />
              경기 결과 보기
            </Button>
            
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center w-full">
                  {showDetails ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      접기
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      상세보기
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <p><strong>경기 메모:</strong> {match.notes || '경기 메모가 없습니다.'}</p>
                  <p><strong>MVP:</strong> {match.mvp || '선정되지 않음'}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {canManagePlayerStats() && (
              <Button 
                className="flex items-center justify-center" 
                onClick={handleManageMatch}
              >
                <Clipboard size={18} className="mr-1" />
                경기 관리
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>경기 결과 상세</DialogTitle>
            <DialogDescription>
              {new Date(match.date).toLocaleDateString('ko-KR')} vs {match.opponent} ({match.result === 'win' ? '승리' : match.result === 'loss' ? '패배' : '무승부'} {match.score})
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">선수 기록</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>선수명</TableHead>
                    <TableHead className="text-center">출석</TableHead>
                    <TableHead className="text-center">득점</TableHead>
                    <TableHead className="text-center">어시스트</TableHead>
                    <TableHead className="text-center">평점</TableHead>
                    <TableHead>비고</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell className="text-center">
                        {player.attended ? 
                          <Check size={16} className="mx-auto text-green-500" /> : 
                          <span className="text-red-500">X</span>
                        }
                      </TableCell>
                      <TableCell className="text-center">{player.attended ? player.goals : '-'}</TableCell>
                      <TableCell className="text-center">{player.attended ? player.assists : '-'}</TableCell>
                      <TableCell className="text-center">{player.attended ? player.rating : '-'}</TableCell>
                      <TableCell>{player.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-semibold mb-2">종합 평가</h4>
            <p className="text-gray-700">{match.review || '기록된 평가가 없습니다.'}</p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CompletedMatchCard;
