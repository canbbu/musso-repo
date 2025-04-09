
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMatchData } from '@/hooks/use-match-data';
import { usePlayerStats } from '@/hooks/use-player-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, ChartBar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MatchStatsCard from '@/components/match/MatchStatsCard';
import MatchSection from '@/components/match/MatchSection';
import CompletedMatchSection from '@/components/match/CompletedMatchSection';
import PlayerAttendanceForm from '@/components/match/PlayerAttendanceForm';
import PlayerStatsRecorder from '@/components/match/PlayerStatsRecorder';

interface Player {
  id: string;
  name: string;
}

const MatchManagement = () => {
  const { canManageAnnouncements, canManagePlayerStats } = useAuth();
  const { matches, selectedMatchId, setSelectedMatchId, handleAttendanceChange, currentYearMatches } = useMatchData();
  const { playerStats, handleStatChange, formatDate } = usePlayerStats();
  
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const matchIdParam = searchParams.get('matchId');
  
  const [activeTab, setActiveTab] = useState<'matches' | 'attendance' | 'stats'>(
    tabParam === 'attendance' ? 'attendance' : 
    tabParam === 'stats' ? 'stats' : 
    'matches'
  );
  
  useEffect(() => {
    // URL에서 matchId 파라미터가 있으면 해당 매치를 선택
    if (matchIdParam) {
      setSelectedMatchId(Number(matchIdParam));
    }
    
    // URL에서 tab 파라미터가 있으면 해당 탭을 활성화
    if (tabParam) {
      if (tabParam === 'attendance' || tabParam === 'stats') {
        setActiveTab(tabParam);
      }
    }
  }, [tabParam, matchIdParam, setSelectedMatchId]);
  
  const [players] = useState<Player[]>([
    { id: 'player1', name: '김선수' },
    { id: 'player2', name: '이공격수' },
    { id: 'player3', name: '박수비' },
    { id: 'player4', name: '정미드필더' },
    { id: 'player5', name: '최골키퍼' },
    { id: 'player6', name: '강수비수' },
    { id: 'player7', name: '장미드필더' },
  ]);
  
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');

  const handleAddMatchClick = () => {
    window.location.href = "/announcement-management";
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="match-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">경기 관리</h1>
        <p className="text-gray-600">일정, 결과 및 모든 팀 경기 관리</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>경기 관리 메뉴</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="matches" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                경기 일정
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                출석 관리
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">
                <ChartBar className="w-4 h-4 mr-2" />
                선수 기록
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
                <MatchStatsCard currentYearMatches={currentYearMatches} />
              </div>
              
              <MatchSection
                title="다가오는 경기"
                matches={upcomingMatches}
                onAttendanceChange={handleAttendanceChange}
                canManageAnnouncements={canManageAnnouncements()}
                emptyMessage="예정된 경기가 없습니다."
                showAddButton={true}
                onAddClick={handleAddMatchClick}
              />
              
              <CompletedMatchSection
                title="최근 경기"
                matches={completedMatches}
                emptyMessage="완료된 경기가 없습니다."
              />
            </TabsContent>

            <TabsContent value="attendance">
              {selectedMatchId ? (
                <PlayerAttendanceForm 
                  matchId={selectedMatchId}
                  matchDate={matches.find(m => m.id === selectedMatchId)?.date || ''}
                  opponent={matches.find(m => m.id === selectedMatchId)?.opponent || ''}
                  players={players}
                  isCoach={canManagePlayerStats()}
                />
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">출석 관리를 위해 경기를 선택해주세요</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingMatches.map(match => (
                      <Button 
                        key={match.id} 
                        variant="outline" 
                        onClick={() => setSelectedMatchId(match.id)}
                        className="text-left"
                      >
                        <div>
                          <div className="font-medium">{formatDate(match.date)}</div>
                          <div className="text-sm text-gray-500">vs {match.opponent}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats">
              {canManagePlayerStats() ? (
                selectedMatch ? (
                  <PlayerStatsRecorder 
                    matchId={selectedMatch.id}
                    matchDate={selectedMatch.date}
                    opponent={selectedMatch.opponent}
                    players={players}
                    playerStats={playerStats}
                    onStatChange={handleStatChange}
                  />
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">선수 기록 관리를 위해 경기를 선택해주세요</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {matches.map(match => (
                        <Button 
                          key={match.id} 
                          variant="outline" 
                          onClick={() => setSelectedMatchId(match.id)}
                          className="text-left"
                        >
                          <div>
                            <div className="font-medium">{formatDate(match.date)}</div>
                            <div className="text-sm text-gray-500">vs {match.opponent}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                  <p className="text-red-600 mb-2">접근 권한이 없습니다</p>
                  <p className="text-gray-600">선수 기록 관리는 감독과 코치만 가능합니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchManagement;
