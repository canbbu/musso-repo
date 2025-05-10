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
  
  const handleManageMatch = (matchId: number) => {
    
    if (!canManagePlayerStats()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "경기 관리는 감독과 코치만 가능합니다.",
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
              등록자: {match.createdBy}
              {match.updatedBy && (
                <span> | 최종 수정: {match.updatedBy} ({match.updatedAt})</span>
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
              >
                <Check size={18} className="mr-1" />
                참석
              </Button>
              <Button 
                variant={match.userResponse === 'notAttending' ? 'destructive' : 'secondary'} 
                className="flex-1 flex items-center justify-center"
                onClick={() => onAttendanceChange(match.id, 'notAttending')}
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
                경기 관리
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
