
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
  notes?: string;
}

interface PlayerStatsTableProps {
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
}

const PlayerStatsTable = ({ playerStats, onStatChange }: PlayerStatsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">선수명</TableHead>
          <TableHead className="w-[70px] text-center">출석</TableHead>
          <TableHead className="w-[70px] text-center">득점</TableHead>
          <TableHead className="w-[70px] text-center">어시스트</TableHead>
          <TableHead className="w-[80px] text-center">평점</TableHead>
          <TableHead>비고</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {playerStats.map((stat) => (
          <TableRow key={stat.id}>
            <TableCell className="font-medium">{stat.name}</TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center">
                <Checkbox 
                  checked={stat.attended} 
                  onCheckedChange={(checked) => onStatChange(stat.id, 'attended', checked)}
                />
              </div>
            </TableCell>
            <TableCell>
              <Input 
                type="number" 
                min="0" 
                max="99"
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
                max="99"
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
            <TableCell>
              <Input
                type="text"
                placeholder="비고"
                value={stat.notes || ''}
                onChange={(e) => onStatChange(stat.id, 'notes', e.target.value)}
                className="w-full h-8"
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
