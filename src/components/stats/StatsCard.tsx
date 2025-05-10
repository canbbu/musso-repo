
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Users } from 'lucide-react';
import PlayerStatsTable from './PlayerStatsTable';

interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
}

interface StatsCardProps {
  matchDate: string;
  opponent: string;
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

const StatsCard = ({ matchDate, opponent, playerStats, onStatChange, onSave, isLoading }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-green-600" />
          선수 기록 입력
        </CardTitle>
        <CardDescription>
          선택된 경기: {matchDate}  {opponent}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlayerStatsTable
          playerStats={playerStats}
          onStatChange={onStatChange}
          isLoading={isLoading}
        />
        
        {!isLoading && (
          <div className="flex justify-end mt-6">
            <Button onClick={onSave} className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              기록 저장
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
