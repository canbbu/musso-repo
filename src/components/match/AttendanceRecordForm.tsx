
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Clock, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
}

interface AttendanceRecordFormProps {
  matchId: number;
  matchDate: string;
  opponent: string;
  players: Player[];
  isCoach: boolean;
}

type AttendanceStatus = 'attending' | 'notAttending' | 'pending' | 'late';

const AttendanceRecordForm = ({ matchId, matchDate, opponent, players, isCoach }: AttendanceRecordFormProps) => {
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // In a real app, we would fetch data from an API
    // For this example, we'll generate random attendance data
    const randomStatus = () => {
      const statuses: AttendanceStatus[] = ['attending', 'notAttending', 'pending', 'late'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };
    
    const initialAttendance: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};
    
    players.forEach(player => {
      initialAttendance[player.id] = randomStatus();
      initialNotes[player.id] = '';
    });
    
    setAttendanceRecords(initialAttendance);
    setNotes(initialNotes);
  }, [matchId, players]);
  
  const handleAttendanceChange = (playerId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [playerId]: status
    }));
  };
  
  const handleNoteChange = (playerId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [playerId]: note
    }));
  };
  
  const handleSave = () => {
    
    toast({
      title: "출석 기록 저장 완료",
      description: `${Object.keys(attendanceRecords).length}명의 선수 출석 상태가 저장되었습니다.`,
    });
  };
  
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'attending': return <Check className="h-4 w-4 text-green-500" />;
      case 'notAttending': return <X className="h-4 w-4 text-red-500" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <HelpCircle className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };
  
  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'attending': return '참석';
      case 'notAttending': return '불참';
      case 'late': return '지각';
      case 'pending': return '미정';
      default: return '';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          출석 기록 - {formatDate(matchDate)}  {opponent}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>선수명</TableHead>
              <TableHead>출석 상태</TableHead>
              <TableHead>비고</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>
                  <Select
                    value={attendanceRecords[player.id] || 'pending'}
                    onValueChange={(value) => handleAttendanceChange(player.id, value as AttendanceStatus)}
                    disabled={!isCoach}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        {attendanceRecords[player.id] && (
                          <div className="flex items-center">
                            {getStatusIcon(attendanceRecords[player.id])}
                            <span className="ml-2">{getStatusText(attendanceRecords[player.id])}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attending">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span>참석</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="notAttending">
                        <div className="flex items-center">
                          <X className="h-4 w-4 text-red-500 mr-2" />
                          <span>불참</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="late">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          <span>지각</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                          <span>미정</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    placeholder="비고"
                    value={notes[player.id] || ''}
                    onChange={(e) => handleNoteChange(player.id, e.target.value)}
                    disabled={!isCoach}
                    className="w-full p-2 border rounded-md"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {isCoach && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>
              저장하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceRecordForm;
