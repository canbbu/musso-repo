
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
}

interface PlayerStat {
  playerId: string;
  playerName: string;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
}

interface PlayerStatsRecorderProps {
  matchId: number;
  matchDate: string;
  opponent: string;
  players: Player[];
}

const PlayerStatsRecorder = ({ 
  matchId, 
  matchDate, 
  opponent, 
  players 
}: PlayerStatsRecorderProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>(
    players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      attended: false,
      goals: 0,
      assists: 0,
      rating: 0
    }))
  );

  const handleAttendanceChange = (playerId: string, attended: boolean) => {
    setPlayerStats(prevStats => 
      prevStats.map(stat => 
        stat.playerId === playerId 
          ? { ...stat, attended } 
          : stat
      )
    );
  };

  const handleStatChange = (playerId: string, field: 'goals' | 'assists' | 'rating', value: number) => {
    setPlayerStats(prevStats => 
      prevStats.map(stat => 
        stat.playerId === playerId 
          ? { ...stat, [field]: value } 
          : stat
      )
    );
  };

  const saveStats = () => {
    // In a real app, we would send this data to an API
    console.log('Saving stats for match:', matchId, playerStats);
    
    toast({
      title: "선수 기록 저장 완료",
      description: `${playerStats.filter(p => p.attended).length}명의 선수 기록이 저장되었습니다.`,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          선수 기록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>선수 기록 - {opponent} ({matchDate})</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh]">
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
                <TableRow key={stat.playerId}>
                  <TableCell className="font-medium">{stat.playerName}</TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={stat.attended} 
                      onCheckedChange={(checked) => handleAttendanceChange(stat.playerId, checked === true)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0" 
                      value={stat.goals} 
                      onChange={(e) => handleStatChange(stat.playerId, 'goals', Number(e.target.value))}
                      className="w-16 h-8"
                      disabled={!stat.attended}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0" 
                      value={stat.assists} 
                      onChange={(e) => handleStatChange(stat.playerId, 'assists', Number(e.target.value))}
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
                      onChange={(e) => handleStatChange(stat.playerId, 'rating', Number(e.target.value))}
                      className="w-20 h-8"
                      disabled={!stat.attended}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={saveStats} className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            기록 저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerStatsRecorder;
