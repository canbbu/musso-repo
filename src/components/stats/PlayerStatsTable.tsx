
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface PlayerStatsTableProps {
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
  isLoading: boolean;
}

const PlayerStatsTable = ({ playerStats, onStatChange, isLoading }: PlayerStatsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>선수명</TableHead>
          <TableHead>출석</TableHead>
          <TableHead>득점</TableHead>
          <TableHead>어시스트</TableHead>
          <TableHead>평점</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {playerStats.map((stat) => (
          <TableRow key={stat.id}>
            <TableCell className="font-medium">{stat.name}</TableCell>
            <TableCell>
              <Checkbox 
                checked={stat.attended} 
                onCheckedChange={(checked) => onStatChange(stat.id, 'attended', checked)}
              />
            </TableCell>
            <TableCell>
              <Input 
                type="number" 
                min="0" 
                value={stat.goals} 
                onChange={(e) => onStatChange(stat.id, 'goals', Number(e.target.value))}
                className="w-16 h-8"
                disabled={!stat.attended}
              />
            </TableCell>
            <TableCell>
              <Input 
                type="number" 
                min="0" 
                value={stat.assists} 
                onChange={(e) => onStatChange(stat.id, 'assists', Number(e.target.value))}
                className="w-16 h-8"
                disabled={!stat.attended}
              />
            </TableCell>
            <TableCell>
              <Input 
                type="number" 
                min="0" 
                max="10" 
                step="0.1" 
                value={stat.rating} 
                onChange={(e) => onStatChange(stat.id, 'rating', Number(e.target.value))}
                className="w-20 h-8"
                disabled={!stat.attended}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PlayerStatsTable;
