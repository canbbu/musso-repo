import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/shared/components/layout/Layout';
import { usePlayerRankings } from '@/features/stats/hooks/use-player-rankings';
import { supabase } from '@/shared/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Goal, Trophy, CalendarCheck, Star, Award, Crown } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

type RankingType = 'goals' | 'assists' | 'attendance' | 'rating';

interface RankingSectionProps {
  type: RankingType;
  players: any[];
  year?: number;
}

const RankingSection = ({ type, players }: RankingSectionProps) => {
  const getLabel = () => {
    switch (type) {
      case 'goals':
        return '득점';
      case 'assists':
        return '어시스트';
      case 'attendance':
        return '출석률';
      case 'rating':
        return '평점';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'goals':
        return <Goal className="text-green-500 h-5 w-5" />;
      case 'assists':
        return <Trophy className="text-blue-500 h-5 w-5" />;
      case 'attendance':
        return <CalendarCheck className="text-yellow-500 h-5 w-5" />;
      case 'rating':
        return <Star className="text-orange-500 h-5 w-5" />;
    }
  };

  const getValue = (player: any) => {
    switch (type) {
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'attendance':
        return `${player.attendance}%`;
      case 'rating':
        return player.rating.toFixed(1);
      default:
        return 0;
    }
  };

  const getSortValue = (player: any) => {
    switch (type) {
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'attendance':
        return player.attendance;
      case 'rating':
        return player.rating;
      default:
        return 0;
    }
  };

  // 순위 계산 함수
  const calculateRank = (playerIndex: number, sortedPlayers: any[]): number => {
    const currentPlayer = sortedPlayers[playerIndex];
    const currentValue = getSortValue(currentPlayer);

    // 현재 플레이어와 같은 수치를 가진 첫 번째 플레이어의 인덱스를 찾기
    let firstSameValueIndex = playerIndex;
    for (let i = 0; i < playerIndex; i++) {
      const comparePlayer = sortedPlayers[i];
      const compareValue = getSortValue(comparePlayer);

      if (compareValue === currentValue) {
        firstSameValueIndex = i;
        break;
      }
    }

    return firstSameValueIndex + 1;
  };

  // 카테고리별: 해당 데이터가 있는 선수만 표시. 출석률·평점은 전체 회원
  let filteredPlayers: any[];
  switch (type) {
    case 'goals':
      filteredPlayers = players.filter((p) => (Number(p.goals) || 0) > 0);
      break;
    case 'assists':
      filteredPlayers = players.filter((p) => (Number(p.assists) || 0) > 0);
      break;
    case 'attendance':
    case 'rating':
      filteredPlayers = [...players]; // 출석률·평점: 모든 회원
      break;
    default:
      filteredPlayers = [...players];
  }

  // 평점 랭킹은 경기 수 21경기 이상인 사람들만 필터링
  if (type === 'rating') {
    filteredPlayers = filteredPlayers.filter((player: any) => player.games >= 21);
  }
  
  let sortedPlayers = filteredPlayers.sort((a, b) => {
    const aValue = getSortValue(a);
    const bValue = getSortValue(b);
    
    // 출석률과 평점은 출석률/평점 높은 순으로 먼저 정렬, 동점일 경우 경기 수 많은 순
    if (type === 'attendance' || type === 'rating') {
      // 1차 정렬: 출석률/평점 높은 순
      if (bValue !== aValue) {
        return bValue - aValue;
      }
      // 2차 정렬: 경기 수 많은 순
      return b.games - a.games;
    }
    
    // 득점, 어시스트는 기존 로직 유지
    if (bValue !== aValue) {
      return bValue - aValue;
    }
    
    // 동점일 경우 경기 수로 정렬
    return a.games - b.games; // 경기 수 적은 순
  });
  
  // 득점, 어시스트는 3등까지만 표시
  // 출석률, 평점은 동점자 모두 표시 (상위 3등 그룹에 포함된 모든 동점자)
  if (type === 'goals' || type === 'assists') {
    sortedPlayers = sortedPlayers.slice(0, 3);
  } else {
    // 출석률, 평점: 상위 3등 그룹에 포함된 모든 동점자 표시
    if (sortedPlayers.length > 0) {
      const top3Value = getSortValue(sortedPlayers[2] || sortedPlayers[sortedPlayers.length - 1]);
      sortedPlayers = sortedPlayers.filter((player, index) => {
        if (index < 3) return true; // 상위 3명은 항상 포함
        const playerValue = getSortValue(player);
        return playerValue === top3Value; // 3등과 동점인 경우 포함
      });
    }
  }

  // 순위에 따른 배경색
  const getRankBackground = (rank: number): string => {
    if (rank <= 3) {
      return 'bg-gray-50';
    }
    return '';
  };

  // 메달 표시 컴포넌트
  const MedalBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full shadow-lg border-2 border-yellow-300">
          <span className="font-bold text-lg">🥇</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-full shadow-lg border-2 border-gray-200">
          <span className="font-bold text-lg">🥈</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-full shadow-lg border-2 border-amber-400">
          <span className="font-bold text-lg">🥉</span>
        </div>
      );
    }
    return (
      <span className="text-gray-600 font-semibold">{rank}</span>
    );
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center justify-center gap-2">
          {getIcon()}
          <span className="text-xl">{getLabel()} 랭킹</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">순위</TableHead>
              <TableHead>선수</TableHead>
              <TableHead className="text-center">경기</TableHead>
              <TableHead className="text-center font-bold">
                {getLabel()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              sortedPlayers.map((player, index) => {
                const rank = calculateRank(index, sortedPlayers);
                return (
                  <TableRow 
                    key={player.id} 
                    className={getRankBackground(rank)}
                  >
                    <TableCell className="text-center">
                      <MedalBadge rank={rank} />
                    </TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell className="text-center text-gray-600">
                      {player.games}경기
                    </TableCell>
                    <TableCell className="text-center font-bold text-lg">
                      {getValue(player)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

interface MVPData {
  id: string;
  player_id: string;
  reason: string;
  created_at: string;
  mvp_type: 'weekly' | 'monthly' | 'yearly';
  year: number;
  week?: number;
  month?: number;
}

const SeasonRankings = () => {
  const seasonYear = 2025;
  const [mvpData, setMvpData] = useState<MVPData[]>([]);
  const [mvpLoading, setMvpLoading] = useState(true);

  const {
    goalRanking,
    assistRanking,
    attendanceRanking,
    ratingRanking,
    loading,
    players
  } = usePlayerRankings(seasonYear);

  // MVP 데이터 가져오기
  useEffect(() => {
    const fetchMVPData = async () => {
      try {
        setMvpLoading(true);
        const { data, error } = await supabase
          .from('mvp')
          .select('*')
          .eq('year', seasonYear)
          .in('mvp_type', ['weekly', 'monthly'])
          .order('month', { ascending: true, nullsFirst: false })
          .order('week', { ascending: true, nullsFirst: false });

        if (error) throw error;
        setMvpData(data || []);
      } catch (error) {
        console.error('Error fetching MVP data:', error);
      } finally {
        setMvpLoading(false);
      }
    };

    fetchMVPData();
  }, []);

  // 선수 정보 가져오기
  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player?.name || '알 수 없는 선수';
  };

  // 주차를 기반으로 월 계산하는 함수
  const getMonthFromWeek = (year: number, week: number): number => {
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay();
    const daysToFirstMonday = jan1DayOfWeek === 0 ? 1 : (8 - jan1DayOfWeek);
    const firstMondayOfYear = new Date(year, 0, 1 + daysToFirstMonday);
    const targetWeekMonday = new Date(firstMondayOfYear);
    targetWeekMonday.setDate(firstMondayOfYear.getDate() + (week - 1) * 7);
    return targetWeekMonday.getMonth() + 1;
  };

  // 월별로 MVP 데이터 그룹화
  const groupedMVPs = useMemo(() => {
    const grouped: Record<number, { monthly: MVPData[], weekly: MVPData[] }> = {};

    mvpData.forEach(mvp => {
      // 월간 MVP
      if (mvp.mvp_type === 'monthly' && mvp.month) {
        if (!grouped[mvp.month]) {
          grouped[mvp.month] = { monthly: [], weekly: [] };
        }
        grouped[mvp.month].monthly.push(mvp);
      }
      
      // 주간 MVP
      if (mvp.mvp_type === 'weekly') {
        let targetMonth = mvp.month;
        
        if (!targetMonth && mvp.week) {
          targetMonth = getMonthFromWeek(mvp.year, mvp.week);
        } else if (!targetMonth) {
          targetMonth = new Date(mvp.created_at).getMonth() + 1;
        }
        
        if (!grouped[targetMonth]) {
          grouped[targetMonth] = { monthly: [], weekly: [] };
        }
        grouped[targetMonth].weekly.push(mvp);
      }
    });

    return grouped;
  }, [mvpData]);

  // 월 이름 반환
  const getMonthName = (month: number) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month - 1];
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              2025 무쏘 시즌 종료 랭킹
            </h1>
            <p className="text-gray-600">각종 랭킹을 한눈에 확인하세요</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <RankingSection type="goals" players={goalRanking} year={seasonYear} />
              <RankingSection type="assists" players={assistRanking} year={seasonYear} />
              <RankingSection type="attendance" players={attendanceRanking} year={seasonYear} />
              <RankingSection type="rating" players={ratingRanking} year={seasonYear} />
            </div>

            {/* MVP 섹션 */}
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Crown className="h-8 w-8 text-yellow-500" />
                MVP 기록
              </h2>
              
              {mvpLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">MVP 데이터를 불러오는 중입니다...</p>
                </div>
              ) : Object.keys(groupedMVPs).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    MVP 기록이 없습니다
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 월간 MVP 테이블 */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-amber-600" />
                        <span>월간 MVP</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">월</TableHead>
                            <TableHead>선수</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(groupedMVPs)
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .flatMap(([month, mvps]) =>
                              mvps.monthly.map((mvp) => (
                                <TableRow key={mvp.id}>
                                  <TableCell className="font-semibold text-amber-700">
                                    {getMonthName(parseInt(month))}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {getPlayerName(mvp.player_id)}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          {Object.values(groupedMVPs).every(mvps => mvps.monthly.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                                월간 MVP 기록이 없습니다
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* 주간 MVP 테이블 */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-blue-600" />
                        <span>주간 MVP</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="max-h-[600px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead className="w-[80px]">주차</TableHead>
                              <TableHead>선수</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(groupedMVPs)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .flatMap(([month, mvps]) =>
                                mvps.weekly
                                  .sort((a, b) => (a.week || 0) - (b.week || 0))
                                  .map((mvp) => (
                                    <TableRow key={mvp.id}>
                                      <TableCell className="font-semibold text-blue-700">
                                        {mvp.week ? `${mvp.week}주` : '-'}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {getPlayerName(mvp.player_id)}
                                      </TableCell>
                                    </TableRow>
                                  ))
                              )}
                            {Object.values(groupedMVPs).every(mvps => mvps.weekly.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                                  주간 MVP 기록이 없습니다
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SeasonRankings;

