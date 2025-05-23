import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clipboard, Eye, Edit, Trash } from "lucide-react";
import { Match } from '@/hooks/use-match-data';
import { useToast } from '@/hooks/use-toast';
import AttendanceListModal from './AttendanceListModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { formatKoreanDate } from '@/utils/date-helpers';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  
  return dateString;
}

function getAttendanceDeadline(matchDate: string) {
  try {
    // 날짜가 유효한지 확인
    if (!matchDate) {
      return new Date(); // 기본값으로 현재 날짜 사용
    }
    
    // YYYY-MM-DD 부분만 추출
    const cleanDateString = extractDatePart(matchDate);
    
    const eventDate = new Date(cleanDateString);
    
    // 유효한 날짜인지 확인 (Invalid Date 체크)
    if (isNaN(eventDate.getTime())) {
      return new Date();
    }
    
    const deadline = subDays(eventDate, 4);
    deadline.setHours(23, 59, 0, 0);
    return deadline;
  } catch (error) {
    return new Date(); // 오류 발생 시 현재 날짜 반환
  }
}

function formatDeadline(deadline: Date) {
  try {
    // 유효한 날짜인지 확인
    if (!deadline || isNaN(deadline.getTime())) {
      return "날짜 정보 없음";
    }
    
    return format(deadline, "M월 d일(E) HH:mm", { locale: ko });
  } catch (error) {
    return "날짜 정보 없음";
  }
}

interface UpcomingMatchCardProps {
  match: Match;
  onAttendanceChange: (matchId: number, response: 'attending' | 'notAttending') => void;
  canManageAnnouncements: boolean;
  onViewMatch: (matchId: number) => void;
  onEditClick?: (matchId: number) => void;
  onDeleteClick?: (matchId: number) => void;
}

const UpcomingMatchCard = ({ 
  match, 
  onAttendanceChange, 
  canManageAnnouncements, 
  onViewMatch,
  onEditClick,
  onDeleteClick
}: UpcomingMatchCardProps) => {
  const { toast } = useToast();
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const navigate = useNavigate();
  const { canManagePlayerStats} = useAuth();
  
  // 참석 마감일 계산
  const now = new Date();
  const matchDeadline = getAttendanceDeadline(match.date);
  const isDeadlinePassed = now > matchDeadline;
  
  const handleManageMatch = (matchId: number) => {
    
    if (!canManagePlayerStats()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "이벤트 관리는 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/stats-management?matchId=${matchId}`);
  };

  
  return (
    <Card key={match.id} className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="match-info mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-1"> {match.opponent}</h3>
            <p className="text-gray-600 mb-1">
              {formatKoreanDate(match.date)}
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
            
            <div className="text-xs text-gray-500 mt-2">
              등록자: {match.created_by}
              {match.updated_by && (
                <span> | 최종 수정: {match.updated_by}</span>
              )}
            </div>
          </div>
          <div className="match-actions flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                variant={match.userResponse === 'attending' ? 'default' : 'secondary'} 
                className={`flex-1 flex items-center justify-center ${
                  match.userResponse === 'attending' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : ''
                }`}
                onClick={() => onAttendanceChange(match.id, 'attending')}
                disabled={isDeadlinePassed}
              >
                <Check size={18} className="mr-1" />
                참석
              </Button>
              <Button 
                variant={match.userResponse === 'notAttending' ? 'destructive' : 'secondary'} 
                className="flex-1 flex items-center justify-center"
                onClick={() => onAttendanceChange(match.id, 'notAttending')}
                disabled={isDeadlinePassed}
              >
                <X size={18} className="mr-1" />
                불참
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 flex items-center justify-center" 
                variant="outline"
                onClick={() => setShowAttendanceModal(true)}
              >
                <Eye size={18} className="mr-1" />
                참석 현황
              </Button>
              {/* Show management button only to coaches */}
              <Button 
                className="flex-1 flex items-center justify-center" 
                variant="outline"
                onClick={() => handleManageMatch(match.id)}
              >
                <Clipboard size={18} className="mr-1" />
                이벤트 관리
              </Button>
            </div>
            {canManageAnnouncements && (
              <div className="flex gap-2">
                {onEditClick && (
                  <Button 
                    className="flex-1 flex items-center justify-center" 
                    variant="outline"
                    onClick={() => onEditClick(match.id)}
                  >
                    <Edit size={18} className="mr-1" />
                    수정
                  </Button>
                )}
                {onDeleteClick && (
                  <Button 
                    className="flex-1 flex items-center justify-center" 
                    variant="outline"
                    onClick={() => onDeleteClick(match.id)}
                  >
                    <Trash size={18} className="mr-1" />
                    삭제
                  </Button>
                )}
              </div>
            )}

            {/* 참석여부 마감일 표시 */}
            <div className={`text-xs mt-2 px-2 py-1 border rounded ${isDeadlinePassed ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200'}`}>
              참석여부 마감: {match.date ? formatDeadline(matchDeadline) : "날짜 정보 없음"}
              {isDeadlinePassed && ' (마감됨)'}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* 참석자 목록 모달 */}
      <AttendanceListModal 
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        matchId={match.id}
        matchInfo={{
          date: match.date,
          opponent: match.opponent,
          location: match.location
        }}
      />
    </Card>
  );
};

export default UpcomingMatchCard;
