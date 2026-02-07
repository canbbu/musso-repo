import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/shared/components/ui/button';
import { Star, User, CalendarIcon, Filter } from "lucide-react";
import StatCard from '@/features/stats/components/stats/StatCard';
import RankingTable from '@/features/stats/components/stats/RankingTable';
import { usePlayerRankings } from '@/features/stats/hooks/use-player-rankings';
import Layout from '@/shared/components/layout/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const PlayerStats = () => {
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  
  // 현재 연도·월 (해당 달 기본값용)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1~12
  
  // 필터링 상태 - 기본값: 해당 달(현재 연도·현재 월)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(currentMonth);
  
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
  
  // 필터링된 데이터 가져오기
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
  } = usePlayerRankings(selectedYear, selectedMonth);

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
            
            {(selectedYear !== undefined || selectedMonth !== undefined) && (
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
      </div>
    </Layout>
  );
};

export default PlayerStats;
