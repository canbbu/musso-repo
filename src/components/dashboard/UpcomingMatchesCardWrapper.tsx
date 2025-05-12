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
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UpcomingMatchesCardWrapperProps {
  upcomingMatches: Match[];
}

// 날짜 문자열에서 YYYY-MM-DD 부분만 추출하는 함수
function extractDatePart(dateString: string): string {
  if (!dateString) return '';
  
  // 'YYYY-MM-DD' 패턴 추출 (하이픈으로 구분된 첫 3부분만)
  const match = dateString.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0];
  }
  
  // 정규식으로 매치되지 않으면 첫 10글자 시도
  if (dateString.length >= 10) {
    return dateString.substring(0, 10);
  }
  
  console.warn("날짜 포맷 변환 실패:", dateString);
  return dateString;
}

function getAttendanceDeadline(matchDate: string) {
  try {
    // 날짜가 유효한지 확인
    if (!matchDate) {
      console.warn("유효하지 않은 이벤트 날짜:", matchDate);
      return new Date(); // 기본값으로 현재 날짜 사용
    }
    
    // YYYY-MM-DD 부분만 추출
    const cleanDateString = extractDatePart(matchDate);
    console.log("정제된 날짜 문자열:", matchDate, "->", cleanDateString);
    
    const eventDate = new Date(cleanDateString);
    
    // 유효한 날짜인지 확인 (Invalid Date 체크)
    if (isNaN(eventDate.getTime())) {
      console.warn("잘못된 날짜 형식:", matchDate, "->", cleanDateString);
      return new Date();
    }
    
    const deadline = subDays(eventDate, 4);
    deadline.setHours(23, 59, 0, 0);
    console.log("이벤트 날짜:", cleanDateString, "계산된 마감일:", deadline);
    return deadline;
  } catch (error) {
    console.error("마감일 계산 중 오류:", error);
    return new Date(); // 오류 발생 시 현재 날짜 반환
  }
}

function formatDeadline(deadline: Date) {
  try {
    // 유효한 날짜인지 확인
    if (!deadline || isNaN(deadline.getTime())) {
      console.warn("유효하지 않은 마감일:", deadline);
      return "날짜 정보 없음";
    }
    
    const formatted = format(deadline, "M월 d일(E) HH:mm", { locale: ko });
    console.log("마감일 포맷팅:", deadline, "->", formatted);
    return formatted;
  } catch (error) {
    console.error("마감일 포맷팅 중 오류:", error);
    return "날짜 정보 없음";
  }
}

const UpcomingMatchesCardWrapper = ({ upcomingMatches }: UpcomingMatchesCardWrapperProps) => {
  const { canManageMatches, canManageAnnouncements, userId } = useAuth();
  const { handleAttendanceChange } = useMatchData();
  const navigate = useNavigate();
  
  // 현재 표시 중인 모달의 이벤트 ID를 관리
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
  
  // 현재 표시할 이벤트 정보 찾기
  const currentlyViewingMatch = upcomingMatches.find(m => m.id === viewingMatchId);
  
  // 공통 날짜 형식 함수 사용
  const formattedDate = currentlyViewingMatch ? formatKoreanDate(currentlyViewingMatch.date) : '';
  
  const now = new Date();
  const deadline = getAttendanceDeadline(currentlyViewingMatch?.date || '');
  const isDeadlinePassed = now > deadline;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            다가오는 이벤트
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
          .map((match) => {
            // 날짜 유효성 검사
            let matchDeadline: Date;
            let isMatchDeadlinePassed = false;
            
            try {
              if (match.date) {
                matchDeadline = getAttendanceDeadline(match.date);
                isMatchDeadlinePassed = now > matchDeadline;
              } else {
                console.warn("이벤트 날짜 정보 없음:", match);
                matchDeadline = new Date();
              }
            } catch (error) {
              console.error("마감일 처리 중 오류:", error);
              matchDeadline = new Date();
            }
            
            console.log("이벤트:", match.opponent, "날짜:", match.date, "마감일:", matchDeadline, "마감여부:", isMatchDeadlinePassed);
            
            return (
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
                    disabled={isMatchDeadlinePassed}
                  >
                    <Eye size={18} className="mr-1" />
                    {isMatchDeadlinePassed ? "참가 현황 보기" : "참가 현황 보기"}
                  </Button>
                  <div className={`text-xs mt-2 px-2 py-1 border rounded ${isMatchDeadlinePassed ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200'}`}>
                    참석여부 마감: {match.date ? formatDeadline(matchDeadline) : "날짜 정보 없음"}
                    {isMatchDeadlinePassed && ' (마감됨)'}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
          
          {upcomingMatches.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">예정된 이벤트가 없습니다.</p>
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
