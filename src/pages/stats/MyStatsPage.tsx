import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from "@/shared/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { User, Award, Calendar, Goal, Trophy, Zap, Target, Send, Move, Shield, Dumbbell, CalendarIcon, Activity } from 'lucide-react';
import { usePlayerRankings } from '@/features/stats/hooks/use-player-rankings';
import { useRunningRecords } from '@/features/running/hooks/use-running-records';
import Layout from '@/shared/components/layout/Layout';
import FlipPlayerCard from '@/shared/components/cards/FlipPlayerCard';

const MyStats = () => {
  const { userName, userId } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { players, loading } = usePlayerRankings(selectedYear);
  const { records: runningRecords, loading: runningLoading } = useRunningRecords(userId || null, selectedYear);
  
  // 연도 옵션 (최근 5년)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading || !players.length) {
    return <div>로딩 중...</div>;
  }
  
  // Find player stats based on username (in a real app, this would be more robust)
  const playerStats = players.find(p => p.name === userName) || players[0];
  
  const attendanceRate = playerStats.attendance;
  const goalEfficiency = Math.round((playerStats.goals / playerStats.games) * 100);
  const assistEfficiency = Math.round((playerStats.assists / playerStats.games) * 100);

  return (
    <Layout>
      <div className="player-personal-stats">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">내 기록</h1>
          <p className="text-gray-600">{userName}님의 이번 시즌 활동 기록입니다.</p>
          
          {/* 년도 필터 */}
          <div className="flex items-center gap-4 mt-4 mb-4">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">연도:</span>
            </div>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 카드와 MVP 섹션을 가로로 배치 */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* 선수 카드 - 왼쪽 배치 */}
          <div className="md:w-1/3">
            <h2 className="text-2xl font-bold mb-4">선수 카드</h2>
            <div className="flex justify-center">
              <FlipPlayerCard
                name={playerStats.name}
                position={playerStats.position}
                rating={playerStats.rating || 0}
                pacStat={playerStats.pac || 0}
                shoStat={playerStats.sho || 0}
                pasStat={playerStats.pas || 0}
                driStat={playerStats.dri || 0}
                defStat={playerStats.def || 0}
                phyStat={playerStats.phy || 0}
                bootsBrand={`/images/brand/${playerStats.boots_brand}.jpg`}
                favoriteTeam={`/images/club/${playerStats.favorite_team}.jpg`}
                teamLogo={`/images/무쏘_누끼.jpg`}
                playerImageUrl={playerStats.name ? `/images/member/${playerStats.name}.jpg` : undefined}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">카드를 클릭하면 상세 능력치를 확인할 수 있습니다.</p>
          </div>

          {/* MVP 트로피 섹션 - 오른쪽 세로 배치 */}
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">MVP 기록</h2>
            <div className="flex flex-col gap-6">
              {/* Weekly MVP */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <Trophy className="h-10 w-10 text-gray-400" />
                <div>
                  <h3 className="font-medium">주간 MVP</h3>
                  <p className="text-xl font-bold">{playerStats.weekly_mvp_count ?? 0}회</p>
                </div>
              </div>
              
              {/* Monthly MVP */}
              <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-lg">
                <Trophy className="h-10 w-10 text-amber-500" />
                <div>
                  <h3 className="font-medium">월간 MVP</h3>
                  <p className="text-xl font-bold text-amber-700">{playerStats.monthly_mvp_count ?? 0}회</p>
                </div>
              </div>
              
              {/* Yearly MVP */}
              <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg">
                <Trophy className="h-10 w-10 text-yellow-600" />
                <div>
                  <h3 className="font-medium">연간 MVP</h3>
                  <p className="text-xl font-bold text-yellow-700">{playerStats.yearly_mvp_count ?? 0}회</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5 text-primary" />
                선수 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">이름</span>
                    <span>{playerStats.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">포지션</span>
                    <span>{playerStats.position}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">참여 경기</span>
                    <span>{playerStats.games}경기</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">평점</span>
                    <span className="font-bold">{playerStats.rating}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Award className="mr-2 h-5 w-5 text-primary" />
                이벤트 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">출석률</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">득점</span>
                    <span>{playerStats.goals}골</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded ${i < Math.min(5, Math.ceil(playerStats.goals/2)) ? 'bg-green-500' : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">어시스트</span>
                    <span>{playerStats.assists}회</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded ${i < Math.min(5, Math.ceil(playerStats.assists/2)) ? 'bg-blue-500' : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Goal className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-800">득점 효율</p>
                <h3 className="text-2xl font-bold text-green-700">{goalEfficiency}%</h3>
                <p className="text-xs text-green-600 mt-1">경기당 {(playerStats.goals / playerStats.games).toFixed(1)}골</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Trophy className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-blue-800">어시스트 효율</p>
                <h3 className="text-2xl font-bold text-blue-700">{assistEfficiency}%</h3>
                <p className="text-xs text-blue-600 mt-1">경기당 {(playerStats.assists / playerStats.games).toFixed(1)}회</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-yellow-800">출석률</p>
                <h3 className="text-2xl font-bold text-yellow-700">{attendanceRate}%</h3>
                <p className="text-xs text-yellow-600 mt-1">{Math.round(playerStats.games * (attendanceRate/100))}경기 참석</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 런닝 기록 섹션 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="mr-2 h-5 w-5 text-green-600" />
                런닝 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {runningLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">런닝 기록을 불러오는 중...</p>
                  </div>
                </div>
              ) : runningRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>런닝 기록이 없습니다.</p>
                  <p className="text-sm mt-1">이벤트 페이지에서 런닝 기록을 입력해주세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">총 거리</p>
                      <p className="text-xl font-bold text-green-700">
                        {runningRecords.reduce((sum, r) => sum + r.distance, 0).toFixed(1)}km
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">총 시간</p>
                      <p className="text-xl font-bold text-blue-700">
                        {runningRecords.reduce((sum, r) => sum + r.duration, 0)}분
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">평균 페이스</p>
                      <p className="text-xl font-bold text-purple-700">
                        {runningRecords.length > 0
                          ? (runningRecords.reduce((sum, r) => sum + (r.pace || 0), 0) / runningRecords.length).toFixed(2)
                          : '0.00'} 분/km
                      </p>
                    </div>
                  </div>

                  {/* 기록 목록 */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm mb-3">기록 목록</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {runningRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">
                                {new Date(record.date).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                              <div className="text-sm text-gray-600">
                                {record.distance}km / {record.duration}분
                              </div>
                              {record.pace && (
                                <div className="text-xs text-gray-500">
                                  페이스: {record.pace} 분/km
                                </div>
                              )}
                            </div>
                            {record.notes && (
                              <div className="text-xs text-gray-500 mt-1">{record.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
};

export default MyStats;
