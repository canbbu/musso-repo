
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Match } from '@/hooks/use-match-data';

interface CompletedMatchCardProps {
  match: Match;
}

const CompletedMatchCard = ({ match }: CompletedMatchCardProps) => {
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
          <div className="match-actions">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
              경기 결과 보기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedMatchCard;
