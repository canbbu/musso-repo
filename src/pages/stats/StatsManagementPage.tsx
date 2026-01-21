import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/shared/hooks/use-toast';
import { AlertCircle, ArrowLeft, Edit3, Lock, Unlock } from 'lucide-react';
import { usePlayerStats } from '@/features/stats/hooks/use-player-stats';
import MatchSelector from '@/features/stats/components/stats/MatchSelector';
import StatsCard from '@/features/stats/components/stats/StatsCard';
import NoMatchesInfo from '@/features/matches/components/match/NoMatchesInfo';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { supabase } from '@/shared/lib/supabase/client';
import type { Match } from '@/types/dashboard';

const StatsManagement = () => {
  const { canManagePlayerStats } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoadingTacticsData, setIsLoadingTacticsData] = useState(false);
  const [tacticsDataLoaded, setTacticsDataLoaded] = useState(false);
  const [isFromTactics, setIsFromTactics] = useState(false);
  const [canEditStats, setCanEditStats] = useState(true);
  const [isEditPeriodExpired, setIsEditPeriodExpired] = useState(false);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const {
    matches,
    selectedMatch,
    setSelectedMatch,
    playerStats,
    isLoading,
    handleStatChange,
    handleAttendanceChange,
    formatDate
  } = usePlayerStats();

  const playerStatsForUI = playerStats.map(stat => ({
    ...stat,
    attended: stat.attendanceStatus === 'attending',
  }));
  
  const handleStatChangeForUI = (
    playerId: string,
    field: keyof typeof playerStatsForUI[0] | 'attended',
    value: any
  ) => {
    if (field === 'attended') {
      // 작전판에서 온 경우 출석 변경 불가
      if (isFromTactics) return;
      handleAttendanceChange(playerId, value ? 'attending' : 'not_attending');
    } else {
      // 작전판에서 온 경우 수정 불가 (평점 비활성화)
      if (isFromTactics) {
        return;
      }
      // 수정 기한이 지난 경우 모든 수정 불가
      if (isEditPeriodExpired) {
        return;
      }
      handleStatChange(playerId, field, value);
    }
  };
  
  // 작전판에서 넘어온 데이터를 자동으로 로드하는 함수
  const loadTacticsData = async (matchId: string, matchNumber: string) => {
    if (tacticsDataLoaded) return; // 이미 로드된 경우 중복 실행 방지
    
    setIsLoadingTacticsData(true);
    try {
      // match_attendance 테이블에서 해당 경기의 데이터를 가져옴
      const { data: attendanceData, error } = await supabase
        .from('match_attendance')
        .select(`
          player_id,
          status,
          goals,
          assists,
          rating,
          is_opponent_team,
          opponent_team_name
        `)
        .eq('match_id', parseInt(matchId))
        .eq('match_number', parseInt(matchNumber));

      if (error) {
        console.error('작전판 데이터 로드 에러:', error);
        return;
      }

      // 출석한 선수들의 데이터를 자동으로 설정
      if (attendanceData) {
        let loadedCount = 0;
        for (const record of attendanceData) {
          if (record.status === 'attending' && !record.is_opponent_team) {
            // 출석 상태 설정
            handleAttendanceChange(record.player_id, 'attending');
            
            // 득점, 어시스트 설정 (평점은 제외)
            if (record.goals > 0) {
              handleStatChange(record.player_id, 'goals', record.goals);
              loadedCount++;
            }
            if (record.assists > 0) {
              handleStatChange(record.player_id, 'assists', record.assists);
              loadedCount++;
            }
          }
        }
        
        setTacticsDataLoaded(true);
        
        if (loadedCount > 0) {
          toast({
            title: "작전판 데이터 로드 완료",
            description: `출석 정보가 자동으로 입력되었습니다. 해당 경기 득점/어시스트 합계가 표시됩니다. 평점만 입력해주세요.`,
          });
        } else {
          toast({
            title: "작전판 데이터 로드 완료",
            description: "출석 정보가 자동으로 입력되었습니다. 해당 경기 득점/어시스트 합계가 표시됩니다. 평점을 입력해주세요.",
          });
        }
      }
    } catch (error) {
      console.error('작전판 데이터 로드 에러:', error);
      toast({
        title: "데이터 로드 실패",
        description: "작전판 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTacticsData(false);
    }
  };

  // 경기 기록 수정 기한 체크
  const checkEditPeriod = (matchDate: string) => {
    const matchDateObj = new Date(matchDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - matchDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // 3일이 지나면 수정 불가 (비밀번호로 해제 가능)
    if (daysDiff > 3 && !isPasswordUnlocked) {
      setIsEditPeriodExpired(true);
      toast({
        title: "수정 기한 만료",
        description: "경기 후 3일이 지나 수정이 제한됩니다. 비밀번호로 해제할 수 있습니다.",
        variant: "destructive"
      });
    } else if (daysDiff <= 3 || isPasswordUnlocked) {
      setIsEditPeriodExpired(false);
    }
  };

  const toggleStatsEditing = () => {
    // 작전판에서 온 경우 토글 불가
    if (isFromTactics) return;
    
    setCanEditStats(!canEditStats);
    toast({
      title: canEditStats ? "득점/어시스트 입력 비활성화" : "득점/어시스트 입력 활성화",
      description: canEditStats 
        ? "득점과 어시스트 입력이 비활성화되었습니다." 
        : "득점과 어시스트 입력이 활성화되었습니다.",
    });
  };

  const handlePasswordUnlock = () => {
    if (password === 'musso') {
      setIsPasswordUnlocked(true);
      setShowPasswordDialog(false);
      setPassword('');
      setPasswordError('');
      toast({
        title: "수정 권한 활성화",
        description: "3일 제한이 해제되어 모든 데이터를 수정할 수 있습니다.",
      });
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handlePasswordLock = () => {
    setIsPasswordUnlocked(false);
    toast({
      title: "수정 권한 비활성화",
      description: "3일 제한이 다시 적용됩니다.",
    });
  };

  const selectedMatchData = selectedMatch ? matches.find(m => m.id === selectedMatch) : null;
  
  // 수정 권한이 없는 사용자는 읽기 전용
  const isReadOnly = !canManagePlayerStats();
  
  // Check if there's a matchId parameter in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const matchId = params.get('matchId');
    const matchNumber = params.get('matchNumber');
    
    if (matchId) {
      setSelectedMatch(Number(matchId));
      
      // 작전판에서 넘어온 경우 데이터 자동 로드
      if (matchNumber && !tacticsDataLoaded) {
        setIsFromTactics(true);
        setCanEditStats(false); // 작전판에서 온 경우 기본적으로 득점/어시스트 입력 비활성화
        
        // 약간의 지연을 두어 usePlayerStats 훅이 먼저 데이터를 로드하도록 함
        setTimeout(() => {
          loadTacticsData(matchId, matchNumber);
        }, 500);
      }
    }
  }, [location, setSelectedMatch, tacticsDataLoaded]);

  // 경기 선택 시 수정 기한 체크
  useEffect(() => {
    if (selectedMatch && selectedMatchData) {
      checkEditPeriod(selectedMatchData.date);
    }
  }, [selectedMatch, selectedMatchData, isPasswordUnlocked]);
  
  useEffect(() => {
    // Redirect if no permissions - 모든 사용자가 접근 가능하도록 제거
    // if (!canManagePlayerStats()) {
    //   toast({
    //     title: "접근 권한이 없습니다",
    //     description: "선수 기록 관리는 감독, 코치, 시스템 관리자만 가능합니다.",
    //     variant: "destructive"
    //   });
    //   navigate('/stats');
    // }
  }, [canManagePlayerStats, navigate, toast]);
  
  const handleSaveStats = async () => {
    // 평점 검증 제거 (2026년도에는 평점을 사용하지 않음)
    // for (const stat of playerStats) {
    //   if(stat.attendanceStatus === "attending") {
    //     if (stat.rating === 0 || stat.rating === null) {
    //       
    //       toast({
    //         title: "저장 실패",
    //         description: "모든 선수의 평점이 입력되어야 저장할 수 있습니다.",
    //         style: { backgroundColor: "red" }, // 실패 색상
    //       });
    //       return false;
    //     }
    //   }
    // }

    try {
      // match status를 completed로 갱신
      if (selectedMatch) {
        const { error: updateError } = await supabase
          .from('matches')
          .update({ status: 'completed' })
          .eq('id', selectedMatch);

        if (updateError) {
          console.error('경기 상태 업데이트 오류:', updateError);
          toast({
            title: "경기 상태 업데이트 실패",
            description: "경기 상태를 완료로 변경하는데 실패했습니다.",
            variant: "destructive"
          });
          return false;
        }
      }

      // In a real app, we would send this data to an API
      toast({
        title: "선수 기록 저장 완료",
        description: `${playerStats.length}명의 선수 기록이 저장되었습니다. 경기 상태가 완료로 변경되었습니다.`,
      });
      return true;
    } catch (error) {
      console.error('저장 중 오류:', error);
      toast({
        title: "저장 실패",
        description: "선수 기록 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">선수 기록 관리</h1>
            <p className="text-gray-600">
              {isReadOnly 
                ? "선수들의 이벤트 출석, 해당 경기 득점/어시스트 합계, 평점을 확인합니다." 
                : "선수들의 이벤트 출석, 해당 경기 득점/어시스트 합계, 평점을 기록합니다."
              }
            </p>
          </div>
          <div className="flex gap-2">
            {/* 비밀번호 활성화 버튼 (3일이 지난 경우에만 표시) */}
            {isEditPeriodExpired && canManagePlayerStats() && (
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                수정 권한 활성화
              </Button>
            )}
            {/* 비밀번호 비활성화 버튼 (활성화된 경우에만 표시) */}
            {isPasswordUnlocked && canManagePlayerStats() && (
              <Button
                variant="outline"
                onClick={handlePasswordLock}
                className="flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                수정 권한 비활성화
              </Button>
            )}
            {/* 작전판에서 넘어온 경우 돌아가기 버튼 표시 */}
            {location.search.includes('matchNumber') && (
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  const matchId = params.get('matchId');
                  const matchNumber = params.get('matchNumber');
                  if (matchId && matchNumber) {
                    navigate(`/tactics/${matchId}/${matchNumber}`);
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                작전판으로 돌아가기
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <MatchSelector 
        matches={matches as Match[]}
        selectedMatch={selectedMatch}
        onMatchSelect={setSelectedMatch}
        formatDate={formatDate}
      />
      
      {selectedMatch && selectedMatchData && (
        <StatsCard
          matchDate={formatDate(selectedMatchData.date)}
          opponent={selectedMatchData.opponent}
          playerStats={playerStatsForUI}
          onStatChange={handleStatChangeForUI}
          onSave={handleSaveStats}
          isLoading={isLoading || isLoadingTacticsData}
          isFromTactics={isFromTactics}
          canEditStats={(canEditStats && !isEditPeriodExpired) && !isReadOnly}
          isEditPeriodExpired={isEditPeriodExpired && !isPasswordUnlocked}
          onToggleStatsEditing={toggleStatsEditing}
          isReadOnly={isReadOnly}
          isPasswordUnlocked={isPasswordUnlocked}
        />
      )}
      
      {!selectedMatch && (
        <NoMatchesInfo message="기록을 관리할 이벤트를 선택해주세요." />
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 입력</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              3일 제한이 해제된 경우에만 모든 데이터를 수정할 수 있습니다.
              비밀번호를 입력하여 수정 권한을 활성화하세요.
            </p>
            <div className="mt-4">
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordUnlock();
                  }
                }}
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-2">{passwordError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              취소
            </Button>
            <Button onClick={handlePasswordUnlock}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StatsManagement;
