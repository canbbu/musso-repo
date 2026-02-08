import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/shared/components/ui/button';
import { CalendarIcon, Filter, CalendarRange } from "lucide-react";
import StatCard from '@/features/stats/components/stats/StatCard';
import RankingTable from '@/features/stats/components/stats/RankingTable';
import { usePlayerRankings, type DateRangeFilter } from '@/features/stats/hooks/use-player-rankings';
import Layout from '@/shared/components/layout/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';

const PlayerStats = () => {
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  
  // 현재 연도·월 (해당 달 기본값용)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1~12
  
  // 필터링 상태 - 기본값: 해당 달(현재 연도·현재 월)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(currentMonth);
  // 사용자 지정 기간 필터 (필요 시에만 사용)
  const [customDateRange, setCustomDateRange] = useState<DateRangeFilter | null>(null);
  // 기간 필터 설정 다이얼로그
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [rangeStartYear, setRangeStartYear] = useState(currentYear);
  const [rangeStartMonth, setRangeStartMonth] = useState(1);
  const [rangeEndYear, setRangeEndYear] = useState(currentYear);
  const [rangeEndMonth, setRangeEndMonth] = useState(currentMonth);
  
  // 연도 옵션 (최근 3년)
  const yearOptions = [
    { value: "all", label: '전체 연도' },
    { value: currentYear.toString(), label: `${currentYear}년` },
    { value: (currentYear - 1).toString(), label: `${currentYear - 1}년` },
    { value: (currentYear - 2).toString(), label: `${currentYear - 2}년` }
  ];
  
  // 연도 옵션 중복 제거
  const uniqueYearOptions = yearOptions.filter((option, index, self) => 
    index === self.findIndex((o) => o.value === option.value)
  );
  
  // 월 옵션
  const monthOptions = [
    { value: "all", label: '전체 월' },
    { value: "1", label: '1월' },
    { value: "2", label: '2월' },
    { value: "3", label: '3월' },
    { value: "4", label: '4월' },
    { value: "5", label: '5월' },
    { value: "6", label: '6월' },
    { value: "7", label: '7월' },
    { value: "8", label: '8월' },
    { value: "9", label: '9월' },
    { value: "10", label: '10월' },
    { value: "11", label: '11월' },
    { value: "12", label: '12월' }
  ];
  
  // 필터링된 데이터 가져오기 (기간 필터가 있으면 해당 기간 우선 적용)
  const {
    activeTab,
    setActiveTab,
    powerRanking,
    goalRanking,
    assistRanking,
    attendanceRanking,
    cleansheetRanking,
    getCurrentRanking,
    getPrevRanking,
    hasPrevPeriod,
    loading
  } = usePlayerRankings(selectedYear, selectedMonth, customDateRange);

  // 연도 변경 핸들러
  const handleYearChange = (value: string) => {
    setSelectedYear(value === "all" ? undefined : parseInt(value));
  };

  // 월 변경 핸들러
  const handleMonthChange = (value: string) => {
    if(selectedYear === undefined){
      alert("연도를 먼저 선택해주세요.");
      return;
    }
    setSelectedMonth(value === "all" ? undefined : parseInt(value));
  };

  // 기간 필터 적용 (다이얼로그에서 적용 클릭 시)
  const handleApplyDateRange = () => {
    const startDate = new Date(rangeStartYear, rangeStartMonth - 1, 1);
    const endDate = new Date(rangeEndYear, rangeEndMonth, 0); // 해당 월 마지막 날
    if (startDate > endDate) {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    const start = `${rangeStartYear}-${String(rangeStartMonth).padStart(2, '0')}-01`;
    // 종료일은 로컬 날짜로 포맷 (toISOString()은 UTC라 한국 시간에서 하루 빠짐 → 12월이 12/30으로 나오는 문제 방지)
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    setCustomDateRange({ start, end });
    setShowDateRangeDialog(false);
  };

  // 기간 필터 해제
  const handleClearDateRange = () => {
    setCustomDateRange(null);
  };

  // 기간 필터 적용 시 표시할 라벨 (예: 2025년 1월 ~ 2025년 9월)
  const dateRangeLabel = customDateRange
    ? (() => {
        const s = customDateRange.start.split('-');
        const e = customDateRange.end.split('-');
        return `${s[0]}년 ${parseInt(s[1], 10)}월 ~ ${e[0]}년 ${parseInt(e[1], 10)}월`;
      })()
    : null;

  return (
    <Layout>
      <div className="player-stats-container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">선수 통계</h1>
          <p className="text-gray-600">연도·월을 선택하면 해당 기간의 파워랭킹과 득점·어시스트·출석률·철벽지수를 확인할 수 있습니다.</p>
          
          {/* 기간 필터 (파워랭킹 등 모든 랭킹에 적용) */}
          <div className="flex flex-wrap gap-4 mt-4 mb-4 items-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">기간:</span>
            </div>
            
            <Select
              value={selectedYear !== undefined ? selectedYear.toString() : "all"}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="연도 선택" />
              </SelectTrigger>
              <SelectContent>
                {uniqueYearOptions.map((option) => (
                  <SelectItem 
                    key={option.label} 
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedMonth !== undefined ? selectedMonth.toString() : "all"}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem 
                    key={option.label} 
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(selectedYear !== undefined || selectedMonth !== undefined) && !customDateRange && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedYear(undefined);
                  setSelectedMonth(undefined);
                }}
                className="flex items-center gap-1"
              >
                <Filter className="h-3.5 w-3.5" />
                필터 초기화
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateRangeDialog(true)}
              className="flex items-center gap-1"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              기간 필터 적용
            </Button>
            {customDateRange && (
              <>
                <span className="text-sm text-muted-foreground">
                  적용 중: <strong>{dateRangeLabel}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDateRange}
                  className="flex items-center gap-1 text-muted-foreground"
                >
                  기간 필터 해제
                </Button>
              </>
            )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              파워랭킹: 출석 1경기당 2pt + 득점 1pt + 어시스트 1pt + 철벽지수 1pt
            </p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            {/* 탭 버튼: 파워랭킹 · 득점 · 어시스트 · 출석률 · 철벽지수 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              <StatCard 
                type="power" 
                isActive={activeTab === 'power'} 
                topPlayer={powerRanking[0]} 
                onClick={() => setActiveTab('power')} 
              />
              <StatCard 
                type="goals" 
                isActive={activeTab === 'goals'} 
                topPlayer={goalRanking[0]} 
                onClick={() => setActiveTab('goals')} 
              />
              <StatCard 
                type="assists" 
                isActive={activeTab === 'assists'} 
                topPlayer={assistRanking[0]} 
                onClick={() => setActiveTab('assists')} 
              />
              <StatCard 
                type="attendance" 
                isActive={activeTab === 'attendance'} 
                topPlayer={attendanceRanking[0]} 
                onClick={() => setActiveTab('attendance')} 
              />
              <StatCard 
                type="cleansheet" 
                isActive={activeTab === 'cleansheet'} 
                topPlayer={cleansheetRanking[0]} 
                onClick={() => setActiveTab('cleansheet')} 
              />
            </div>
            
            <RankingTable
              activeTab={activeTab}
              players={getCurrentRanking()}
              prevRanking={activeTab === 'power' ? getPrevRanking() : undefined}
            />
          </>
        )}

        {/* 기간 필터 설정 다이얼로그 */}
        <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>기간 필터 설정</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              통계를 조회할 기간의 시작·종료 연도/월을 선택하세요. (예: 2025년 1월 ~ 2025년 9월)
            </p>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>시작</Label>
                  <div className="flex gap-2">
                    <Select
                      value={rangeStartYear.toString()}
                      onValueChange={(v) => setRangeStartYear(parseInt(v, 10))}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueYearOptions.filter((o) => o.value !== 'all').map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={rangeStartMonth.toString()}
                      onValueChange={(v) => setRangeStartMonth(parseInt(v, 10))}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.filter((m) => m.value !== 'all').map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>종료</Label>
                  <div className="flex gap-2">
                    <Select
                      value={rangeEndYear.toString()}
                      onValueChange={(v) => setRangeEndYear(parseInt(v, 10))}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueYearOptions.filter((o) => o.value !== 'all').map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={rangeEndMonth.toString()}
                      onValueChange={(v) => setRangeEndMonth(parseInt(v, 10))}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.filter((m) => m.value !== 'all').map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDateRangeDialog(false)}>
                취소
              </Button>
              <Button onClick={handleApplyDateRange}>
                적용
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PlayerStats;
