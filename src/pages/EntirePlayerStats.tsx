import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter, Trash2, Trophy, Search, EyeIcon, EyeOffIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEntirePlayers } from '@/hooks/use-entire-players';
import { Player } from '@/types/dashboard';

const EntirePlayerStats = () => {
  const {
    players,
    filteredPlayers,
    loading,
    totalCompletedMatches,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedWeek,
    setSelectedWeek,
    filters,
    setFilters,
    deleteDialogOpen,
    setDeleteDialogOpen,
    playerToDelete,
    setPlayerToDelete,
    mvpDialogOpen,
    setMvpDialogOpen,
    mvpType,
    setMvpType, 
    mvpYear,
    setMvpYear,
    mvpMonth,
    setMvpMonth,
    mvpWeek,
    setMvpWeek,
    selectedMvpPlayer,
    setSelectedMvpPlayer,
    mvpReason,
    setMvpReason,
    isMvpSelected,
    yearOptions,
    monthOptions,
    weekOptions,
    mvpTypeOptions,
    resetFilters,
    confirmDelete,
    handleMvpSelect,
    handleFilterChange,
    mvpStatus,
    setMvpStatus,
    setIsMvpSelected
  } = useEntirePlayers();

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showDetailInfo, setShowDetailInfo] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // 컬럼 필터 변경 핸들러
  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      if (value) {
        newFilters[column] = value;
      } else {
        delete newFilters[column];
      }
      return newFilters;
    });
  };

  // 필터링된 선수 목록
  const getFilteredPlayers = () => {
    // columnFilters가 비어있고 filters도 비어있으면 모든 선수 반환
    if (Object.keys(columnFilters).length === 0 && Object.keys(filters).length === 0) {
      return players;
    }

    return players.filter(player => {
      // 모든 컬럼 필터 적용
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        // 빈 필터값은 모든 항목을 통과
        if (!filterValue) return true;
        const playerValue = player[column as keyof typeof player];
        if (playerValue === null || playerValue === undefined) return false;
        return playerValue.toString() === filterValue.toString();
      });
    });
  };

  // 컬럼 필터 리셋
  const resetColumnFilters = () => {
    setColumnFilters({});
  };

  // 모든 필터 리셋
  const resetAllFilters = () => {
    resetFilters();
    resetColumnFilters();
  };

  // 필터 드롭다운을 위한 고유 값 추출
  const getUniqueValues = useMemo(() => {
    const uniqueValues: Record<string, Set<string | number>> = {
      position: new Set(),
      birthday: new Set(),
      boots_brand: new Set(),
      fav_club: new Set(),
      role: new Set(),
      address: new Set(),
    };
    
    players.forEach(player => {
      if (player.position) uniqueValues.position.add(player.position);
      if (player.birthday) uniqueValues.birthday.add(player.birthday);
      if (player.boots_brand) uniqueValues.boots_brand.add(player.boots_brand);
      if (player.fav_club) uniqueValues.fav_club.add(player.fav_club);
      if (player.role) uniqueValues.role.add(player.role);
      if (player.address) uniqueValues.address.add(player.address);
    });
    
    // Set을 정렬된 배열로 변환
    return {
      position: Array.from(uniqueValues.position).sort().filter(value => value !== ""),
      birthday: Array.from(uniqueValues.birthday).sort().filter(value => value !== ""),
      boots_brand: Array.from(uniqueValues.boots_brand).sort().filter(value => value !== ""),
      fav_club: Array.from(uniqueValues.fav_club).sort().filter(value => value !== ""),
      role: Array.from(uniqueValues.role).sort().filter(value => value !== ""),
      address: Array.from(uniqueValues.address).sort().filter(value => value !== ""),
    };
  }, [players]);

  // MVP 선정 기간 필드 렌더링
  const renderMvpPeriodFields = () => {
    return (
      <>
        <div>
          <Label htmlFor="mvp-type">MVP 유형</Label>
          <Select
            value={mvpType}
            onValueChange={(value) => setMvpType(value as 'weekly' | 'monthly' | 'yearly')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="MVP 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              {mvpTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="mvp-year">연도</Label>
          <Select
            value={mvpYear.toString()}
            onValueChange={(value) => setMvpYear(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="연도 선택" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {mvpType === 'monthly' && (
          <div>
            <Label htmlFor="mvp-month">월</Label>
            <Select
              value={mvpMonth.toString()}
              onValueChange={(value) => setMvpMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {mvpType === 'weekly' && (
          <div>
            <Label htmlFor="mvp-week">주차</Label>
            <Select
              value={mvpWeek.toString()}
              onValueChange={(value) => setMvpWeek(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="주차 선택" />
              </SelectTrigger>
              <SelectContent>
                {weekOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    );
  };

  // 컬럼별 필터 헤더 렌더링
  const renderColumnFilterHeader = (title: string, column: keyof typeof players[0]) => {
    // 필터가 필요하지 않은 컬럼들
    if (column === 'name' || column === 'weekly_mvp_count' || column === 'monthly_mvp_count' || column === 'yearly_mvp_count'
        || column === 'goals' || column === 'assists' || column === 'games' || column === 'attendance_rate' || column === 'rating' || column === 'average_rating') {
      return <TableHead>{title}</TableHead>;
    }
    
    const values = getUniqueValues[column as keyof typeof getUniqueValues] || [];
    
    return (
      <TableHead>
        <div>
          <div className="mb-2">{title}</div>
          <Select
            value={columnFilters[column] || 'all'}
            onValueChange={(value) => handleColumnFilterChange(column, value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder={`${title} 선택`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {values.map((value) => (
                <SelectItem key={value.toString()} value={value.toString()}>
                  {value.toString() || '-'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableHead>
    );
  };

  // MVP 버튼 텍스트 가져오기
  const getMvpButtonText = () => {
    if (isMvpSelected) return "이미 MVP가 선정됨";
    
    switch (mvpType) {
      case 'weekly':
        return "주간 MVP 선정하기";
      case 'monthly':
        return "월간 MVP 선정하기";
      case 'yearly':
        return "연간 MVP 선정하기";
      default:
        return "MVP 선정하기";
    }
  };

  // 월 선택 시 연도 체크 후 변경
  const handleMonthChange = (value: string) => {
    if (!selectedYear) {
      window.alert("먼저 연도를 선택해주세요.");
      return;
    }
    setSelectedMonth(value !== "all" ? parseInt(value) : undefined);
  };

  // MVP 다이얼로그 제목 가져오기
  const getMvpDialogTitle = () => {
    switch (mvpType) {
      case 'weekly':
        return `${mvpYear}년 ${mvpWeek}주차 MVP 선정`;
      case 'monthly':
        return `${mvpYear}년 ${mvpMonth}월 MVP 선정`;
      case 'yearly':
        return `${mvpYear}년 MVP 선정`;
      default:
        return "MVP 선정";
    }
  };

  // 역할을 한국어로 변환하는 함수
  const translateRole = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'president': '회장',
      'vice_president': '부회장',
      'player': '일반회원',
      'coach': '감독',
      'assistant_coach': '코치',
      'treasurer':'회계'
    };
    return roleMap[role] || role;
  };

  // 정렬 핸들러
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 선수 목록
  const sortedPlayers = useMemo(() => {
    if (!sortConfig) return filteredPlayers;

    return [...filteredPlayers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Player] || 0;
      const bValue = b[sortConfig.key as keyof Player] || 0;
      
      // 평점 필드는 숫자로 처리
      if (sortConfig.key === 'rating' || sortConfig.key === 'average_rating') {
        const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue.toString()) || 0;
        const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue.toString()) || 0;
        
        if (sortConfig.direction === 'asc') {
          return aNum - bNum;
        }
        return bNum - aNum;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue, 'ko') 
          : bValue.localeCompare(aValue, 'ko');
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredPlayers, sortConfig]);

  // 정렬 아이콘 렌더링
  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '↕';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // 정렬 가능한 컬럼 헤더 렌더링
  const renderSortableHeader = (title: string, key: string, width: string = 'w-[120px]') => {
    return (
      <div 
        className={`p-3 ${width} font-medium border-r cursor-pointer hover:bg-gray-50`}
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center justify-center gap-1">
          {title} <span className="text-gray-400">{renderSortIcon(key)}</span>
        </div>
      </div>
    );
  };

  // 실제 표시할 필터링된 선수들
  const displayPlayers = useMemo(() => {
    return sortedPlayers;
  }, [sortedPlayers]);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">전체 선수 관리</h1>
        <p className="text-gray-600 mb-6">모든 선수의 정보를 확인하고 관리할 수 있습니다.</p>
        
        {/* 필터 UI */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">기간:</span>
            </div>
            
            <Select
              value={selectedYear ? selectedYear.toString() : "all"}
              onValueChange={(value) => setSelectedYear(value !== "all" ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="연도 선택 (전체)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 연도</SelectItem>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedMonth ? selectedMonth.toString() : "all"}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="월 선택 (전체)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 월</SelectItem>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailInfo(!showDetailInfo)}
              className="flex items-center gap-1"
            >
              {showDetailInfo ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
              {showDetailInfo ? "세부 정보 숨기기" : "세부 정보 보기"}
            </Button>
            
            {(Object.keys(filters).length > 0 || Object.keys(columnFilters).length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetAllFilters}
                className="flex items-center gap-1"
              >
                <Filter className="h-3.5 w-3.5" />
                모든 필터 초기화
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            {/* 선수 정보 테이블 */}
            <div className="rounded-md border">
              <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
                <div className="text-sm font-medium">
                  총 선수: {displayPlayers.length}명
                </div>
                <div className="text-sm font-medium">
                  총 경기수: {totalCompletedMatches}경기
                </div>
              </div>
              
              {/* 커스텀 테이블 구현 */}
              <div className="relative">
                {/* 스크롤 컨테이너 - 헤더와 본문을 함께 좌우 스크롤 */}
                <div className="overflow-auto max-h-[65vh]">
                  {/* 테이블 너비를 일관되게 유지하기 위한 컨테이너 */}
                  <div className="inline-block min-w-full">
                    {/* 고정 헤더 - 세로 스크롤에만 고정, 가로 스크롤에는 함께 이동 */}
                    <div className="sticky top-0 z-20 bg-white border-b" style={{ position: 'sticky', top: 0 }}>
                      <div className="flex">
                        {/* <div className="sticky left-0 bg-white z-30 w-[120px] p-3 font-medium border-r" style={{ position: 'sticky', left: 0 }}>
                          이름
                        </div> */}
                        {renderSortableHeader('이름', 'name')}
                        {renderSortableHeader('포지션', 'position')}
                        {renderSortableHeader('역할할', 'role')}
                        {renderSortableHeader('경기수', 'games')}
                        {renderSortableHeader('골', 'goals')}
                        {renderSortableHeader('어시스트', 'assists')}
                        {renderSortableHeader('출석률(%)', 'attendance_rate')}
                        {renderSortableHeader('평균 평점', 'average_rating')}
                        {/* <div className="p-3 w-[80px] font-medium border-r text-center">경기수</div>
                        <div className="p-3 w-[80px] font-medium border-r text-center">골</div>
                        <div className="p-3 w-[80px] font-medium border-r text-center">어시스트</div>
                        <div className="p-3 w-[100px] font-medium border-r text-center">출석률(%)</div>
                        <div className="p-3 w-[100px] font-medium border-r text-center">평균 평점</div> */}
                        
                        {showDetailInfo && (
                          <>
                            {renderSortableHeader('생년월일', 'birthday')}
                            {renderSortableHeader('신발 브랜드', 'boots_brand')}
                            {renderSortableHeader('선호 구단', 'fav_club')}
                            {renderSortableHeader('주소', 'address')}
                            {renderSortableHeader('주간 MVP 수', 'weekly_mvp_count', 'w-[100px]')}
                            {renderSortableHeader('월간 MVP 수', 'monthly_mvp_count', 'w-[100px]')}
                            {renderSortableHeader('연간 MVP 수', 'yearly_mvp_count', 'w-[100px]')}
                          </>
                        )}
                        
                        <div className="sticky right-0 bg-white z-30 p-3 w-[80px] font-medium" style={{ position: 'sticky', right: 0 }}>
                          관리
                        </div>
                      </div>
                    </div>
                    
                    {/* 테이블 본문 */}
                    <div>
                      {displayPlayers.length > 0 ? (
                        displayPlayers.map((player) => (
                          <div key={player.id} className="flex hover:bg-gray-50 border-b">
                            <div className="sticky left-0 bg-white z-10 w-[120px] p-3 font-medium border-r" style={{ position: 'sticky', left: 0 }}>
                              {player.name || '-'}
                            </div>
                            <div className="p-3 w-[120px] border-r">{player.position || '-'}</div>
                            <div className="p-3 w-[120px] border-r">{translateRole(player.role)}</div>
                            <div className="p-3 w-[120px] border-r text-center">{player.games || 0}</div>
                            <div className="p-3 w-[120px] border-r text-center">{player.goals || 0}</div>
                            <div className="p-3 w-[120px] border-r text-center">{player.assists || 0}</div>
                            <div className="p-3 w-[120px] border-r text-center">{player.attendance_rate || 0}%</div>
                            <div className="p-3 w-[120px] border-r text-center">{player.rating || 0}</div>
                            {showDetailInfo && (
                              <>
                                <div className="p-3 w-[120px] border-r">{player.birthday || '-'}</div>
                                <div className="p-3 w-[120px] border-r">{player.boots_brand || '-'}</div>
                                <div className="p-3 w-[120px] border-r">{player.fav_club || '-'}</div>
                                <div className="p-3 w-[120px] border-r">{player.address || '-'}</div>
                                <div className="p-3 w-[100px] border-r text-center">{player.weekly_mvp_count || 0}</div>
                                <div className="p-3 w-[100px] border-r text-center">{player.monthly_mvp_count || 0}</div>
                                <div className="p-3 w-[100px] border-r text-center">{player.yearly_mvp_count || 0}</div>
                              </>
                            )}
                            <div className="sticky right-0 bg-white z-10 p-3 w-[80px] flex justify-center" style={{ position: 'sticky', right: 0 }}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setPlayerToDelete(player.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          검색 결과가 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* MVP 선정 카드 */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  MVP 선정
                </CardTitle>
                <CardDescription>
                  주간, 월간, 연간 MVP를 선정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap gap-4 items-end">
                    {renderMvpPeriodFields()}
                    
                    <div className="flex-1">
                      <Button
                        onClick={() => setMvpDialogOpen(true)}
                        disabled={isMvpSelected}
                        className="w-full"
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        {getMvpButtonText()}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>선수 삭제</DialogTitle>
                  <DialogDescription>
                    정말로 이 선수를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    취소
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    예, 삭제합니다
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* MVP 선정 다이얼로그 */}
            <Dialog open={mvpDialogOpen} onOpenChange={setMvpDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{getMvpDialogTitle()}</DialogTitle>
                  <DialogDescription>
                    MVP로 선정할 선수를 선택하고 선정 이유를 작성해주세요.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-select">선수 선택</Label>
                    <Select
                      value={selectedMvpPlayer}
                      onValueChange={setSelectedMvpPlayer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MVP 선수 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mvp-reason">선정 이유</Label>
                    <Textarea
                      id="mvp-reason"
                      placeholder="이 선수가 MVP로 선정된 이유를 작성해주세요."
                      value={mvpReason}
                      onChange={(e) => setMvpReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMvpDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleMvpSelect}>
                    선정 완료
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </Layout>
  );
};

export default EntirePlayerStats;