
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMatchData } from '@/hooks/use-match-data';
import { usePlayerStats } from '@/hooks/use-player-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, ChartBar, Clock, FileText, History } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MatchStatsCard from '@/components/match/MatchStatsCard';
import MatchSection from '@/components/match/MatchSection';
import CompletedMatchSection from '@/components/match/CompletedMatchSection';
import AttendanceRecordForm from '@/components/match/AttendanceRecordForm';
import MatchRecordForm from '@/components/match/MatchRecordForm';

interface Player {
  id: string;
  name: string;
}

const MatchManagement = () => {
  const { canManageAnnouncements, canManagePlayerStats } = useAuth();
  const { matches, selectedMatchId, setSelectedMatchId, handleAttendanceChange, currentYearMatches } = useMatchData();
  const { playerStats, handleStatChange, formatDate } = usePlayerStats();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const matchIdParam = searchParams.get('matchId');
  const editParam = searchParams.get('edit');
  
  const [activeTab, setActiveTab] = useState<'matches' | 'attendance' | 'gameRecord'>(
    searchParams.get('tab') === 'attendance' ? 'attendance' : 
    searchParams.get('tab') === 'gameRecord' ? 'gameRecord' : 
    'matches'
  );
  
  useEffect(() => {
    // URL에서 matchId 파라미터가 있으면 해당 매치를 선택
    if (matchIdParam) {
      setSelectedMatchId(Number(matchIdParam));
    }
    
    // URL에서 tab 파라미터가 있으면 해당 탭을 활성화
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'attendance' || tabParam === 'gameRecord') {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, matchIdParam, setSelectedMatchId]);
  
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
  
  const handleMatchHistoryClick = () => {
    navigate('/match-history');
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
                출석 기록
              </TabsTrigger>
              <TabsTrigger value="gameRecord" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                경기 기록
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              <div className="flex justify-between mb-4">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                  <MatchStatsCard currentYearMatches={currentYearMatches} />
                </div>
                <Button variant="outline" onClick={handleMatchHistoryClick}>
                  <History className="w-4 h-4 mr-2" />
                  경기 이력 보기
                </Button>
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
                canManagePlayerStats={canManagePlayerStats()}
              />
            </TabsContent>

            <TabsContent value="attendance">
              {selectedMatchId ? (
                <AttendanceRecordForm 
                  matchId={selectedMatchId}
                  matchDate={selectedMatch?.date || ''}
                  opponent={selectedMatch?.opponent || ''}
                  players={players}
                  isCoach={canManagePlayerStats()}
                />
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">출석 기록을 위해 경기를 선택해주세요</p>
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
              )}
            </TabsContent>

            <TabsContent value="gameRecord">
              {selectedMatchId ? (
                <MatchRecordForm 
                  matchId={selectedMatchId}
                  matchDate={selectedMatch?.date || ''}
                  opponent={selectedMatch?.opponent || ''}
                  players={players}
                  playerStats={playerStats}
                  onStatChange={handleStatChange}
                  isCoach={canManagePlayerStats()}
                />
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">경기 기록을 위해 경기를 선택해주세요</p>
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchManagement;
