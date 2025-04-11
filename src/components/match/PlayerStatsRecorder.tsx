
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PlayerStatsTable from './player-stats/PlayerStatsTable';
import MatchNotesSection from './player-stats/MatchNotesSection';
import PlayerStatsFooter from './player-stats/PlayerStatsFooter';

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
  notes?: string;
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
  const [matchNotes, setMatchNotes] = useState('');
  const [mvp, setMvp] = useState('');
  
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

  const handleReset = () => {
    setMatchNotes('');
    setMvp('');
    // You would reset player stats here if needed
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
        <PlayerStatsTable 
          playerStats={playerStats}
          onStatChange={onStatChange}
        />
        
        <MatchNotesSection
          matchNotes={matchNotes}
          setMatchNotes={setMatchNotes}
          mvp={mvp}
          setMvp={setMvp}
        />
      </CardContent>
      <CardFooter>
        <PlayerStatsFooter
          saving={saving}
          onSave={handleSave}
          onReset={handleReset}
        />
      </CardFooter>
    </Card>
  );
};

export default PlayerStatsRecorder;
