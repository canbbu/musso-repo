
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface MatchStatsCardProps {
  currentYearMatches: number;
}

const MatchStatsCard = ({ currentYearMatches }: MatchStatsCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-blue-600" />
          이번년도 이벤트
        </CardTitle>
        <CardDescription>총 이벤트 수</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{currentYearMatches} 이벤트</p>
      </CardContent>
    </Card>
  );
};

export default MatchStatsCard;
