
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SaveIcon, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
}

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

interface PlayerStatsRecorderProps {
  matchId: number;
  matchDate: string;
  opponent: string;
  players: Player[];
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
}

const PlayerStatsRecorder = ({
  matchId,
  matchDate,
  opponent,
  players,
  playerStats,
  onStatChange
}: PlayerStatsRecorderProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Convert matchDate to readable format
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
  
  const handleSave = () => {
    setSaving(true);
    
    // Simulate saving to server
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "선수 기록 저장 완료",
        description: `${playerStats.filter(p => p.attended).length}명의 선수 기록이 저장되었습니다.`,
      });
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">선수 기록 입력</CardTitle>
        <CardDescription>
          {formatDate(matchDate)} vs {opponent}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">선수명</TableHead>
              <TableHead className="w-[80px] text-center">출석</TableHead>
              <TableHead className="w-[80px] text-center">득점</TableHead>
              <TableHead className="w-[80px] text-center">어시스트</TableHead>
              <TableHead className="w-[100px] text-center">평점</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={saving}>
          <RefreshCw className="h-4 w-4 mr-2" />
          초기화
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              기록 저장
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlayerStatsRecorder;
