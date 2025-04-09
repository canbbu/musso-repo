
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import PlayerStatsRecorder from './PlayerStatsRecorder';

interface Player {
  id: string;
  name: string;
}

interface AttendanceRecord {
  playerId: string;
  status: 'attending' | 'notAttending' | 'pending';
  rating: number | null;
}

interface PlayerAttendanceFormProps {
  matchId: number;
  matchDate: string;
  opponent: string;
  players: Player[];
  isCoach: boolean;
}

const PlayerAttendanceForm = ({ matchId, matchDate, opponent, players, isCoach }: PlayerAttendanceFormProps) => {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(
    players.map(player => ({
      playerId: player.id,
      status: 'pending',
      rating: null
    }))
  );
  
  const handleAttendanceChange = (playerId: string, status: 'attending' | 'notAttending') => {
    setAttendance(prev => 
      prev.map(record => 
        record.playerId === playerId 
          ? { ...record, status } 
          : record
      )
    );
    
    toast({
      title: status === 'attending' ? "참석 확인" : "불참 확인",
      description: `${players.find(p => p.id === playerId)?.name}님의 출석 상태가 변경되었습니다.`,
    });
  };
  
  const handleRatingChange = (playerId: string, rating: number) => {
    setAttendance(prev => 
      prev.map(record => 
        record.playerId === playerId 
          ? { ...record, rating } 
          : record
      )
    );
  };
  
  const saveAttendance = () => {
    // In a real app, this would save to the database
    console.log('Saving attendance records:', attendance);
    
    toast({
      title: "저장 완료",
      description: "출석 및 평점이 저장되었습니다.",
    });
  };
  
  // Generate rating options from 5 to 10 with 0.5 increments
  const ratingOptions = Array.from({ length: 11 }, (_, i) => 5 + i * 0.5);

  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create empty player stats for PlayerStatsRecorder
  const emptyPlayerStats = players.map(player => ({
    id: player.id,
    name: player.name,
    matchId: matchId,
    matchDate: matchDate,
    attended: attendance.find(a => a.playerId === player.id)?.status === 'attending' || false,
    goals: 0,
    assists: 0,
    rating: attendance.find(a => a.playerId === player.id)?.rating || 0
  }));

  // Dummy stat change handler for PlayerStatsRecorder
  const handleStatChange = (playerId: string, field: string, value: any) => {
    console.log(`Stat change for player ${playerId}: ${field} = ${value}`);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          선수 출석 및 평점
        </CardTitle>
        {isCoach && (
          <PlayerStatsRecorder 
            matchId={matchId}
            matchDate={formatDate(matchDate)}
            opponent={opponent}
            players={players}
            playerStats={emptyPlayerStats}
            onStatChange={handleStatChange}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>선수 이름</TableHead>
                <TableHead>출석 상태</TableHead>
                {isCoach && <TableHead>평점</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => {
                const playerAttendance = attendance.find(a => a.playerId === player.id);
                return (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant={playerAttendance?.status === 'attending' ? 'default' : 'secondary'} 
                          className={`flex items-center justify-center h-9 ${
                            playerAttendance?.status === 'attending' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : ''
                          }`}
                          size="sm"
                          onClick={() => handleAttendanceChange(player.id, 'attending')}
                        >
                          <Check size={16} className="mr-1" />
                          참석
                        </Button>
                        <Button 
                          variant={playerAttendance?.status === 'notAttending' ? 'destructive' : 'secondary'} 
                          className="flex items-center justify-center h-9"
                          size="sm"
                          onClick={() => handleAttendanceChange(player.id, 'notAttending')}
                        >
                          <X size={16} className="mr-1" />
                          불참
                        </Button>
                      </div>
                    </TableCell>
                    {isCoach && (
                      <TableCell>
                        <Select
                          value={playerAttendance?.rating?.toString() || ''}
                          onValueChange={(value) => handleRatingChange(player.id, parseFloat(value))}
                          disabled={playerAttendance?.status !== 'attending'}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="평점" />
                          </SelectTrigger>
                          <SelectContent>
                            {ratingOptions.map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating.toFixed(1)} <Star className="inline-block h-3 w-3 ml-1 text-yellow-400" />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {isCoach && (
          <div className="flex justify-end mt-4">
            <Button onClick={saveAttendance}>
              저장하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerAttendanceForm;
