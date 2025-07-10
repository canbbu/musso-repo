import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Save, RotateCcw, Users, Edit3, Calendar, Shield, Target } from 'lucide-react';
import { toast } from 'sonner';

interface PlayerPosition {
  playerId: string;
  playerName: string;
  x: number; // 경기장 내 x 좌표 (0-100%)
  y: number; // 경기장 내 y 좌표 (0-100%)
  team: 'A' | 'B'; // 팀 구분
  jerseyNumber?: number;
}

interface Formation {
  id?: string;
  name: string;
  positions: PlayerPosition[];
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

const Tactics = () => {
  const { canManage, canManageMatches, canManageSystem, userName, userId } = useAuth();
  const { players } = usePlayerRankings();
  const [selectedMatch, setSelectedMatch] = useState<number>(1);
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A'); // 선택된 팀
  const [formations, setFormations] = useState<Record<number, Formation>>({
    1: { name: '1경기 포메이션', positions: [], created_by: userId || '' },
    2: { name: '2경기 포메이션', positions: [], created_by: userId || '' },
    3: { name: '3경기 포메이션', positions: [], created_by: userId || '' }
  });
  const [availablePlayers, setAvailablePlayers] = useState(players);
  const [pickedPlayer, setPickedPlayer] = useState<any>(null); // 픽업된 선수
  const fieldRef = useRef<HTMLDivElement>(null);
  const playerListContainerRef = useRef<HTMLDivElement>(null);
  const playerListInnerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // 수정 권한 확인
  const canEdit = canManage() || canManageMatches() || canManageSystem();

  // 현재 선택된 경기의 포메이션
  const currentFormation = formations[selectedMatch];

  // 선택 해제를 위한 전역 클릭 이벤트
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 경기장이나 선수 명단 클릭이 아닌 경우 선택 해제
      const target = e.target as HTMLElement;
      const isFieldClick = fieldRef.current?.contains(target);
      const isPlayerListClick = playerListContainerRef.current?.contains(target);
      
      if (!isFieldClick && !isPlayerListClick && pickedPlayer) {
        setPickedPlayer(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [pickedPlayer]);

  useEffect(() => {
    // 이미 배치된 선수들을 제외한 사용 가능한 선수 목록 업데이트 (가나다순 정렬)
    const placedPlayerIds = currentFormation.positions.map(pos => pos.playerId);
    const sortedPlayers = players
      .filter(player => !placedPlayerIds.includes(player.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
    setAvailablePlayers(sortedPlayers);
  }, [players, currentFormation.positions]);

  // 선수 명단 크기 추적 함수
  useEffect(() => {
    const checkPlayerListDimensions = () => {
      if (playerListContainerRef.current && playerListInnerRef.current) {
        const container = playerListContainerRef.current;
        const inner = playerListInnerRef.current;
      }
    };

    // 초기 로드 시
    checkPlayerListDimensions();
    
    // 윈도우 크기 변경 시
    window.addEventListener('resize', checkPlayerListDimensions);
    
    // 선수 목록 변경 시 약간의 지연 후 체크 (DOM 업데이트 대기)
    const timeout = setTimeout(checkPlayerListDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', checkPlayerListDimensions);
      clearTimeout(timeout);
    };
  }, [availablePlayers]);

  // 터치 이벤트 방지 함수는 더 이상 필요하지 않음

  // 드래그 시작/끝 함수들도 더 이상 필요하지 않음

  // 선수 간 최소 거리 확인 함수
  const checkMinDistance = (newX: number, newY: number, excludePlayerId?: string) => {
    const minDistance = 12; // 최소 거리 (%)
    
    return !currentFormation.positions.some(pos => {
      if (excludePlayerId && pos.playerId === excludePlayerId) return false;
      const distance = Math.sqrt(Math.pow(pos.x - newX, 2) + Math.pow(pos.y - newY, 2));
      return distance < minDistance;
    });
  };

  // 가장 가까운 빈 공간 찾기
  const findNearestValidPosition = (targetX: number, targetY: number, excludePlayerId?: string) => {
    // 우선 원하는 위치가 가능한지 확인
    if (checkMinDistance(targetX, targetY, excludePlayerId)) {
      return { x: targetX, y: targetY };
    }

    // 원하는 위치 주변에서 나선형으로 빈 공간 탐색
    const step = 3;
    for (let radius = step; radius <= 25; radius += step) {
      for (let angle = 0; angle < 360; angle += 30) {
        const radian = (angle * Math.PI) / 180;
        const x = Math.min(95, Math.max(5, targetX + radius * Math.cos(radian)));
        const y = Math.min(95, Math.max(5, targetY + radius * Math.sin(radian)));
        
        if (checkMinDistance(x, y, excludePlayerId)) {
          return { x, y };
        }
      }
    }

    // 빈 공간을 찾지 못한 경우 원래 위치 반환
    return { x: targetX, y: targetY };
  };

  // 선수 픽업/픽업 해제
  const pickupPlayer = (player: any) => {
    if (pickedPlayer?.id === player.id) {
      // 이미 픽업된 선수를 다시 클릭하면 픽업 해제
      setPickedPlayer(null);
    } else {
      setPickedPlayer(player);
    }
  };

  // 모바일에서 팀 영역 확인
  const isInTeamArea = (x: number, y: number, team: 'A' | 'B') => {
    // 모바일과 PC 모두 좌우로 나누어 배치 (가로 경기장)
    if (team === 'A') {
      return x >= 5 && x <= 47.5; // 좌측 반코트
    } else {
      return x >= 52.5 && x <= 95; // 우측 반코트
    }
  };

  // 경기장 클릭으로 선수 배치
  const handleFieldClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pickedPlayer || !fieldRef.current || !canEdit) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const targetX = ((e.clientX - rect.left) / rect.width) * 100;
    const targetY = ((e.clientY - rect.top) / rect.height) * 100;

    // 경기장 경계 내에서만 배치
    if (targetX >= 5 && targetX <= 95 && targetY >= 5 && targetY <= 95) {
      // 팀 영역 확인 (모바일과 PC 모두 적용)
      if (!isInTeamArea(targetX, targetY, selectedTeam)) {
        toast.error(`${selectedTeam}팀 영역에만 배치할 수 있습니다`);
        return;
      }

      // 경기장에 이미 있는 선수를 이동하는 경우
      if (pickedPlayer.isOnField) {
        const validPosition = findNearestValidPosition(targetX, targetY, pickedPlayer.id);
        updatePlayerPosition(pickedPlayer.id, validPosition.x, validPosition.y, selectedTeam);
      } else {
        // 벤치에서 경기장으로 새로 배치하는 경우
        const validPosition = findNearestValidPosition(targetX, targetY);
        const newPosition: PlayerPosition = {
          playerId: pickedPlayer.id,
          playerName: pickedPlayer.name,
          x: validPosition.x,
          y: validPosition.y,
          team: selectedTeam,
          jerseyNumber: 0
        };

        setFormations(prev => ({
          ...prev,
          [selectedMatch]: {
            ...prev[selectedMatch],
            positions: [...prev[selectedMatch].positions, newPosition]
          }
        }));
      }
      
      // 배치 후 픽업 해제
      setPickedPlayer(null);
    }
  };

  // 선수 위치 업데이트
  const updatePlayerPosition = (playerId: string, x: number, y: number, team: 'A' | 'B') => {
    if (!canEdit) return;
    
    setFormations(prev => ({
      ...prev,
      [selectedMatch]: {
        ...prev[selectedMatch],
        positions: prev[selectedMatch].positions.map(pos =>
          pos.playerId === playerId
            ? { ...pos, x: Math.min(95, Math.max(5, x)), y: Math.min(95, Math.max(5, y)), team }
            : pos
        )
      }
    }));
  };

  // 선수 제거 (경기장에서 벤치로)
  const removePlayerFromField = (playerId: string) => {
    if (!canEdit) return;
    
    setFormations(prev => ({
      ...prev,
      [selectedMatch]: {
        ...prev[selectedMatch],
        positions: prev[selectedMatch].positions.filter(pos => pos.playerId !== playerId)
      }
    }));
  };

  // 팀별 선수 수 계산
  const getTeamPlayerCount = (team: 'A' | 'B') => {
    return currentFormation.positions.filter(pos => pos.team === team).length;
  };

  // 포메이션 저장
  const saveFormation = async () => {
    try {
      if (!currentFormation.name || currentFormation.positions.length === 0) {
        toast.error('포메이션 이름과 선수 배치가 필요합니다');
        return;
      }

      const formationData = {
        name: currentFormation.name,
        positions: currentFormation.positions,
        created_by: userId,
        match_number: selectedMatch
      };

      const { error } = await supabase
        .from('formations')
        .insert([formationData]);

      if (error) {
        // 테이블이 없는 경우 알림만 표시
        if (error.code === 'PGRST116') {
          toast.error('formations 테이블이 아직 생성되지 않았습니다. 관리자에게 문의하세요.');
        } else {
          throw error;
        }
        return;
      }

      toast.success('포메이션이 저장되었습니다');
    } catch (error) {
      console.error('Error saving formation:', error);
      toast.error('포메이션 저장에 실패했습니다');
    }
  };

  // 포메이션 초기화
  const resetFormation = () => {
    if (!canEdit) return;
    
    setFormations(prev => ({
      ...prev,
      [selectedMatch]: {
        ...prev[selectedMatch],
        positions: []
      }
    }));
  };

  // 경기 추가
  const addMatch = () => {
    const newMatchNumber = Math.max(...Object.keys(formations).map(Number)) + 1;
    setFormations(prev => ({
      ...prev,
      [newMatchNumber]: {
        name: `${newMatchNumber}경기 포메이션`,
        positions: [],
        created_by: userId || ''
      }
    }));
    setSelectedMatch(newMatchNumber);
  };

  // 경기 삭제
  const deleteMatch = (matchNumber: number) => {
    if (Object.keys(formations).length <= 1) return; // 최소 1개는 유지
    
    const newFormations = { ...formations };
    delete newFormations[matchNumber];
    setFormations(newFormations);
    
    // 삭제된 경기가 현재 선택된 경기면 첫 번째 경기로 변경
    if (selectedMatch === matchNumber) {
      setSelectedMatch(Math.min(...Object.keys(newFormations).map(Number)));
    }
  };

  return (
    <Layout>
      <div ref={mainContainerRef} className="min-h-screen w-full overflow-x-hidden">
        <div className="space-y-2 sm:space-y-6 p-1 sm:p-4 max-w-full">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-2 sm:p-6 border border-green-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-4">
              <div>
                <h1 className="text-lg sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                  <Clipboard className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
                  작전판
                </h1>
                <p className="text-xs sm:text-base text-gray-600">경기별로 선수들을 배치하고 포메이션을 만들어보세요</p>
              </div>
              <div className="flex items-center gap-2">
                {!canEdit && (
                  <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700">
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    읽기 전용
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 경기 탭 */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  경기 선택
                </CardTitle>
                {canEdit && (
                  <Button
                    onClick={addMatch}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                  >
                    경기 추가
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {Object.entries(formations).map(([matchNumber, formationData]) => (
                  <div key={matchNumber} className="relative">
                    <Button
                      variant={selectedMatch === parseInt(matchNumber) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMatch(parseInt(matchNumber))}
                      className={`text-xs sm:text-sm ${
                        selectedMatch === parseInt(matchNumber)
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {matchNumber}경기
                    </Button>
                    {canEdit && Object.keys(formations).length > 1 && (
                      <button
                        onClick={() => deleteMatch(parseInt(matchNumber))}
                        className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full text-white text-[10px] sm:text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 팀 선택 - 모든 화면 크기에서 표시 */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-2 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                팀 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="flex gap-2">
                <Button
                  variant={selectedTeam === 'A' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTeam('A')}
                  className={`flex-1 text-xs sm:text-sm ${
                    selectedTeam === 'A'
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  A팀 ({getTeamPlayerCount('A')}명)
                </Button>
                <Button
                  variant={selectedTeam === 'B' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTeam('B')}
                  className={`flex-1 text-xs sm:text-sm ${
                    selectedTeam === 'B'
                      ? "bg-red-600 hover:bg-red-700"
                      : "hover:bg-red-50"
                  }`}
                >
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  B팀 ({getTeamPlayerCount('B')}명)
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="lg:hidden">선택한 팀 영역에만 선수를 배치할 수 있습니다 (A팀: 좌측, B팀: 우측)</span>
                <span className="hidden lg:inline">선택한 팀 영역에만 선수를 배치할 수 있습니다 (A팀: 좌측, B팀: 우측)</span>
              </p>
            </CardContent>
          </Card>

          {/* PC: 경기장과 선수 명단을 좌우로 배치, 모바일: 세로로 배치 */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0">
            {/* 경기장 - PC에서는 4/5 차지 */}
            <div className="lg:col-span-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-1 sm:pb-6">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <span>축구장</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="hidden lg:flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          A팀 {getTeamPlayerCount('A')}명
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          B팀 {getTeamPlayerCount('B')}명
                        </Badge>
                      </div>
                      <div className="lg:hidden">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-green-300 text-green-700">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {currentFormation.positions.length}명 배치됨
                        </Badge>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFormation}
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm"
                          >
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            초기화
                          </Button>
                          <Button
                            onClick={saveFormation}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          >
                            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            저장
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-6">
                  <div
                    ref={fieldRef}
                    className="relative w-full h-[280px] sm:h-[400px] lg:h-[600px] bg-green-500 rounded-lg border-4 border-white shadow-inner overflow-hidden"
                    onClick={handleFieldClick}
                  >
                    {/* 모바일과 데스크톱 모두 가로 경기장으로 통일 */}
                    <div className="absolute inset-0">
                      {/* 중앙선 (세로) */}
                      <div className="absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-0.5"></div>
                      
                      {/* A팀/B팀 구분선 표시 */}
                      <div className="absolute left-2 top-2 text-white text-xs font-bold bg-blue-600 px-2 py-1 rounded">A팀</div>
                      <div className="absolute right-2 top-2 text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">B팀</div>
                      
                      {/* 중앙 원 */}
                      <div className="absolute top-1/2 left-1/2 w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      
                      {/* 골대 (좌우) */}
                      <div className="absolute top-1/2 left-0 w-1 sm:w-2 lg:w-3 h-6 sm:h-12 lg:h-16 bg-white transform -translate-y-1/2"></div>
                      <div className="absolute top-1/2 right-0 w-1 sm:w-2 lg:w-3 h-6 sm:h-12 lg:h-16 bg-white transform -translate-y-1/2"></div>
                      
                      {/* 골 에리어 (좌우) */}
                      <div className="absolute top-1/2 left-0 w-8 sm:w-12 lg:w-16 h-16 sm:h-20 lg:h-24 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
                      <div className="absolute top-1/2 right-0 w-8 sm:w-12 lg:w-16 h-16 sm:h-20 lg:h-24 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
                      
                      {/* 페널티 에리어 (좌우) */}
                      <div className="absolute top-1/2 left-0 w-12 sm:w-18 lg:w-24 h-24 sm:h-32 lg:h-40 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
                      <div className="absolute top-1/2 right-0 w-12 sm:w-18 lg:w-24 h-24 sm:h-32 lg:h-40 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
                      
                      {/* 페널티 스팟 (좌우) */}
                      <div className="absolute top-1/2 left-10 sm:left-16 lg:left-20 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full transform -translate-y-1/2"></div>
                      <div className="absolute top-1/2 right-10 sm:right-16 lg:right-20 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full transform -translate-y-1/2"></div>
                      
                      {/* 코너 아크 */}
                      <div className="absolute top-0 left-0 w-3 h-3 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border-2 border-white border-b-0 border-r-0 rounded-br-full"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border-2 border-white border-b-0 border-l-0 rounded-bl-full"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border-2 border-white border-t-0 border-r-0 rounded-tr-full"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border-2 border-white border-t-0 border-l-0 rounded-tl-full"></div>
                    </div>

                    {/* 배치된 선수들 */}
                    {currentFormation.positions.map((position, index) => {
                      // 팀에 따른 색상 구분
                      const circleColor = position.team === 'A' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';
                      
                      return (
                        <div
                          key={position.playerId}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group touch-manipulation"
                          style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`
                          }}
                          onDoubleClick={() => {
                            if (canEdit) {
                              removePlayerFromField(position.playerId);
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // 경기장 클릭 이벤트 방지
                            if (canEdit && !pickedPlayer) {
                              pickupPlayer({ id: position.playerId, name: position.playerName, isOnField: true, team: position.team });
                            }
                          }}
                        >
                          <div className={`${circleColor} text-white rounded-full w-5 h-5 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg border-2 border-white transition-colors relative ${
                            pickedPlayer?.id === position.playerId ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
                          }`}>
                            <span className="text-[8px] sm:text-xs font-bold">
                              {currentFormation.positions.filter(p => p.team === position.team).findIndex(p => p.playerId === position.playerId) + 1}
                            </span>
                            {canEdit && (
                              <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 h-2 sm:w-4 sm:h-4 bg-gray-800 rounded-full flex items-center justify-center text-white text-[6px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     removePlayerFromField(position.playerId);
                                   }}>
                                ×
                              </div>
                            )}
                          </div>
                          {/* 선수 이름 표시 */}
                          <div className="absolute top-6 sm:top-12 md:top-14 left-1/2 transform -translate-x-1/2 text-center">
                            <div className="bg-white/90 text-gray-800 text-[7px] sm:text-xs px-0.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium shadow-sm border min-w-max max-w-10 sm:max-w-20 md:max-w-24 truncate">
                              {/* 모바일에서는 성만 표시, 데스크톱에서는 전체 이름 */}
                              <span className="sm:hidden">{position.playerName.split('_')[0]}</span>
                              <span className="hidden sm:inline">{position.playerName}</span>
                            </div>
                            {canEdit && (
                              <div className="text-[6px] sm:text-[10px] text-white/80 mt-0.5 sm:mt-1 bg-black/60 px-0.5 sm:px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                더블클릭으로 제거
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* 픽업된 선수가 있을 때 안내 메시지 */}
                    {pickedPlayer && (
                      <div className="absolute inset-0 bg-blue-200/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
                        <div className="text-blue-800 text-xs sm:text-lg font-semibold bg-white/90 px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow">
                          {pickedPlayer.name}을(를) {selectedTeam}팀 영역에 배치할 위치를 클릭하세요
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 선수 벤치 - PC에서는 1/5 차지, 모바일에서는 경기장 아래 전체 폭 */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg h-full">
                <CardHeader className="pb-1 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      선수 명단
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (playerListContainerRef.current && playerListInnerRef.current) {
                          const container = playerListContainerRef.current;
                          const inner = playerListInnerRef.current;
                          
                          console.log('\n🔍 실시간 스크롤 상태 체크');
                          console.log('컨테이너 크기:', {
                            width: container.clientWidth,
                            height: container.clientHeight,
                            scrollWidth: container.scrollWidth,
                            scrollHeight: container.scrollHeight
                          });
                          console.log('내부 콘텐츠 크기:', {
                            width: inner.offsetWidth,
                            scrollWidth: inner.scrollWidth
                          });
                          console.log('스크롤 정보:', {
                            scrollLeft: container.scrollLeft,
                            maxScrollLeft: container.scrollWidth - container.clientWidth,
                            canScroll: container.scrollWidth > container.clientWidth
                          });
                          console.log('선수 정보:', {
                            count: availablePlayers.length,
                            calculatedWidth: availablePlayers.length * 80 + 32
                          });
                          
                          // 스크롤 테스트
                          if (container.scrollWidth > container.clientWidth) {
                            console.log('✅ 스크롤 가능 - 50px 이동 테스트');
                            container.scrollLeft += 50;
                          } else {
                            console.log('❌ 스크롤 불가능');
                          }
                        }
                      }}
                      className="text-xs lg:hidden"
                    >
                      스크롤 체크
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-3">
                  {/* PC: 세로 그리드, 모바일: 가로 스크롤 */}
                  <div className="lg:hidden">
                    {/* 모바일용 가로 스크롤 */}
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                      <span>← 스크롤하여 더 많은 선수를 확인하세요 →</span>
                      <span>{availablePlayers.length}명 대기중</span>
                    </div>
                    
                    <div 
                      ref={playerListContainerRef}
                      className="relative border border-gray-200 rounded-lg p-2 bg-gray-50"
                      style={{
                        height: '128px',
                        width: '100%',
                        maxWidth: '100vw',
                        overflowX: 'auto',
                        overflowY: 'hidden'
                      }}
                    >
                      <div 
                        ref={playerListInnerRef}
                        className="flex gap-2 h-full"
                        style={{ 
                          width: `${Math.max(availablePlayers.length * 72 + 16, 300)}px`,
                          minWidth: 'fit-content'
                        }}
                      >
                        {availablePlayers.map((player, index) => (
                          <div
                            key={player.id}
                            className={`flex flex-col items-center flex-shrink-0 w-16 ${
                              canEdit ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                            } transition-transform ${
                              pickedPlayer?.id === player.id ? 'opacity-50 scale-110' : ''
                            }`}
                            style={{ pointerEvents: 'auto' }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (canEdit) {
                                pickupPlayer(player);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canEdit && !pickedPlayer) {
                                pickupPlayer(player);
                              }
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              if (canEdit && !pickedPlayer) {
                                pickupPlayer(player);
                              }
                            }}
                          >
                            <div className="bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white hover:bg-gray-700 transition-colors mb-1">
                              <span className="text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <div className="text-[10px] text-center text-gray-700 font-medium leading-tight max-w-16 truncate">
                              {player.name.split('_')[0]}
                            </div>
                            <div className="text-[8px] text-gray-500">
                              {player.position}
                            </div>
                          </div>
                        ))}
                        
                        {availablePlayers.length === 0 && (
                          <div className="flex items-center justify-center w-full py-4 text-center text-gray-500">
                            <Users className="w-6 h-6 mr-2 text-gray-300" />
                            <p className="text-xs">모든 선수가 배치되었습니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PC용 세로 단일 열 */}
                  <div className="hidden lg:block">
                    <div className="text-sm text-gray-500 mb-3">
                      {availablePlayers.length}명 대기중
                    </div>
                    
                    <div className="space-y-2 max-h-[580px] overflow-y-auto pr-2">
                      {availablePlayers.map((player, index) => (
                        <div
                          key={player.id}
                          className={`flex items-center p-2 border rounded-lg ${
                            canEdit ? 'cursor-pointer hover:scale-105 hover:bg-gray-50' : 'cursor-default'
                          } transition-all ${
                            pickedPlayer?.id === player.id ? 'opacity-50 scale-105 bg-blue-50 border-blue-300' : 'bg-white'
                          }`}
                          onDoubleClick={() => {
                            if (canEdit) {
                              pickupPlayer(player);
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canEdit && !pickedPlayer) {
                              pickupPlayer(player);
                            }
                          }}
                        >
                          <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white hover:bg-gray-700 transition-colors mr-3 flex-shrink-0">
                            <span className="text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-700 font-medium truncate">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.position}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {availablePlayers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                          <Users className="w-8 h-8 mb-2 text-gray-300" />
                          <p className="text-sm">모든 선수가 배치되었습니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 도움말 */}
          <Card className="shadow-lg bg-blue-50 border-blue-200">
            <CardContent className="p-2 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">사용법</h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
                <li>• 상단에서 경기를 선택하거나 새로운 경기를 추가하세요</li>
                <li className="lg:hidden">• 모바일에서는 A팀/B팀을 선택하여 각 팀 영역에 선수를 배치하세요</li>
                <li>• 선수 명단의 선수를 클릭하여 선택한 후, 경기장의 원하는 위치를 클릭하여 배치하세요</li>
                <li>• 경기장의 선수를 클릭하여 선택한 후, 다른 위치를 클릭하여 이동할 수 있습니다</li>
                <li>• 경기장의 선수를 더블클릭하거나 X 버튼을 클릭하면 벤치로 돌아갑니다</li>
                <li>• 포메이션을 완성하면 저장 버튼을 눌러 저장하세요</li>
                <li>• 각 경기별로 독립적인 포메이션을 관리할 수 있습니다</li>
                {!canEdit && <li>• 현재 읽기 전용 모드입니다. 수정하려면 감독/코치 권한이 필요합니다</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Tactics; 