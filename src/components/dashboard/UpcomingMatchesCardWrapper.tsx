import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, Check, X, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Match, useMatchData } from '@/hooks/use-match-data';
import UpcomingMatchCard from '@/components/match/UpcomingMatchCard';
import AttendanceListModal from '@/components/match/AttendanceListModal';
import { formatKoreanDate } from '@/utils/date-helpers';

interface UpcomingMatchesCardWrapperProps {
  upcomingMatches: Match[];
}

const UpcomingMatchesCardWrapper = ({ upcomingMatches }: UpcomingMatchesCardWrapperProps) => {
  const { canManageMatches, canManageAnnouncements, userId } = useAuth();
  const { handleAttendanceChange } = useMatchData();
  const navigate = useNavigate();
  
  // 현재 표시 중인 모달의 경기 ID를 관리
  const [viewingMatchId, setViewingMatchId] = useState<number | null>(null);
  
  // 모달 열기 함수
  const openAttendanceModal = (matchId: number) => {
    setViewingMatchId(matchId);
  };
  
  // 모달 닫기 함수 
  const closeAttendanceModal = () => {
    setViewingMatchId(null);
  };
  
  // 날짜 형식 함수 간소화 - 통합 유틸리티 사용
  const formatMatchDate = (dateString: string) => {
    return formatKoreanDate(dateString);
  };
  
  // Only coaches can manage matches directly
  const canManage = canManageMatches();
  
  // Only presidents and vice presidents can manage announcements (which includes upcoming matches)
  const canSchedule = canManageAnnouncements();
  
  // 현재 표시할 경기 정보 찾기
  const currentlyViewingMatch = upcomingMatches.find(m => m.id === viewingMatchId);
  
  // 공통 날짜 형식 함수 사용
  const formattedDate = currentlyViewingMatch ? formatKoreanDate(currentlyViewingMatch.date) : '';
  
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingMatches
          .filter(match => match.status !== "cancelled")
          .map((match) => (
            <div key={match.id} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold mb-1"> {match.opponent}</h3>
                  <p className="text-gray-600 mb-1">
                    {formatMatchDate(match.date)}
                  </p>
                  <p className="text-gray-600 mb-3">{match.location}</p>
                  
                  <div className="flex gap-4 text-sm">
                   <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full mr-1">
                        <Check size={12} />
                      </span>
                      <span>참석: {match.attendance.attending}명</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full mr-1">
                        <X size={12} />
                      </span>
                      <span>불참: {match.attendance.notAttending}명</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => openAttendanceModal(match.id)}
                  >
                    <Eye size={18} className="mr-1" />
                    참가 현황 보기
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
        
        {/* 참석자 목록 모달 */}
        {currentlyViewingMatch && (
          <AttendanceListModal 
            isOpen={viewingMatchId !== null}
            onClose={closeAttendanceModal}
            matchId={currentlyViewingMatch.id}
            matchInfo={{
              date: currentlyViewingMatch.date,
              opponent: currentlyViewingMatch.opponent,
              location: currentlyViewingMatch.location
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCardWrapper;
