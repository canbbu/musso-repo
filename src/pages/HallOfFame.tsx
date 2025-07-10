import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, Trophy, Award, Star } from 'lucide-react';
import FlipPlayerCard from '@/components/FlipPlayerCard';

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

interface PlayerInfo {
  id: string;
  name: string;
  position?: string;
  rating?: number;
  pac?: number;
  sho?: number;
  pas?: number;
  dri?: number;
  def?: number;
  phy?: number;
  boots_brand?: string;
  favorite_team?: string;
}

const HallOfFame = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [mvpData, setMvpData] = useState<MVPData[]>([]);
  const [loading, setLoading] = useState(true);

  // 선수 데이터 가져오기
  const { players } = usePlayerRankings();

  // 주차를 기반으로 월 계산하는 함수
  const getMonthFromWeek = (year: number, week: number): number => {
    // 해당 연도의 1월 1일
    const jan1 = new Date(year, 0, 1);
    
    // 1월 1일의 요일 (0=일요일, 1=월요일, ...)
    const jan1DayOfWeek = jan1.getDay();
    
    // 첫 번째 주의 시작일 계산 (월요일 기준)
    // 만약 1월 1일이 목요일 이후라면 다음 주가 첫 번째 주
    const daysToFirstMonday = jan1DayOfWeek === 0 ? 1 : (8 - jan1DayOfWeek);
    const firstMondayOfYear = new Date(year, 0, 1 + daysToFirstMonday);
    
    // 해당 주차의 월요일 날짜 계산
    const targetWeekMonday = new Date(firstMondayOfYear);
    targetWeekMonday.setDate(firstMondayOfYear.getDate() + (week - 1) * 7);
    
    return targetWeekMonday.getMonth() + 1; // 0-based에서 1-based로 변환
  };

  // MVP 데이터 가져오기
  useEffect(() => {
    const fetchMVPData = async () => {
      try {
        setLoading(true);

        // 연도별로만 필터링하고, 월 필터링은 클라이언트에서 처리
        let query = supabase
          .from('mvp')
          .select('*')
          .eq('year', selectedYear)
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // 클라이언트 사이드에서 월 필터링
        let filteredData = data || [];
        
        if (selectedMonth) {
          filteredData = filteredData.filter(mvp => {
            // 월간 MVP의 경우 month 필드 사용
            if (mvp.mvp_type === 'monthly') {
              return mvp.month === selectedMonth;
            }
            
            // 주간 MVP의 경우 month 필드가 있으면 사용, 없으면 주차로 월 계산
            if (mvp.mvp_type === 'weekly') {
              if (mvp.month) {
                return mvp.month === selectedMonth;
              } else if (mvp.week) {
                const calculatedMonth = getMonthFromWeek(mvp.year, mvp.week);
                return calculatedMonth === selectedMonth;
              } else {
                // week도 없으면 created_at에서 월 추출
                const createdMonth = new Date(mvp.created_at).getMonth() + 1;
                return createdMonth === selectedMonth;
              }
            }
            
            return false;
          });
        }
        
        setMvpData(filteredData);
      } catch (error) {
        console.error('Error fetching MVP data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMVPData();
  }, [selectedYear, selectedMonth]);

  // 선수 정보 매핑
  const getPlayerInfo = (playerId: string): PlayerInfo => {
    const player = players.find(p => p.id === playerId);
    return {
      id: playerId,
      name: player?.name || '알 수 없는 선수',
      position: player?.position,
      rating: player?.rating,
      pac: player?.pac,
      sho: player?.sho,
      pas: player?.pas,
      dri: player?.dri,
      def: player?.def,
      phy: player?.phy,
      boots_brand: player?.boots_brand,
      favorite_team: player?.favorite_team
    };
  };

  // 월별로 MVP 데이터 그룹화
  const groupedMVPs = useMemo(() => {
    const grouped: Record<number, { monthly: MVPData[], weekly: MVPData[] }> = {};

    mvpData.forEach(mvp => {
      // 월간 MVP는 month 필드를 사용
      if (mvp.mvp_type === 'monthly' && mvp.month) {
        if (!grouped[mvp.month]) {
          grouped[mvp.month] = { monthly: [], weekly: [] };
        }
        grouped[mvp.month].monthly.push(mvp);
      }
      
      // 주간 MVP는 week 필드를 사용하여 월 계산
      if (mvp.mvp_type === 'weekly') {
        let targetMonth = mvp.month;
        
        // month 필드가 없으면 주차로 월 계산
        if (!targetMonth) {
          if (mvp.week) {
            targetMonth = getMonthFromWeek(mvp.year, mvp.week);
          } else {
            // week도 없으면 created_at에서 월 추출 (fallback)
            targetMonth = new Date(mvp.created_at).getMonth() + 1;
          }
        }
        
        if (!grouped[targetMonth]) {
          grouped[targetMonth] = { monthly: [], weekly: [] };
        }
        grouped[targetMonth].weekly.push(mvp);
      }
    });

    return grouped;
  }, [mvpData]);

  // 연도 옵션 생성 (2023년부터 현재년도까지)
  const yearOptions = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i);

  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 월 이름 반환
  const getMonthName = (month: number) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month - 1];
  };

  // 주차 표시
  const getWeekText = (week?: number) => {
    if (!week) return '';
    return `${week}주차`;
  };

  // MVP 카드 컴포넌트 - FlipPlayerCard 사용
  const MVPPlayerCard = ({ mvp, type }: { mvp: MVPData; type: 'monthly' | 'weekly' }) => {
    const player = getPlayerInfo(mvp.player_id);
    const isMonthly = type === 'monthly';
    
    return (
      <div className="relative">
        {/* 선수 카드 */}
        <div 
          className={`transform transition-transform duration-300 ease-in-out hover:scale-125 hover:z-50 relative ${
            !isMonthly ? 'scale-50 sm:scale-60 md:scale-75' : 'scale-75 sm:scale-90 md:scale-100'
          }`}
        >
          {/* MVP 배지 */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-30">
            <Badge 
              className={`${
                isMonthly 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 border-yellow-300 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-300 text-white shadow-lg'
              } px-1.5 py-0.5 text-xs font-bold whitespace-nowrap`}
            >
              {isMonthly ? (
                <Crown className="w-2.5 h-2.5 mr-1" />
              ) : (
                <Star className="w-2.5 h-2.5 mr-1" />
              )}
              <span className="hidden sm:inline">{isMonthly ? '월간 MVP' : `${getWeekText(mvp.week)} MVP`}</span>
              <span className="sm:hidden">{isMonthly ? '월간' : `${mvp.week}주`}</span>
            </Badge>
          </div>
          
          <FlipPlayerCard
            name={player.name}
            position={player.position || 'MID'}
            rating={player.rating || 70}
            pacStat={player.pac || 70}
            shoStat={player.sho || 70}
            pasStat={player.pas || 70}
            driStat={player.dri || 70}
            defStat={player.def || 70}
            phyStat={player.phy || 70}
            bootsBrand={player.boots_brand ? `/images/brand/${player.boots_brand}.jpg` : undefined}
            favoriteTeam={player.favorite_team ? `/images/club/${player.favorite_team}.jpg` : undefined}
            teamLogo={`/images/무쏘_누끼.jpg`}
            playerImageUrl={player.name ? `/images/member/${player.name}.jpg` : undefined}
          />
        </div>
      </div>
    );
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
      <div className="space-y-6 sm:space-y-8 p-1">
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                명예의 전당
              </h1>
              <p className="text-sm sm:text-base text-gray-600">우수한 활동으로 인정받은 선수들의 영예로운 기록들을 만나보세요</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs sm:text-sm bg-white/80 backdrop-blur-sm border-yellow-300 text-yellow-700">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                MVP 기록
              </Badge>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-t-lg p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              필터 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  연도
                </label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100">
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
                  <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {monthOptions.map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MVP 목록 */}
        {Object.keys(groupedMVPs).length === 0 ? (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8 sm:p-16 text-center">
              <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">MVP 기록이 없습니다</h3>
              <p className="text-sm sm:text-base text-gray-500">
                {selectedMonth 
                  ? `${selectedYear}년 ${getMonthName(selectedMonth)}에 선정된 MVP가 없습니다.`
                  : `${selectedYear}년에 선정된 MVP가 없습니다.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedMVPs)
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // 최신 월부터 표시
              .map(([month, mvps]) => (
                <Card key={month} className="shadow-xl border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      {selectedYear}년 {getMonthName(parseInt(month))}
                      <div className="ml-auto text-sm font-normal text-gray-500">
                        월간 MVP {mvps.monthly.length}명 · 주간 MVP {mvps.weekly.length}명
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                      {/* 월간 MVP */}
                      {mvps.monthly.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center justify-center lg:justify-start gap-2">
                            <Crown className="w-5 h-5 text-yellow-600" />
                            월간 MVP
                          </h3>
                          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                            {mvps.monthly.map(mvp => (
                              <MVPPlayerCard key={mvp.id} mvp={mvp} type="monthly" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 주간 MVP */}
                      {mvps.weekly.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center justify-center lg:justify-start gap-2">
                            <Star className="w-5 h-5 text-blue-600" />
                            주간 MVP
                          </h3>
                          <div className="flex justify-center items-center overflow-visible px-16">
                            {mvps.weekly
                              .sort((a, b) => (b.week || 0) - (a.week || 0)) // 최신 주차부터
                              .map((mvp, index) => (
                                <div 
                                  key={mvp.id} 
                                  className={`relative ${index > 0 ? '-ml-40 sm:-ml-48 md:-ml-44 lg:-ml-40' : ''}`}
                                  style={{ 
                                    zIndex: mvps.weekly.length - index,
                                    transition: 'transform 0.3s ease-in-out'
                                  }}
                                >
                                  <MVPPlayerCard mvp={mvp} type="weekly" />
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HallOfFame; 