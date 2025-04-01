
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Award, Users, Save, AlertCircle } from 'lucide-react';
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

interface Match {
  id: number;
  date: string;
  opponent: string;
}

const StatsManagement = () => {
  const { canManagePlayerStats, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([
    { id: 1, date: '2023-11-25T19:00', opponent: 'FC 서울' },
    { id: 2, date: '2023-12-02T18:00', opponent: '강남 유나이티드' },
    { id: 3, date: '2023-11-18T16:00', opponent: '드림 FC' }
  ]);
  
  const [players] = useState([
    { id: 'player1', name: '김선수' },
    { id: 'player2', name: '이공격수' },
    { id: 'player3', name: '박수비' },
    { id: 'player4', name: '정미드필더' },
    { id: 'player5', name: '최골키퍼' },
  ]);
  
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Redirect if no permissions
    if (!canManagePlayerStats()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "선수 기록 관리는 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      navigate('/stats');
    }
  }, [canManagePlayerStats, navigate, toast]);
  
  // Load player stats when a match is selected
  useEffect(() => {
    if (selectedMatch) {
      setIsLoading(true);
      // In a real app, we would fetch data from an API
      const selectedMatchData = matches.find(m => m.id === selectedMatch);
      
      // Generate placeholder stats for the selected match
      setTimeout(() => {
        const stats = players.map(player => ({
          id: player.id,
          name: player.name,
          matchId: selectedMatch,
          matchDate: selectedMatchData?.date || '',
          attended: Math.random() > 0.2, // 80% chance of attendance
          goals: Math.floor(Math.random() * 3),
          assists: Math.floor(Math.random() * 3),
          rating: Math.round((Math.random() * 4 + 6) * 10) / 10 // Rating between 6.0 and 10.0
        }));
        
        setPlayerStats(stats);
        setIsLoading(false);
      }, 500);
    } else {
      setPlayerStats([]);
    }
  }, [selectedMatch, players, matches]);
  
  const handleStatChange = (playerId: string, field: keyof PlayerStats, value: any) => {
    setPlayerStats(prev => 
      prev.map(stat => 
        stat.id === playerId 
          ? { ...stat, [field]: value } 
          : stat
      )
    );
  };
  
  const handleSaveStats = () => {
    // In a real app, we would send this data to an API
    toast({
      title: "선수 기록 저장 완료",
      description: `${playerStats.length}명의 선수 기록이 저장되었습니다.`,
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
    <div className="stats-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">선수 기록 관리</h1>
        <p className="text-gray-600">선수들의 경기 출석, 득점, 어시스트, 평점을 기록합니다.</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-blue-600" />
            경기 선택
          </CardTitle>
          <CardDescription>기록을 관리할 경기를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMatch?.toString() || ''} onValueChange={(value) => setSelectedMatch(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="경기를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {matches.map((match) => (
                <SelectItem key={match.id} value={match.id.toString()}>
                  {formatDate(match.date)} vs {match.opponent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedMatch && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              선수 기록 입력
            </CardTitle>
            <CardDescription>
              선택된 경기: {formatDate(matches.find(m => m.id === selectedMatch)?.date || '')} vs {matches.find(m => m.id === selectedMatch)?.opponent}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>데이터 로딩 중...</p>
              </div>
            ) : (
              <>
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
                            onCheckedChange={(checked) => handleStatChange(stat.id, 'attended', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="0" 
                            value={stat.goals} 
                            onChange={(e) => handleStatChange(stat.id, 'goals', Number(e.target.value))}
                            className="w-16 h-8"
                            disabled={!stat.attended}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="0" 
                            value={stat.assists} 
                            onChange={(e) => handleStatChange(stat.id, 'assists', Number(e.target.value))}
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
                            onChange={(e) => handleStatChange(stat.id, 'rating', Number(e.target.value))}
                            className="w-20 h-8"
                            disabled={!stat.attended}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveStats} className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    기록 저장
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {!selectedMatch && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700">기록을 관리할 경기를 선택해주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsManagement;
