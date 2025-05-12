import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Star, User, CalendarIcon, Filter } from "lucide-react";
import StatCard from '@/components/stats/StatCard';
import RankingTable from '@/components/stats/RankingTable';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import Layout from '@/components/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PlayerStats = () => {
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  
  // 현재 연도 계산
  const currentYear = new Date().getFullYear();
  
  // 필터링 상태
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  
  // 연도 옵션 (최근 3년)
  const yearOptions = [
    { value: "all", label: '전체 연도' },
    { value: currentYear.toString(), label: `${currentYear}년` },
    { value: (currentYear - 1).toString(), label: `${currentYear - 1}년` },
    { value: (currentYear - 2).toString(), label: `${currentYear - 2}년` }
  ];
  
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
    goalRanking,
    assistRanking,
    attendanceRanking,
    ratingRanking,
    getCurrentRanking,
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
          <h1 className="text-3xl font-bold mb-2">시즌 랭킹</h1>
          <p className="text-gray-600">선수들의 시즌 기록과 순위를 확인하세요.</p>
          
          {/* 필터 UI */}
          <div className="flex flex-wrap gap-4 mt-4 mb-4 items-center">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">기간:</span>
            </div>
            
            <Select
              value={selectedYear !== undefined ? selectedYear.toString() : "all"}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="전체 연도" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
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
                <SelectValue placeholder="전체 월" />
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
            
            {/* 필터 리셋 버튼 */}
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
          
          <div className="flex gap-4 mt-4">
            <Button onClick={() => navigate('/my-stats')} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              내 기록 보기
            </Button>
            
            {canManagePlayerStats() && (
              <Button onClick={() => navigate('/stats-management')} className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                선수 기록 관리
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                type="rating" 
                isActive={activeTab === 'rating'} 
                topPlayer={ratingRanking[0]} 
                onClick={() => setActiveTab('rating')} 
              />
            </div>
            
            <RankingTable activeTab={activeTab} players={getCurrentRanking()} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default PlayerStats;
