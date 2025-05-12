import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, FileEdit, ClipboardCheck } from "lucide-react";
import { Match } from '@/hooks/use-match-data';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CompletedMatchCardProps {
  match: Match;
  canManagePlayerStats?: boolean;
}

const CompletedMatchCard = ({ match, canManagePlayerStats = false }: CompletedMatchCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log("match 객체:", match);
  
  const handleViewResults = () => {
    navigate(`/matches?matchId=${match.id}`);
  };
  
  const handleManageMatch = () => {
    if (!canManagePlayerStats) {
      toast({
        title: "접근 권한이 없습니다",
        description: "이벤트 관리는 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/matches?matchId=${match.id}&edit=true`);
  };
  
  const handleManageStats = () => {
    if (!canManagePlayerStats) {
      toast({
        title: "접근 권한이 없습니다",
        description: "선수 기록 입력은 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/stats-management?matchId=${match.id}`);
  };

  return (
    <Card key={match.id} className={`border-l-4 ${
      match.result === 'win' 
        ? 'border-l-green-500' 
        : match.result === 'loss' 
        ? 'border-l-red-500' 
        : 'border-l-gray-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="match-info mb-4 md:mb-0">
            <div className="flex items-center mb-1">
              <h3 className="text-xl font-semibold"> {match.opponent}</h3>
              <span className={`ml-3 px-3 py-1 rounded-full text-sm ${
                match.result === 'win' 
                  ? 'bg-green-100 text-green-800' 
                  : match.result === 'loss' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {match.score}
              </span>
            </div>
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
            
            {/* {match.mvp && (
              <div className="mt-2 text-sm">
                <span className="font-semibold">MVP:</span> {match.mvp}
              </div>
            )} */}
            
            <div className="text-xs text-gray-500 mt-2">
              등록자: {match.created_by}
              {match.updated_by && (
                <span> | 최종 수정: {match.updated_by}</span>
              )}
            </div>
          </div>
          <div className="match-actions flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={handleViewResults}
            >
              <Eye size={18} className="mr-1" />
              이벤트 결과 보기
            </Button>
            
            {/* Show management buttons to everyone but check permissions when clicked */}
            <Button 
              className="flex items-center justify-center" 
              onClick={handleManageMatch}
            >
              <FileEdit size={18} className="mr-1" />
              이벤트 관리
            </Button>
            <Button 
              variant="secondary"
              className="flex items-center justify-center" 
              onClick={handleManageStats}
            >
              <ClipboardCheck size={18} className="mr-1" />
              선수 기록 입력
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedMatchCard;
