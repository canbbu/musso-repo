import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award } from "lucide-react";

interface Match {
  id: number;
  date: string;
  opponent: string;
  status: string;
}

interface MatchSelectorProps {
  matches: Match[];
  selectedMatch: number | null;
  onMatchSelect: (matchId: number) => void;
  formatDate: (dateString: string) => string;
}

const MatchSelector = ({ matches, selectedMatch, onMatchSelect, formatDate }: MatchSelectorProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-blue-600" />
          경기 선택
        </CardTitle>
        <CardDescription>기록을 관리할 경기를 선택하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Select 
          value={selectedMatch?.toString() || ''} 
          onValueChange={(value) => onMatchSelect(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="경기를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {matches.map((match) => {
              // cancelled 경기는 필터링
              if (match.status === 'cancelled') return null;
              
              // 상태에 따른 텍스트 및 스타일 지정
              let statusText = '';
              let itemStyle = {};
              
              if (match.status === 'upcoming') {
                statusText = '(예정됨)';
                itemStyle = { color: '#1d4ed8' }; // 파란색: 다가오는 경기
              } else if (match.status === 'completed') {
                statusText = '(완료됨)';
                itemStyle = { color: '#6b7280', fontStyle: 'italic' }; // 회색: 완료된 경기
              }
              
              return (
                <SelectItem 
                  key={match.id} 
                  value={match.id.toString()}
                  className={`
                    ${match.status === 'completed' ? 'text-gray-500 italic' : ''}
                    ${match.status === 'upcoming' ? 'text-blue-700' : ''}
                  `}
                >
                  {formatDate(match.date)}  {match.opponent} {statusText}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default MatchSelector;
