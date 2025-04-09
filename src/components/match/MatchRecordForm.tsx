
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
}

interface PlayerStat {
  id: string;
  name: string;
  matchId: number;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
}

interface MatchRecordFormProps {
  matchId: number;
  matchDate: string;
  opponent: string;
  players: Player[];
  playerStats: PlayerStat[];
  onStatChange: (playerId: string, field: keyof PlayerStat, value: any) => void;
  isCoach: boolean;
}

interface MatchResult {
  ourScore: string;
  opponentScore: string;
  result: 'win' | 'loss' | 'draw';
  mvp: string;
  review: string;
}

const MatchRecordForm = ({ 
  matchId, 
  matchDate, 
  opponent, 
  players, 
  playerStats, 
  onStatChange,
  isCoach 
}: MatchRecordFormProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  const form = useForm<MatchResult>({
    defaultValues: {
      ourScore: '',
      opponentScore: '',
      result: 'draw',
      mvp: '',
      review: ''
    }
  });
  
  const handleNoteChange = (playerId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [playerId]: note
    }));
  };
  
  const handleSave = () => {
    // In a real app, we would send this data to an API
    console.log('Saving match records:', { 
      matchId, 
      playerStats, 
      notes,
      matchResult: form.getValues()
    });
    
    toast({
      title: "경기 기록 저장 완료",
      description: `${playerStats.length}명의 선수 기록과 경기 결과가 저장되었습니다.`,
    });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            경기 결과 - {formatDate(matchDate)} vs {opponent}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="ourScore">우리팀 점수</Label>
                    <Input 
                      id="ourScore"
                      type="number" 
                      placeholder="0" 
                      disabled={!isCoach}
                      {...form.register('ourScore')}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="opponentScore">상대팀 점수</Label>
                    <Input 
                      id="opponentScore"
                      type="number" 
                      placeholder="0" 
                      disabled={!isCoach}
                      {...form.register('opponentScore')}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="result">경기 결과</Label>
                  <select 
                    id="result"
                    className="w-full p-2 border rounded-md"
                    disabled={!isCoach}
                    {...form.register('result')}
                  >
                    <option value="win">승리</option>
                    <option value="loss">패배</option>
                    <option value="draw">무승부</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="mvp">MVP 선수</Label>
                  <select 
                    id="mvp"
                    className="w-full p-2 border rounded-md"
                    disabled={!isCoach}
                    {...form.register('mvp')}
                  >
                    <option value="">-- 선택하세요 --</option>
                    {players.map(player => (
                      <option key={player.id} value={player.name}>{player.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="review">경기 총평</Label>
                <Textarea 
                  id="review"
                  placeholder="이번 경기에 대한 총평을 작성해주세요..." 
                  className="h-40"
                  disabled={!isCoach}
                  {...form.register('review')}
                />
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>선수별 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>선수명</TableHead>
                <TableHead>득점</TableHead>
                <TableHead>어시스트</TableHead>
                <TableHead>평점</TableHead>
                <TableHead>비고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerStats.map(stat => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      value={stat.goals} 
                      onChange={(e) => onStatChange(stat.id, 'goals', parseInt(e.target.value) || 0)}
                      disabled={!isCoach || !stat.attended}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      value={stat.assists} 
                      onChange={(e) => onStatChange(stat.id, 'assists', parseInt(e.target.value) || 0)}
                      disabled={!isCoach || !stat.attended}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      value={stat.rating}
                      onChange={(e) => onStatChange(stat.id, 'rating', parseFloat(e.target.value))}
                      disabled={!isCoach || !stat.attended}
                      className="p-2 border rounded-md w-20"
                    >
                      {[...Array(51)].map((_, i) => {
                        const value = (i + 50) / 10;  // 5.0 to 10.0
                        return (
                          <option key={i} value={value}>{value.toFixed(1)}</option>
                        );
                      })}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="비고"
                      value={notes[stat.id] || ''}
                      onChange={(e) => handleNoteChange(stat.id, e.target.value)}
                      disabled={!isCoach}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          {isCoach && (
            <Button onClick={handleSave}>
              저장하기
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MatchRecordForm;
