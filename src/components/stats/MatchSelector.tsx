
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award } from "lucide-react";

interface Match {
  id: number;
  date: string;
  opponent: string;
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
            {matches.map((match) => (
              <SelectItem key={match.id} value={match.id.toString()}>
                {formatDate(match.date)} vs {match.opponent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default MatchSelector;
