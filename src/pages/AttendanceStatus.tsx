import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Calendar, User } from 'lucide-react';

interface MatchData {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface AttendanceData {
  match_id: number;
  player_id: string;
  status: 'attending' | 'not_attending' | 'pending';
}

const AttendanceStatus = () => {
  const { canManage } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  // 선수 데이터 가져오기
  const { players } = usePlayerRankings();

  // 권한 체크 (일시적으로 모든 사용자 접근 허용)
  // TODO: 시즌 시작 시 아래 주석 해제하여 관리자만 접근하도록 변경
  // if (!canManage()) {
  //   return (
  //     <Layout>
  //       <div className="flex flex-col items-center justify-center h-64">
  //         <Shield className="h-16 w-16 text-gray-400 mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-600">접근 권한이 없습니다</h2>
  //         <p className="text-gray-500">운영진만 출석현황을 확인할 수 있습니다.</p>
  //       </div>
  //     </Layout>
  //   );
  // }

  // 매치 데이터와 출석 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 월별로 나누어서 처리 (연도 전체도 각 월별로 처리하여 일관성 유지)
        const monthsToProcess = selectedMonth 
          ? [selectedMonth] 
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        const matchesMap = new Map<number, MatchData>();
        const attendanceMap = new Map<string, AttendanceData>();

        // 각 월별로 처리
        for (const month of monthsToProcess) {
          // 월의 첫 날: YYYY-MM-01T00:00:00.000Z
          const monthStr = month.toString().padStart(2, '0');
          const startDate = `${selectedYear}-${monthStr}-01T00:00:00.000Z`;
          
          // 월의 마지막 날 계산
          const lastDay = new Date(selectedYear, month, 0).getDate();
          const endDate = `${selectedYear}-${monthStr}-${lastDay.toString().padStart(2, '0')}T23:59:59.999Z`;

          // 해당 월의 매치 데이터 가져오기
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('id, date, location, opponent, status')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

          if (matchesError) throw matchesError;

          if (matchesData && matchesData.length > 0) {
            // 매치 데이터 추가 (중복 제거)
            matchesData.forEach(match => {
              if (!matchesMap.has(match.id)) {
                matchesMap.set(match.id, match);
              }
            });

            const matchIds = matchesData.map(match => match.id);
            
            // match_number를 포함해서 조회 (1, 2 모두)
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('match_id, player_id, status, match_number')
              .in('match_id', matchIds)
              .in('match_number', [1, 2]);

            if (attendanceError) throw attendanceError;

            // match_id와 player_id 조합이 있으면 참석으로 판단
            // 중복 제거: 같은 match_id와 player_id 조합은 match_number = 1을 우선으로 선택
            if (attendanceData) {
              // match_number = 1 데이터를 먼저 추가
              attendanceData
                .filter(att => att.match_number === 1)
                .forEach(att => {
                  const key = `${att.match_id}_${att.player_id}`;
                  if (!attendanceMap.has(key)) {
                    attendanceMap.set(key, {
                      match_id: att.match_id,
                      player_id: att.player_id,
                      status: 'attending' // match_id와 player_id가 있으면 참석으로 판단
                    });
                  }
                });
              
              // match_number = 2 데이터를 추가 (match_number = 1이 없는 경우만)
              attendanceData
                .filter(att => att.match_number === 2)
                .forEach(att => {
                  const key = `${att.match_id}_${att.player_id}`;
                  if (!attendanceMap.has(key)) {
                    attendanceMap.set(key, {
                      match_id: att.match_id,
                      player_id: att.player_id,
                      status: 'attending' // match_id와 player_id가 있으면 참석으로 판단
                    });
                  }
                });
            }
          }
        }

        // 매치 데이터 정렬
        const uniqueMatches = Array.from(matchesMap.values())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setMatches(uniqueMatches);
        setAttendanceData(Array.from(attendanceMap.values()));

      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  // 선수별 출석 현황 계산 (전체 선수 데이터 기준)
  const attendanceMatrix = useMemo(() => {
    const matrix: Record<string, Record<number, string>> = {};
    
    // 전체 선수별로 초기화 (필터와 관계없이)
    players.forEach(player => {
      matrix[player.id] = {};
      matches.forEach(match => {
        matrix[player.id][match.id] = 'pending'; // 기본값
      });
    });

    // 출석 데이터로 매트릭스 채우기
    attendanceData.forEach(attendance => {
      if (matrix[attendance.player_id]) {
        matrix[attendance.player_id][attendance.match_id] = attendance.status;
      }
    });

    return matrix;
  }, [players, matches, attendanceData]);

  // 선수들을 가나다순으로 정렬
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [players]);

