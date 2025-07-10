import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Save, RotateCcw, Users, Edit3, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface PlayerPosition {
  playerId: string;
  playerName: string;
  x: number; // 경기장 내 x 좌표 (0-100%)
  y: number; // 경기장 내 y 좌표 (0-100%)
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
  const [formations, setFormations] = useState<Record<number, Formation>>({
    1: { name: '1경기 포메이션', positions: [], created_by: userId || '' },
    2: { name: '2경기 포메이션', positions: [], created_by: userId || '' },
    3: { name: '3경기 포메이션', positions: [], created_by: userId || '' }
  });
  const [availablePlayers, setAvailablePlayers] = useState(players);
  const [draggedPlayer, setDraggedPlayer] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{x: number, y: number} | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const playerListContainerRef = useRef<HTMLDivElement>(null);
  const playerListInnerRef = useRef<HTMLDivElement>(null);

  // 수정 권한 확인
  const canEdit = canManage() || canManageMatches() || canManageSystem();

  // 현재 선택된 경기의 포메이션
  const currentFormation = formations[selectedMatch];

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
        
        console.log('=== 선수 명단 크기 정보 ===');
        console.log('컨테이너 폭:', container.clientWidth + 'px');
        console.log('컨테이너 스크롤 폭:', container.scrollWidth + 'px');
        console.log('내부 컨텐츠 폭:', inner.scrollWidth + 'px');
        console.log('스크롤 가능 여부:', container.scrollWidth > container.clientWidth);
        console.log('현재 스크롤 위치:', container.scrollLeft + 'px');
        console.log('선수 수:', availablePlayers.length + '명');
        console.log('========================');
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

  // 터치 이벤트 방지 함수
  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventTouch, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventTouch);
    };
  }, [isDragging]);

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, player: any) => {
    setDraggedPlayer(player);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 끝
  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setIsDragging(false);
  };

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

  // 경기장에 드롭
  const handleFieldDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlayer || !fieldRef.current || !canEdit) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const targetX = ((e.clientX - rect.left) / rect.width) * 100;
    const targetY = ((e.clientY - rect.top) / rect.height) * 100;

    // 경기장 경계 내에서만 배치
    if (targetX >= 5 && targetX <= 95 && targetY >= 5 && targetY <= 95) {
      // 경기장에 이미 있는 선수를 이동하는 경우
      if (draggedPlayer.isOnField) {
        const validPosition = findNearestValidPosition(targetX, targetY, draggedPlayer.id);
        updatePlayerPosition(draggedPlayer.id, validPosition.x, validPosition.y);
      } else {
        // 벤치에서 경기장으로 새로 배치하는 경우
        const validPosition = findNearestValidPosition(targetX, targetY);
        const newPosition: PlayerPosition = {
          playerId: draggedPlayer.id,
          playerName: draggedPlayer.name,
          x: validPosition.x,
          y: validPosition.y,
          jerseyNumber: 0 // 임시로 0번 사용
        };

        setFormations(prev => ({
          ...prev,
          [selectedMatch]: {
            ...prev[selectedMatch],
            positions: [...prev[selectedMatch].positions, newPosition]
          }
        }));
      }
    }
  };

  // 선수 위치 업데이트
  const updatePlayerPosition = (playerId: string, x: number, y: number) => {
    if (!canEdit) return;
    
    setFormations(prev => ({
      ...prev,
      [selectedMatch]: {
        ...prev[selectedMatch],
        positions: prev[selectedMatch].positions.map(pos =>
          pos.playerId === playerId
            ? { ...pos, x: Math.min(95, Math.max(5, x)), y: Math.min(95, Math.max(5, y)) }
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
      <div className="space-y-2 sm:space-y-6 p-1 sm:p-4">
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
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-green-300 text-green-700">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {currentFormation.positions.length}명 배치됨
              </Badge>
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

        <div className="space-y-2 sm:space-y-6">
          {/* 경기장 */}
          <Card className="shadow-lg">
            <CardHeader className="pb-1 sm:pb-6">
              <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                <span>축구장</span>
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
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1 sm:p-6">
              <div
                ref={fieldRef}
                className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] bg-green-500 rounded-lg border-4 border-white shadow-inner overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFieldDrop}
              >
                {/* 모바일 세로 경기장과 데스크톱 가로 경기장 */}
                <div className="absolute inset-0 sm:hidden">
                  {/* 모바일: 세로 경기장 - 더 작은 크기 */}
                  {/* 중앙선 (가로) */}
                  <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white"></div>
                  
                  {/* 중앙 원 */}
                  <div className="absolute top-1/2 left-1/2 w-10 h-10 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* 골대 (상하) */}
                  <div className="absolute top-0 left-1/2 w-6 h-1 bg-white transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-6 h-1 bg-white transform -translate-x-1/2"></div>
                  
                  {/* 골 에리어 (상하) */}
                  <div className="absolute top-0 left-1/2 w-10 h-6 border-2 border-white border-t-0 transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-10 h-6 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                  
                  {/* 페널티 에리어 (상하) */}
                  <div className="absolute top-0 left-1/2 w-16 h-10 border-2 border-white border-t-0 transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-16 h-10 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                  
                  {/* 페널티 스팟 (상하) */}
                  <div className="absolute top-8 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2"></div>
                  <div className="absolute bottom-8 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2"></div>
                  
                  {/* 코너 아크 */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-2 border-white border-b-0 border-r-0 rounded-br-full"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-2 border-white border-b-0 border-l-0 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-2 border-white border-t-0 border-r-0 rounded-tr-full"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white border-t-0 border-l-0 rounded-tl-full"></div>
                </div>

                {/* 데스크톱: 가로 경기장 */}
                <div className="absolute inset-0 hidden sm:block">
                  {/* 중앙선 (세로) */}
                  <div className="absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-0.5"></div>
                  
                  {/* 중앙 원 */}
                  <div className="absolute top-1/2 left-1/2 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* 골대 (좌우) */}
                  <div className="absolute top-1/2 left-0 w-2 sm:w-3 h-12 sm:h-16 bg-white transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-0 w-2 sm:w-3 h-12 sm:h-16 bg-white transform -translate-y-1/2"></div>
                  
                  {/* 골 에리어 (좌우) */}
                  <div className="absolute top-1/2 left-0 w-12 sm:w-16 h-20 sm:h-24 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-0 w-12 sm:w-16 h-20 sm:h-24 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
                  
                  {/* 페널티 에리어 (좌우) */}
                  <div className="absolute top-1/2 left-0 w-18 sm:w-24 h-32 sm:h-40 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-0 w-18 sm:w-24 h-32 sm:h-40 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
                  
                  {/* 페널티 스팟 (좌우) */}
                  <div className="absolute top-1/2 left-16 sm:left-20 w-2 h-2 bg-white rounded-full transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 right-16 sm:right-20 w-2 h-2 bg-white rounded-full transform -translate-y-1/2"></div>
                  
                  {/* 코너 아크 */}
                  <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-2 border-white border-b-0 border-r-0 rounded-br-full"></div>
                  <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-2 border-white border-b-0 border-l-0 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-2 border-white border-t-0 border-r-0 rounded-tr-full"></div>
                  <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-2 border-white border-t-0 border-l-0 rounded-tl-full"></div>
                </div>

                {/* 배치된 선수들 */}
                {currentFormation.positions.map((position, index) => {
                  // 모바일과 데스크톱에서 다른 진영 구분
                  const isMobile = window.innerWidth < 640;
                  const isTopSide = isMobile ? position.y < 50 : position.x < 50;
                  const circleColor = isTopSide ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';
                  
                  return (
                    <div
                      key={position.playerId}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group touch-manipulation"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`
                      }}
                      draggable={canEdit}
                      onDragStart={(e) => {
                        if (canEdit) {
                          setDraggedPlayer({ id: position.playerId, isOnField: true });
                          setIsDragging(true);
                          e.dataTransfer.effectAllowed = 'move';
                        }
                      }}
                      onDragEnd={handleDragEnd}
                      onDoubleClick={() => removePlayerFromField(position.playerId)}
                      onTouchStart={(e) => {
                        if (canEdit) {
                          const touch = e.touches[0];
                          setTouchStartPos({ x: touch.clientX, y: touch.clientY });
                          setDraggedPlayer({ id: position.playerId, isOnField: true });
                          setIsDragging(true);
                        }
                      }}
                      onTouchEnd={() => {
                        setDraggedPlayer(null);
                        setIsDragging(false);
                        setTouchStartPos(null);
                      }}
                    >
                      <div className={`${circleColor} text-white rounded-full w-5 h-5 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg border-2 border-white transition-colors relative`}>
                        <span className="text-[8px] sm:text-xs font-bold">
                          {index + 1}
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

                {/* 드래그 가이드 */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-200/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                    <div className="text-blue-800 text-xs sm:text-lg font-semibold bg-white/90 px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow">
                      여기에 선수를 놓아주세요
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 선수 벤치 */}
          <Card className="shadow-lg">
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
                  className="text-xs"
                >
                  스크롤 체크
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1 sm:p-3">
              {/* 가로 스크롤 선수 명단 */}
              <div className="w-full max-w-2xl mx-auto">
                {/* 스크롤 힌트 */}
                <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                  <span>← 스크롤하여 더 많은 선수를 확인하세요 →</span>
                  <span>{availablePlayers.length}명 대기중</span>
                </div>
                
                <div 
                  ref={playerListContainerRef}
                  className="relative border border-gray-200 rounded-lg p-2 bg-gray-50"
                  style={{
                    width: '100%',
                    maxWidth: window.innerWidth >= 640 ? '1200px' : '460px', // PC에서 더 길게
                    height: '128px',
                    overflowX: 'scroll',
                    overflowY: 'hidden',
                    scrollbarWidth: 'thin',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  onScroll={(e) => {
                    e.stopPropagation(); // 스크롤 이벤트 전파 방지
                    console.log('스크롤 이벤트 - 현재 위치:', e.currentTarget.scrollLeft + 'px');
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation(); // 마우스 이벤트 전파 방지
                    setIsDragging(false); // 스크롤 시 드래그 상태 초기화
                  }} 
                  onTouchStart={(e) => {
                    e.stopPropagation(); // 터치 이벤트 전파 방지
                    setIsDragging(false); // 터치 스크롤 시 드래그 상태 초기화
                  }}
                  onMouseMove={(e) => e.stopPropagation()} // 마우스 이동 이벤트 전파 방지
                  onTouchMove={(e) => e.stopPropagation()} // 터치 이동 이벤트 전파 방지
                >
                  <div 
                    ref={playerListInnerRef}
                    className="flex gap-2 sm:gap-3 h-full"
                    style={{ 
                      width: `${Math.max(availablePlayers.length * 80 + 32, 5000)}px`,
                      minWidth: '5000px'
                    }}
                  >
                    {availablePlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex flex-col items-center flex-shrink-0 w-16 sm:w-20 ${
                          canEdit ? 'cursor-move hover:scale-105' : 'cursor-default'
                        } transition-transform touch-manipulation ${
                          draggedPlayer?.id === player.id ? 'opacity-50 scale-110' : ''
                        }`}
                        draggable={canEdit}
                        onDragStart={(e) => {
                          if (canEdit) {
                            handleDragStart(e, player);
                            // 드래그 이미지 설정
                            const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
                            dragImage.style.transform = 'scale(1.2)';
                            dragImage.style.opacity = '0.8';
                            e.dataTransfer.setDragImage(dragImage, 40, 40);
                          }
                        }}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => {
                          if (canEdit) {
                            const touch = e.touches[0];
                            setTouchStartPos({ x: touch.clientX, y: touch.clientY });
                            setDraggedPlayer(player);
                            setIsDragging(true);
                          }
                        }}
                        onTouchMove={(e) => {
                          if (canEdit && draggedPlayer && touchStartPos) {
                            const touch = e.touches[0];
                            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                            const deltaY = Math.abs(touch.clientY - touchStartPos.y);
                            
                            // 일정 거리 이상 움직였을 때만 드래그로 인식
                            if (deltaX > 10 || deltaY > 10) {
                              const fieldRect = fieldRef.current?.getBoundingClientRect();
                              if (fieldRect) {
                                const x = ((touch.clientX - fieldRect.left) / fieldRect.width) * 100;
                                const y = ((touch.clientY - fieldRect.top) / fieldRect.height) * 100;
                                
                                // 경기장 영역 내에 있으면 배치
                                if (x >= 5 && x <= 95 && y >= 5 && y <= 95) {
                                  const validPosition = findNearestValidPosition(x, y);
                                  const newPosition: PlayerPosition = {
                                    playerId: player.id,
                                    playerName: player.name,
                                    x: validPosition.x,
                                    y: validPosition.y,
                                    jerseyNumber: 0
                                  };

                                  setFormations(prev => ({
                                    ...prev,
                                    [selectedMatch]: {
                                      ...prev[selectedMatch],
                                      positions: [...prev[selectedMatch].positions, newPosition]
                                    }
                                  }));
                                  
                                  setDraggedPlayer(null);
                                  setIsDragging(false);
                                  setTouchStartPos(null);
                                }
                              }
                            }
                          }
                        }}
                        onTouchEnd={() => {
                          setDraggedPlayer(null);
                          setIsDragging(false);
                          setTouchStartPos(null);
                        }}
                      >
                        <div className="bg-gray-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg border-2 border-white hover:bg-gray-700 transition-colors mb-1">
                          <span className="text-xs sm:text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-center text-gray-700 font-medium leading-tight max-w-16 truncate">
                          {/* 모바일에서는 성만 표시 */}
                          <span className="sm:hidden">{player.name.split('_')[0]}</span>
                          <span className="hidden sm:inline">{player.name}</span>
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-gray-500">
                          {player.position}
                        </div>
                      </div>
                    ))}
                    
                    {availablePlayers.length === 0 && (
                      <div className="flex items-center justify-center w-full py-4 sm:py-8 text-center text-gray-500">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-gray-300" />
                        <p className="text-xs sm:text-sm">모든 선수가 배치되었습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 도움말 */}
        <Card className="shadow-lg bg-blue-50 border-blue-200">
          <CardContent className="p-2 sm:p-4">
            <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">사용법</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
              <li>• 상단에서 경기를 선택하거나 새로운 경기를 추가하세요</li>
              <li>• 오른쪽 선수 명단(동그라미)에서 선수를 드래그하여 경기장에 배치하세요</li>
              <li>• 경기장의 선수를 드래그하여 위치를 변경할 수 있습니다</li>
              <li>• 경기장의 선수를 더블클릭하거나 X 버튼을 클릭하면 벤치로 돌아갑니다</li>
              <li>• 포메이션을 완성하면 저장 버튼을 눌러 저장하세요</li>
              <li>• 각 경기별로 독립적인 포메이션을 관리할 수 있습니다</li>
              {!canEdit && <li>• 현재 읽기 전용 모드입니다. 수정하려면 감독/코치 권한이 필요합니다</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Tactics; 