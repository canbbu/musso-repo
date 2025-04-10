
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
}

interface AttendanceRecord {
  playerId: string;
  status: 'attending' | 'notAttending' | 'pending';
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
      status: 'pending'
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
  
  const saveAttendance = () => {
    // In a real app, this would save to the database
    console.log('Saving attendance records:', attendance);
    
    toast({
      title: "저장 완료",
      description: "출석이 저장되었습니다.",
    });
  };

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

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          선수 출석
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>선수 이름</TableHead>
                <TableHead>출석 상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length > 0 ? (
                players.map((player) => {
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
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    등록된 선수가 없습니다.
                  </TableCell>
                </TableRow>
              )}
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
