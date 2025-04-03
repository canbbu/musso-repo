
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Goal, Trophy, CalendarCheck, Star } from "lucide-react";
import type { RankingTab, Player } from '@/hooks/use-player-rankings';

interface StatCardProps {
  type: RankingTab;
  isActive: boolean;
  topPlayer?: Player | null;
  onClick: () => void;
}

const StatCard = ({ type, isActive, topPlayer, onClick }: StatCardProps) => {
  const getCardStyles = () => {
    if (isActive) {
      switch (type) {
        case 'goals':
          return 'border-green-500 bg-green-50';
        case 'assists':
          return 'border-blue-500 bg-blue-50';
        case 'attendance':
          return 'border-yellow-500 bg-yellow-50';
        case 'rating':
          return 'border-orange-500 bg-orange-50';
      }
    }
    return '';
  };

  const getIcon = () => {
    switch (type) {
      case 'goals':
        return <Goal className="mr-2 h-4 w-4 text-green-600" />;
      case 'assists':
        return <Trophy className="mr-2 h-4 w-4 text-blue-600" />;
      case 'attendance':
        return <CalendarCheck className="mr-2 h-4 w-4 text-yellow-600" />;
      case 'rating':
        return <Star className="mr-2 h-4 w-4 text-orange-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'goals':
        return '득점 랭킹';
      case 'assists':
        return '어시스트 랭킹';
      case 'attendance':
        return '출석 랭킹';
      case 'rating':
        return '평점 랭킹';
    }
  };

  const getValue = () => {
    if (!topPlayer) return 0;
    
    switch (type) {
      case 'goals':
        return `${topPlayer.goals} 골`;
      case 'assists':
        return `${topPlayer.assists} 어시스트`;
      case 'attendance':
        return `${topPlayer.attendance}%`;
      case 'rating':
        return topPlayer.rating;
    }
  };

  return (
    <Card 
      className={`cursor-pointer border-2 ${getCardStyles()}`}
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center">
          {getIcon()}
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold">{topPlayer?.name || '-'}</div>
        <div className="text-sm text-gray-500">{getValue()}</div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