  // 필터링된 선수들
  const filteredPlayers = useMemo(() => {
    if (selectedPlayer === 'all') {
      return sortedPlayers;
    }
    return sortedPlayers.filter(player => player.id === selectedPlayer);
  }, [sortedPlayers, selectedPlayer]);

  // 연도 옵션 생성 (2020년부터 현재년도+1년까지)
  const yearOptions = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 현재 날짜
  const currentDate = new Date();

  // 경기가 미래인지 또는 예정 상태인지 확인
  const isFutureOrUpcoming = (match: MatchData) => {
    const matchDate = new Date(match.date);
    return matchDate > currentDate || match.status === 'upcoming';
  };

  // 출석 상태별 스타일 반환
  const getStatusStyle = (status: string, match: MatchData) => {
    // 취소된 경기
    if (match.status === 'cancelled') {
      return 'bg-gray-200 text-gray-500';
    }
    
    // 미래 경기 또는 예정된 경기
    if (isFutureOrUpcoming(match)) {
      return 'bg-gray-300 text-gray-600';
    }
    
    switch (status) {
      case 'attending':
        return 'bg-green-200 text-green-800';
      case 'not_attending':
      case 'pending':
        return 'bg-pink-200 text-pink-800';
      default:
        return 'bg-pink-200 text-pink-800';
    }
  };

  // 출석 상태 표시 텍스트
  const getStatusText = (status: string, match: MatchData) => {
    // 미래 경기 또는 예정된 경기는 아무 표시 없음
    if (isFutureOrUpcoming(match)) {
      return '';
    }
    
    switch (status) {
      case 'attending':
        return '✓';
      case 'not_attending':
      case 'pending':
        return '✗';
      default:
        return '✗';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-1">
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">출석현황 관리</h1>
              <p className="text-gray-600">회원들의 경기 출석 현황을 한눈에 확인하고 관리하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm bg-white/80 backdrop-blur-sm border-green-200">
                <Users className="w-4 h-4 mr-1" />
                전체 회원
              </Badge>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              필터 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  연도
                </label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  월
                </label>
                <Select 
                  value={selectedMonth?.toString() || "all"} 
                  onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {monthOptions.map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  선수
                </label>
                <Select 
                  value={selectedPlayer} 
                  onValueChange={setSelectedPlayer}
                >
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 선수</SelectItem>
                    {sortedPlayers.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 출석현황 테이블 */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg border-b border-gray-100">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              {selectedYear}년 {selectedMonth ? `${selectedMonth}월` : '전체'} 출석현황
              <div className="ml-auto text-sm font-normal text-gray-500">
                총 {matches.length}경기 · {filteredPlayers.length}명
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">경기가 없습니다</h3>
                <p className="text-gray-500">해당 기간에 예정된 경기가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left font-semibold text-gray-800 bg-gray-50/80 sticky left-0 z-10 border-r border-gray-100">
                        선수명
                      </th>
                      {matches.map(match => (
                        <th 
                          key={match.id} 
                          className={`px-4 py-4 text-center min-w-24 font-medium text-xs ${
                            match.status === 'cancelled' 
                              ? 'bg-gray-100 text-gray-500' 
                              : isFutureOrUpcoming(match)
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {new Date(match.date).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs opacity-75 truncate max-w-20">
                              {match.opponent}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, playerIndex) => (
                      <tr 
                        key={player.id} 
                        className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                          playerIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800 sticky left-0 z-10 bg-inherit border-r border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            {player.name}
                          </div>
                        </td>
                        {matches.map(match => {
                          const status = attendanceMatrix[player.id]?.[match.id] || 'pending';
                          
                          return (
                            <td 
                              key={match.id} 
                              className="px-4 py-4 text-center"
                            >
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-semibold transition-all hover:scale-110 ${getStatusStyle(status, match)}`}
                              >
                                {getStatusText(status, match)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 범례 */}
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 mb-4">범례</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm font-semibold text-green-800">✓</div>
                <span className="text-sm font-medium text-gray-700">출석</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-pink-100">
                <div className="w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center text-sm font-semibold text-pink-800">✗</div>
                <span className="text-sm font-medium text-gray-700">불참/미정</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">미래/예정</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">취소된 경기</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttendanceStatus; 