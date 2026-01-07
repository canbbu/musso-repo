import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import { useTactics } from '@/features/matches/hooks/use-tactics';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Clipboard, Save, RotateCcw, Users, Edit3, Calendar, Shield, Target, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { PlayerPosition } from '@/features/matches/types/match.types';

interface Formation {
  id?: string;
  name: string;
  positions: PlayerPosition[];
  created_by: string;
  created_at?: string;
  updated_at?: string;
  teamA_strategy?: string; // A팀 전략
  teamB_strategy?: string; // B팀 전략
}

// 1. 득점 묶음 타입 추가
interface GoalGroup {
  id: string; // `${scorerId}-${timestamp}`
  scorerId: string;
  scorerName: string;
  assistantId?: string;
  assistantName?: string;
  team: 'A' | 'B';
  timestamp: string;
}

const Tactics = () => {
  const { matchId, matchNumber } = useParams<{ matchId: string; matchNumber: string }>();
  const navigate = useNavigate();
  const { canManage, canManageMatches, canManageSystem, userName, userId } = useAuth();
  const { players } = usePlayerRankings();
  
  const matchIdNum = parseInt(matchId || '0');
  const matchNumberNum = parseInt(matchNumber || '1');
  
  const { 
    tactics, 
    players: tacticsPlayers, 
    loading, 
    error, 
    saveTactics, 
    deleteTactics,
    fetchMatchPlayers,
    fetchMatchNumbers,
    fetchTactics
  } = useTactics(matchIdNum, matchNumberNum);

  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A'); // 선택된 팀
  const [formations, setFormations] = useState<Record<number, Formation>>({});
  const [matchNumbers, setMatchNumbers] = useState<number[]>([1]);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [attendingPlayers, setAttendingPlayers] = useState<any[]>([]);
  const [pickedPlayer, setPickedPlayer] = useState<any>(null); // 픽업된 선수
  const [goalRecords, setGoalRecords] = useState<Array<{
    id: string;
    name: string;
    goals: number;
    assists: number;
    team?: 'A' | 'B';
    timestamp?: string;
  }>>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    scorer: '',
    assistant: '',
    team: 'A' as 'A' | 'B'
  });
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showAddOpponentModal, setShowAddOpponentModal] = useState(false);
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState('');
  const [opponentTeamName, setOpponentTeamName] = useState('');
  const [isSelfMatchState, setIsSelfMatchState] = useState(true);
  const [newMatchOpponentName, setNewMatchOpponentName] = useState('');
  const fieldRef = useRef<HTMLDivElement>(null);
  const playerListContainerRef = useRef<HTMLDivElement>(null);
  const playerListInnerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // 2. 득점 묶음 상태 추가
  const [goalGroups, setGoalGroups] = useState<GoalGroup[]>([]);
  const [editGoalGroup, setEditGoalGroup] = useState<GoalGroup | null>(null);

  // 수정 권한 확인
  const canEdit = canManage() || canManageMatches() || canManageSystem();

  // 현재 선택된 경기의 포메이션
  const currentFormation = formations[matchNumberNum] || {
    name: `경기 #${matchId} - ${matchNumber}경기 작전판`,
    positions: [],
    created_by: userId || '',
    teamA_strategy: '',
    teamB_strategy: ''
  };

  // 직접 match_attendance 테이블에서 데이터를 가져오는 함수
  const fetchAttendanceData = useCallback(async () => {
    try {
      // 위치 정보가 있는 데이터만 필터링 (상대팀 제외)
      const { data, error } = await supabase
        .from('match_attendance')
        .select(`
          id,
          match_id,
          match_number,
          player_id,
          status,
          goals,
          assists,
          rating,
          tactics_position_x,
          tactics_position_y,
          tactics_team,
          substitutions,
          is_substituted,
          goal_timestamp,
          assist_timestamp,
          is_opponent_team,
          opponent_team_name
        `)
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum)
        .not('tactics_position_x', 'is', null)
        .not('tactics_position_y', 'is', null)
        .eq('is_opponent_team', false);

      if (error) {
        console.error('match_attendance 조회 에러:', error);
        return [];
      }

      // 선수 정보를 별도로 가져오기
      const playerIds = data?.map(item => item.player_id).filter(id => id) || [];
      let playersInfo: any[] = [];
      
      if (playerIds.length > 0) {
        const { data: playersInfoData, error: playersInfoError } = await supabase
          .from('players')
          .select('id, name')
          .in('id', playerIds);
        
        if (playersInfoError) {
          console.error('선수 정보 조회 에러:', playersInfoError);
        } else {
          playersInfo = playersInfoData || [];
        }
      }
      
      // 데이터를 PlayerPosition 형식으로 변환
      const positions = data?.map(item => {
        const playerInfo = playersInfo.find(p => p.id === item.player_id);
        return {
          playerId: item.player_id,
          playerName: playerInfo?.name || 'Unknown',
          x: item.tactics_position_x || 50,
          y: item.tactics_position_y || 50,
          team: item.tactics_team || 'A',
          goals: item.goals || 0,
          assists: item.assists || 0,
          substitutions: item.substitutions || 0,
          isSubstituted: item.is_substituted || false
        };
      }) || [];

      return positions;
    } catch (error) {
      console.error('fetchAttendanceData 에러:', error);
      return [];
    }
  }, [matchIdNum, matchNumberNum]);

  // 출석한 선수 목록을 가져오는 함수 (상대팀 포함)
  const fetchAttendingPlayers = useCallback(async (): Promise<Array<{id: string; name: string; position: string; isOpponentTeam?: boolean}>> => {
    try {
      // 현재 경기에서 출석 데이터를 가져옵니다 (상대팀 포함)
      let { data, error } = await supabase
        .from('match_attendance')
        .select(`
          id,
          match_id,
          match_number,
          player_id,
          status,
          is_opponent_team,
          opponent_team_name
        `)
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum)
        .eq('status', 'attending') as { data: any; error: any };

      if (error) {
        console.error('출석 선수 조회 에러:', error);
        return [];
      }

      // 선수 정보를 별도로 가져오기
      const playerIds = data?.filter(item => !item.is_opponent_team).map(item => item.player_id).filter(id => id) || [];
      let playersInfo: any[] = [];
      
      if (playerIds.length > 0) {
        const { data: playersInfoData, error: playersInfoError } = await supabase
          .from('players')
          .select('id, name, position')
          .in('id', playerIds);
        
        if (playersInfoError) {
          console.error('선수 정보 조회 에러:', playersInfoError);
        } else {
          playersInfo = playersInfoData || [];
        }
      }

      return data?.map(item => {
        if (item.is_opponent_team) {
          // 상대팀인 경우
          return {
            id: `opponent_${item.opponent_team_name}`,
            name: item.opponent_team_name,
            position: '상대팀',
            isOpponentTeam: true
          };
        } else {
          // 일반 선수인 경우
          const playerInfo = playersInfo.find(p => p.id === item.player_id);
          return {
            id: item.player_id,
            name: playerInfo?.name || 'Unknown',
            position: playerInfo?.position || 'Unknown',
            isOpponentTeam: false
          };
        }
      }) || [];
    } catch (error) {
      return [];
    }
  }, [matchIdNum, matchNumberNum]);

  // 모든 선수 목록을 가져오는 함수
  const fetchAllPlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position')
        .order('name', { ascending: true }) as { data: any; error: any };

      if (error) {
        console.error('전체 선수 조회 에러:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('fetchAllPlayers 에러:', error);
      return [];
    }
  }, []);

  // 경기별 독립 데이터 관리를 위한 함수 (현재는 사용하지 않음)
  const cleanupDuplicateData = useCallback(async () => {
    // 각 경기는 독립적으로 관리됩니다.
  }, [matchNumberNum]);

  // 저장되지 않은 변경사항 확인
  const hasUnsavedChanges = () => {
    const currentData = formations[matchNumberNum];
    if (!currentData) return false;
    
    // DB 데이터와 비교하여 변경사항 확인
    const dbPositions = tacticsPlayers || [];
    const localPositions = currentData.positions || [];
    
    // 위치 개수나 내용이 다르면 변경사항 있음
    if (dbPositions.length !== localPositions.length) return true;
    
    // 개별 위치 비교
    for (let i = 0; i < localPositions.length; i++) {
      const local = localPositions[i];
      const db = dbPositions.find(p => p.player_id === local.playerId);
      
      if (!db || 
          Math.abs((db.tactics_position_x || 0) - local.x) > 0.1 || 
          Math.abs((db.tactics_position_y || 0) - local.y) > 0.1 || 
          db.tactics_team !== local.team) {
        return true;
      }
    }
    
    // DB에 없는 선수가 로컬에 있는지 확인
    for (let i = 0; i < dbPositions.length; i++) {
      const db = dbPositions[i];
      const local = localPositions.find(p => p.playerId === db.player_id);
      
      if (!local) {
        return true;
      }
    }
    
    // 전략 변경사항 확인
    if (tactics) {
      if (tactics.team_a_strategy !== currentData.teamA_strategy ||
          tactics.team_b_strategy !== currentData.teamB_strategy) {
        return true;
      }
    }
    
    return false;
  };

  // 특정 경기의 저장 상태 확인
  const getMatchSaveStatus = (matchNumber: number) => {
    const formationData = formations[matchNumber];
    if (!formationData) return 'no-data'; // 데이터 없음
    
    // 해당 경기의 DB 데이터 확인 (임시로 현재 로직 사용)
    // 실제로는 각 경기별로 DB 데이터를 확인해야 함
    if (matchNumber === matchNumberNum) {
      return hasUnsavedChanges() ? 'unsaved' : 'saved';
    }
    
    // 다른 경기는 기본적으로 저장된 것으로 간주 (실제로는 DB 확인 필요)
    return 'saved';
  };

  // 경기 변경 시 저장 확인
  const handleMatchChange = async (newMatchNumber: number) => {
    // 현재 경기와 같은 경기로 이동하려는 경우 무시
    if (newMatchNumber === matchNumberNum) {
      return;
    }
    
    // 저장되지 않은 변경사항이 있는지 확인
    if (hasUnsavedChanges()) {
      const shouldSave = window.confirm(
        '저장하지 않은 변경사항이 있습니다. 저장하시겠습니까?\n\n' +
        '취소를 누르면 현재 경기에 머무릅니다.\n' +
        '확인을 누르면 저장 후 이동합니다.'
      );
      
      if (shouldSave) {
        try {
          await saveFormation();
          toast.success('변경사항이 저장되었습니다.');
        } catch (error) {
          toast.error('저장에 실패했습니다.');
          return; // 저장 실패 시 이동하지 않음
        }
      } else {
        // 취소를 누른 경우 현재 경기에 머무름
        return;
      }
    }
    
    // 경기 변경 전에 중복 데이터 정리
    await cleanupDuplicateData();
    
    // 새 경기의 formations 상태 초기화
    setFormations(prev => ({
      ...prev,
      [newMatchNumber]: {
        name: `${newMatchNumber}경기 포메이션`,
        positions: [],
        created_by: userId || '',
        teamA_strategy: '',
        teamB_strategy: ''
      }
    }));
    
    // 득점 기록 초기화
    setGoalGroups([]);
    setGoalRecords([]);
    
    // 경기 변경 (useTactics 훅이 자동으로 새로운 데이터를 가져올 것임)
    navigate(`/tactics/${matchId}/${newMatchNumber}`);
  };

  // 경기 목록을 데이터베이스에서 로드
  useEffect(() => {
    const loadMatchNumbers = async () => {
      try {
        const numbers = await fetchMatchNumbers();
        setMatchNumbers(numbers);
        
        // 각 경기에 대해 기본 formations 설정
        const newFormations: Record<number, Formation> = {};
        numbers.forEach(num => {
          newFormations[num] = {
            name: `${num}경기 포메이션`,
            positions: [],
            created_by: userId || '',
            teamA_strategy: '',
            teamB_strategy: ''
          };
        });
        setFormations(newFormations);
      } catch (error) {
        console.error('경기 목록 로드 에러:', error);
        // 에러 시 기본값 설정
        setMatchNumbers([1]);
        setFormations({
          1: { name: '1경기 포메이션', positions: [], created_by: userId || '', teamA_strategy: '', teamB_strategy: '' }
        });
      }
    };

    if (matchIdNum) {
      loadMatchNumbers();
    }
  }, [matchIdNum, userId]);

  // DB에서 로드된 데이터를 formations에 반영
  useEffect(() => {
    // 경기나 경기 번호가 변경될 때마다 데이터를 로드
    if (matchIdNum && matchNumberNum) {
      const loadAttendanceData = async () => {
        const attendancePositions = await fetchAttendanceData();
        
        if (attendancePositions.length > 0) {
          // DB에서 가져온 포지션 데이터가 있으면 사용
          setFormations(prev => ({
            ...prev,
            [matchNumberNum]: {
              name: tactics?.name || `경기 #${matchId} - ${matchNumber}경기 작전판`,
              positions: attendancePositions,
              created_by: userId || '',
              teamA_strategy: tactics?.team_a_strategy || '',
              teamB_strategy: tactics?.team_b_strategy || ''
            }
          }));
        } else {
          // DB 데이터가 없으면 빈 상태로 설정하되, 기존 전략은 보존
          setFormations(prev => ({
            ...prev,
            [matchNumberNum]: {
              name: tactics?.name || `경기 #${matchId} - ${matchNumber}경기 작전판`,
              positions: [],
              created_by: userId || '',
              teamA_strategy: prev[matchNumberNum]?.teamA_strategy || tactics?.team_a_strategy || '',
              teamB_strategy: prev[matchNumberNum]?.teamB_strategy || tactics?.team_b_strategy || ''
            }
          }));
        }
      };

      loadAttendanceData();
    }
  }, [matchIdNum, matchNumberNum, tactics, fetchAttendanceData]);

  // 골키퍼 위치 판별 함수 (페널티 박스 내부)
  const isInPenaltyBox = (x: number, y: number, team: 'A' | 'B') => {
    // A팀 페널티 박스 (좌측): x: 0-18%, y: 25-75%
    // B팀 페널티 박스 (우측): x: 82-100%, y: 25-75%
    if (team === 'A') {
      return x >= 0 && x <= 10 && y >= 45 && y <= 55;
    } else {
      return x >= 90 && x <= 100 && y >= 45 && y <= 55;
    }
  };

  // 현재 사용자인지 확인하는 함수
  const isCurrentUser = (playerName: string) => {
    return userName && playerName.includes(userName);
  };

  // 전략 업데이트 함수
  const updateStrategy = (team: 'A' | 'B', strategy: string) => {
    if (!canEdit) return;
    
    setFormations(prev => ({
      ...prev,
      [matchNumberNum]: {
        ...prev[matchNumberNum],
        [team === 'A' ? 'teamA_strategy' : 'teamB_strategy']: strategy
      }
    }));
  };

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

  // 출석한 선수 목록 로드
  useEffect(() => {
    const loadAttendingPlayers = async () => {
      const attending = await fetchAttendingPlayers();
      setAttendingPlayers(attending);
    };

    if (matchIdNum && matchNumberNum) {
      loadAttendingPlayers();
    }
  }, [matchIdNum, matchNumberNum, fetchAttendingPlayers]);

  // 모든 선수 목록 로드
  useEffect(() => {
    const loadAllPlayers = async () => {
      const players = await fetchAllPlayers();
      setAllPlayers(players);
    };

    loadAllPlayers();
  }, [fetchAllPlayers]);

  useEffect(() => {
    // 출석한 선수들 중에서 이미 배치된 선수들을 제외한 사용 가능한 선수 목록 업데이트 (가나다순 정렬)
    const placedPlayerIds = currentFormation?.positions?.map(pos => pos.playerId) || [];
    const sortedPlayers = attendingPlayers
      .filter(player => !placedPlayerIds.includes(player.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
    setAvailablePlayers(sortedPlayers as any[]);
  }, [attendingPlayers, currentFormation?.positions]);

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
    const minDistance = 6; // 최소 거리 (%) - 12%에서 6%로 축소
    
    return !currentFormation?.positions?.some(pos => {
      if (excludePlayerId && pos.playerId === excludePlayerId) return false;
      const distance = Math.sqrt(Math.pow(pos.x - newX, 2) + Math.pow(pos.y - newY, 2));
      return distance < minDistance;
    }) || false;
  };

  // 가장 가까운 빈 공간 찾기
  const findNearestValidPosition = (targetX: number, targetY: number, excludePlayerId?: string) => {
    // 우선 원하는 위치가 가능한지 확인
    if (checkMinDistance(targetX, targetY, excludePlayerId)) {
      return { x: targetX, y: targetY };
    }

    // 원하는 위치 주변에서 나선형으로 빈 공간 탐색
    const step = 2; // 3에서 2로 더 세밀하게
    for (let radius = step; radius <= 20; radius += step) { // 25에서 20으로 축소
      for (let angle = 0; angle < 360; angle += 20) { // 30도에서 20도로 더 세밀하게
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
    // 상대팀인지 확인
    const isOpponentTeam = player.id && player.id.startsWith('opponent_');
    if (isOpponentTeam) {
      toast.error('상대팀은 경기장에 배치할 수 없습니다');
      return;
    }

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
      // 상대팀인지 확인
      const isOpponentTeam = pickedPlayer.id && pickedPlayer.id.startsWith('opponent_');
      if (isOpponentTeam) {
        toast.error('상대팀은 경기장에 배치할 수 없습니다');
        return;
      }

      // 위치에 따라 자동으로 팀 결정
      let targetTeam: 'A' | 'B';
      if (targetX <= 50) {
        targetTeam = 'A';
      } else {
        targetTeam = 'B';
      }

      // B팀(상대팀) 진영에 배치하려는 경우 제한
      if (targetTeam === 'B') {
        // 상대팀이 있는지 확인
        const hasOpponentTeam = attendingPlayers.some(player => player.isOpponentTeam);
        if (hasOpponentTeam) {
          toast.error('상대팀 진영에는 선수를 배치할 수 없습니다');
          return;
        }
      }

      // 경기장에 이미 있는 선수를 이동하는 경우
      if (pickedPlayer.isOnField) {
        const validPosition = findNearestValidPosition(targetX, targetY, pickedPlayer.id);
        const currentPlayer = currentFormation.positions.find(p => p.playerId === pickedPlayer.id);
        
        // 팀이 변경되는 경우 알림
        if (currentPlayer && currentPlayer.team !== targetTeam) {
          toast.success(`${pickedPlayer.name}이(가) ${getTeamName(targetTeam)}으로 이동했습니다`);
        }
        
        updatePlayerPosition(pickedPlayer.id, validPosition.x, validPosition.y, targetTeam);
      } else {
        // 벤치에서 경기장으로 새로 배치하는 경우
        // 선택된 팀과 배치 위치가 다르면 경고하고 위치에 따라 팀 결정
        if (selectedTeam !== targetTeam) {
          toast.info(`위치에 따라 ${getTeamName(targetTeam)}으로 배치됩니다`);
        }
        
        const validPosition = findNearestValidPosition(targetX, targetY);
        const newPosition: PlayerPosition = {
          playerId: pickedPlayer.id,
          playerName: pickedPlayer.name,
          x: validPosition.x,
          y: validPosition.y,
          team: targetTeam
        };

        setFormations(prev => ({
          ...prev,
          [matchNumberNum]: {
            ...prev[matchNumberNum],
            positions: [...prev[matchNumberNum].positions, newPosition]
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
      [matchNumberNum]: {
        ...prev[matchNumberNum],
        positions: prev[matchNumberNum].positions.map(pos =>
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
      [matchNumberNum]: {
        ...prev[matchNumberNum],
        positions: prev[matchNumberNum].positions.filter(pos => pos.playerId !== playerId)
      }
    }));
  };

  // 팀별 선수 수 계산
  const getTeamPlayerCount = (team: 'A' | 'B') => {
    return currentFormation?.positions?.filter(pos => pos.team === team).length || 0;
  };

  // 자체 경기 여부 확인 (함수)
  const checkIsSelfMatch = () => {
    // 상대팀이 있는지 확인
    const hasOpponentTeam = attendingPlayers.some(player => player.isOpponentTeam);
    return !hasOpponentTeam;
  };

  // 팀명 표시 함수
  const getTeamName = (team: 'A' | 'B') => {
    if (checkIsSelfMatch()) {
      // 자체 경기인 경우 A팀, B팀으로 표시
      return team === 'A' ? 'A팀' : 'B팀';
    } else {
      // 대외 경기인 경우
      if (team === 'A') {
        return '무쏘';
      } else {
        // 상대팀 이름이 있는지 확인
        const opponentTeam = attendingPlayers.find(player => player.isOpponentTeam);
        return opponentTeam ? opponentTeam.name : 'B팀';
      }
    }
  };

  const refreshGoalRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('match_attendance')
        .select(`
          player_id, 
          goals, 
          assists, 
          goal_timestamp, 
          assist_timestamp, 
          tactics_team,
          is_opponent_team,
          opponent_team_name
        `)
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum);
      
      if (error) {
        return;
      }

    // 선수 이름을 가져오기 위해 별도 쿼리
    const playerIds = (data || [])
      .filter(item => (item.goals > 0 || item.assists > 0))
      .map(item => item.player_id)
      .filter(id => id); // null 값 제거
    
    let playerNames: { [key: string]: string } = {};
    if (playerIds.length > 0) {
      const { data: playersData } = await supabase
        .from('players')
        .select('id, name')
        .in('id', playerIds);
      
      if (playersData) {
        playersData.forEach(player => {
          playerNames[player.id] = player.name;
        });
      }
    }
    
    const records = (data || [])
      .filter(item => (item.goals > 0 || item.assists > 0))
      .map(item => {
        // 상대팀인지 확인
        const isOpponentTeam = item.is_opponent_team;
        
        // 선수의 팀 정보 결정: DB의 tactics_team을 우선 사용, 없으면 경기장 배치 팀 사용
        let team = item.tactics_team || 'A';
        
        // DB에 tactics_team이 없으면 경기장 배치 팀 정보 사용
        if (!item.tactics_team) {
          if (isOpponentTeam) {
            // 상대팀은 B팀으로 설정
            team = 'B';
          } else {
            const playerPosition = currentFormation.positions.find(pos => pos.playerId === item.player_id);
            team = playerPosition?.team || 'A';
          }
        }
        
        const record = {
          id: isOpponentTeam ? `opponent_${item.opponent_team_name}` : item.player_id,
          name: isOpponentTeam ? item.opponent_team_name : (playerNames[item.player_id] || ''),
          goals: item.goals,
          assists: item.assists,
          goal_timestamp: item.goal_timestamp,
          assist_timestamp: item.assist_timestamp,
          team
        };
        
        return record;
      });
    setGoalRecords(records);
    
    // goalGroups 초기화 (DB 데이터를 기반으로)
    const goalGroupsFromDB: GoalGroup[] = [];

    // 득점자들을 찾아서 각각에 대해 어시스트 매칭 시도
    const scorers = records.filter(record => record.goals > 0);
    
            // 각 득점자별로 여러 득점을 시간순으로 처리
        scorers.forEach(scorer => {
          if (scorer.goals > 0) {
            let timestamps: string[] = [];
            
            if (scorer.goal_timestamp) {
              // goal_timestamp가 쉼표로 구분되어 있으면 분리, 아니면 단일 값
              if (scorer.goal_timestamp.includes(',')) {
                timestamps = scorer.goal_timestamp.split(',').map(t => t.trim());
              } else {
                timestamps = [scorer.goal_timestamp];
              }
            } else {
              // goal_timestamp가 없으면 득점 수만큼 빈 timestamp로 생성
              for (let i = 0; i < scorer.goals; i++) {
                timestamps.push(`득점${i + 1}`);
              }
            }
        
        // 각 득점에 대해 GoalGroup 생성
        timestamps.forEach((timestamp, index) => {
          // 어시스트 매칭 (DB 데이터만 사용)
          let assistant = null;
          let team = scorer.team;
          
          // DB에서 같은 시간대의 어시스트 찾기
          const matchingAssistant = records.find(record => {
            if (!record.assists || record.assists <= 0 || record.id === scorer.id || record.team !== scorer.team) {
              return false;
            }
            
            // assist_timestamp가 쉼표로 구분되어 있으면 분리하여 확인
            if (record.assist_timestamp) {
              if (record.assist_timestamp.includes(',')) {
                const assistTimestamps = record.assist_timestamp.split(',').map(t => t.trim());
                return assistTimestamps.includes(timestamp);
              } else {
                return record.assist_timestamp === timestamp;
              }
            }
            return false;
          });
          
          if (matchingAssistant) {
            assistant = {
              id: matchingAssistant.id,
              name: matchingAssistant.name
            };
          }
          
          const goalGroup = {
            id: `${scorer.id}-${timestamp}-${index}`, // 인덱스 추가로 고유성 보장
            scorerId: scorer.id,
            scorerName: scorer.name,
            assistantId: assistant?.id,
            assistantName: assistant?.name,
            team: team, // 결정된 팀 정보 사용
            timestamp: timestamp
          };
          
          goalGroupsFromDB.push(goalGroup);
        });
      }
    });

    // 시간순으로 정렬 (이른 시간 순서) - A팀, B팀 구분 없이 시간 순서대로
    goalGroupsFromDB.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        // 한국어 시간 형식 (오전/오후 HH:MM:SS) 파싱
        const parseTime = (timeStr: string) => {
          // "오전 12:12:49" 또는 "오후 3:45:30" 형식 처리
          const match = timeStr.match(/(오전|오후)\s*(\d{1,2}):(\d{2}):(\d{2})/);
          if (match) {
            const [, ampm, hours, minutes, seconds] = match;
            let hour = parseInt(hours);
            
            // 오후인 경우 12를 더함 (오후 1시 = 13시)
            if (ampm === '오후' && hour !== 12) {
              hour += 12;
            }
            // 오전 12시는 0시로 변환
            if (ampm === '오전' && hour === 12) {
              hour = 0;
            }
            
            return hour * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
          }
          
          // 기존 HH:MM:SS 형식도 지원
          const parts = timeStr.split(':');
          if (parts.length >= 2) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
            return hours * 3600 + minutes * 60 + seconds;
          }
          
          return 0;
        };
        
        const timeA = parseTime(a.timestamp);
        const timeB = parseTime(b.timestamp);
        return timeA - timeB;
      }
      // timestamp가 없는 경우를 위한 fallback
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1; // timestamp가 없는 항목을 뒤로
      if (!b.timestamp) return -1;
      return 0;
    });

    setGoalGroups(goalGroupsFromDB);
  } catch (error) {
    // 에러 무시
  }
  }, [matchIdNum, matchNumberNum, currentFormation.positions]);

  // 스코어 계산 함수
  const calculateScore = useCallback(() => {
    let teamAScore = 0;
    let teamBScore = 0;
    
    goalGroups.forEach(group => {
      if (group.team === 'A') {
        teamAScore += 1;
      } else if (group.team === 'B') {
        teamBScore += 1;
      }
    });
    
    return { teamA: teamAScore, teamB: teamBScore };
  }, [goalGroups]);

  useEffect(() => {
    refreshGoalRecords();
  }, [matchIdNum, matchNumberNum, refreshGoalRecords, currentFormation.positions]);

  // 득점 추가 모달 열릴 때 editGoalGroup이 있으면 newGoal을 해당 값으로 초기화
  useEffect(() => {
    if (editGoalGroup) {
      setShowGoalModal(true);
      setNewGoal({
        scorer: editGoalGroup.scorerId,
        assistant: editGoalGroup.assistantId || '',
        team: editGoalGroup.team
      });
    }
  }, [editGoalGroup]);

  // addGoalRecord에서 editGoalGroup이 있으면 기존 기록 -1, 새 기록 +1, goalGroups 갱신
  const addGoalRecord = async () => {
    if (!newGoal.scorer) {
      toast.error('득점자를 선택해주세요');
      return;
    }
    try {
      // 현재 시간 생성 (수정 시에는 기존 시간 유지)
      const currentTime = editGoalGroup ? editGoalGroup.timestamp : new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      // 수정 시에는 기존 시간을 유지하고, 새로 추가하는 경우에만 현재 시간 사용
      const targetTime = editGoalGroup ? editGoalGroup.timestamp : currentTime;
      
      // 기존 기록이 있으면 -1 처리
      if (editGoalGroup) {
        await removeGoalRecord(editGoalGroup.scorerId, 'goal');
        if (editGoalGroup.assistantId) await removeGoalRecord(editGoalGroup.assistantId, 'assist');
      }
      
      // 상대팀인지 확인
      const isOpponentTeam = newGoal.scorer.startsWith('opponent_');
      const playerId = isOpponentTeam ? null : newGoal.scorer;
      const opponentTeamName = isOpponentTeam ? newGoal.scorer.replace('opponent_', '') : null;
      
      // 득점자 +1 및 goal_timestamp 저장
      const { data: scorerData } = await supabase
        .from('match_attendance')
        .select('goals, goal_timestamp')
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum)
        .eq(isOpponentTeam ? 'opponent_team_name' : 'player_id', isOpponentTeam ? opponentTeamName : playerId)
        .eq('is_opponent_team', isOpponentTeam)
        .single();
      
      // 업데이트할 데이터 준비
      const updateData: any = { 
        goals: (scorerData?.goals || 0) + 1,
        tactics_team: newGoal.team // 득점자의 팀 정보 업데이트
      };
      
      // goal_timestamp 설정 (수정 시에는 기존 시간 유지, 새로 추가 시에는 현재 시간 사용)
      if (scorerData?.goal_timestamp) {
        updateData.goal_timestamp = scorerData.goal_timestamp + ',' + targetTime;
      } else {
        updateData.goal_timestamp = targetTime;
      }
      
      await supabase
        .from('match_attendance')
        .update(updateData)
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum)
        .eq(isOpponentTeam ? 'opponent_team_name' : 'player_id', isOpponentTeam ? opponentTeamName : playerId)
        .eq('is_opponent_team', isOpponentTeam);
      
      // 어시스트자 +1 및 assist_timestamp 저장
      if (newGoal.assistant) {
        const isOpponentTeam = newGoal.assistant.startsWith('opponent_');
        const assistantPlayerId = isOpponentTeam ? null : newGoal.assistant;
        const assistantOpponentTeamName = isOpponentTeam ? newGoal.assistant.replace('opponent_', '') : null;
        
        const { data: assistantData } = await supabase
          .from('match_attendance')
          .select('assists, assist_timestamp')
          .eq('match_id', matchIdNum)
          .eq('match_number', matchNumberNum)
          .eq(isOpponentTeam ? 'opponent_team_name' : 'player_id', isOpponentTeam ? assistantOpponentTeamName : assistantPlayerId)
          .eq('is_opponent_team', isOpponentTeam)
          .single();
        
        // 업데이트할 데이터 준비
        const assistantUpdateData: any = { 
          assists: (assistantData?.assists || 0) + 1,
          tactics_team: newGoal.team // 어시스트의 팀 정보 업데이트
        };
        
        // assist_timestamp 설정 (수정 시에는 기존 시간 유지, 새로 추가 시에는 현재 시간 사용)
        if (assistantData?.assist_timestamp) {
          assistantUpdateData.assist_timestamp = assistantData.assist_timestamp + ',' + targetTime;
        } else {
          assistantUpdateData.assist_timestamp = targetTime;
        }
        
        await supabase
          .from('match_attendance')
          .update(assistantUpdateData)
          .eq('match_id', matchIdNum)
          .eq('match_number', matchNumberNum)
          .eq(isOpponentTeam ? 'opponent_team_name' : 'player_id', isOpponentTeam ? assistantOpponentTeamName : assistantPlayerId)
          .eq('is_opponent_team', isOpponentTeam);
      }
      
      // goalGroups 갱신
      const scorerName = attendingPlayers.find(p => p.id === newGoal.scorer)?.name || '';
      const assistantName = newGoal.assistant ? attendingPlayers.find(p => p.id === newGoal.assistant)?.name || '' : '';
      const groupId = editGoalGroup ? editGoalGroup.id : `${newGoal.scorer}-${targetTime}`;
      
      setGoalGroups(prev => {
        let arr = prev;
        if (editGoalGroup) arr = arr.filter(g => g.id !== editGoalGroup.id);
        const newGoalGroups = [
          ...arr,
          {
            id: groupId,
            scorerId: newGoal.scorer,
            scorerName,
            assistantId: newGoal.assistant || undefined,
            assistantName: assistantName || undefined,
            team: newGoal.team,
            timestamp: targetTime // 수정 시에는 기존 시간 유지
          }
        ];
        
        // 시간순으로 정렬 (이른 시간 순서) - A팀, B팀 구분 없이 시간 순서대로
        return newGoalGroups.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            // 한국어 시간 형식 (오전/오후 HH:MM:SS) 파싱
            const parseTime = (timeStr: string) => {
              // "오전 12:12:49" 또는 "오후 3:45:30" 형식 처리
              const match = timeStr.match(/(오전|오후)\s*(\d{1,2}):(\d{2}):(\d{2})/);
              if (match) {
                const [, ampm, hours, minutes, seconds] = match;
                let hour = parseInt(hours);
                
                // 오후인 경우 12를 더함 (오후 1시 = 13시)
                if (ampm === '오후' && hour !== 12) {
                  hour += 12;
                }
                // 오전 12시는 0시로 변환
                if (ampm === '오전' && hour === 12) {
                  hour = 0;
                }
                
                return hour * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
              }
              
              // 기존 HH:MM:SS 형식도 지원
              const parts = timeStr.split(':');
              if (parts.length >= 2) {
                const hours = parseInt(parts[0]);
                const minutes = parseInt(parts[1]);
                const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
                return hours * 3600 + minutes * 60 + seconds;
              }
              
              return 0;
            };
            
            const timeA = parseTime(a.timestamp);
            const timeB = parseTime(b.timestamp);
            return timeA - timeB;
          }
          // timestamp가 없는 경우를 위한 fallback
          if (!a.timestamp && !b.timestamp) return 0;
          if (!a.timestamp) return 1; // timestamp가 없는 항목을 뒤로
          if (!b.timestamp) return -1;
          return 0;
        });
      });
      
      // 득점 기록 새로고침
      await refreshGoalRecords();
      
      setShowGoalModal(false);
      setEditGoalGroup(null);
      setNewGoal({ scorer: '', assistant: '', team: 'A' });
      toast.success(`${getTeamName(newGoal.team)} 득점이 저장되었습니다`);
    } catch (error) {
      toast.error('득점기록 저장에 실패했습니다');
    }
  };

  const removeGoalRecord = async (playerId: string, type: 'goal' | 'assist') => {
    const column = type === 'goal' ? 'goals' : 'assists';
    const timestampColumn = type === 'goal' ? 'goal_timestamp' : 'assist_timestamp';
    
    try {
      // 상대팀인지 확인
      const isOpponentTeam = playerId.startsWith('opponent_');
      const actualPlayerId = isOpponentTeam ? null : playerId;
      const opponentTeamName = isOpponentTeam ? playerId.replace('opponent_', '') : null;
      
      // 현재 값 조회
      const { data: currentData, error: fetchError } = await supabase
        .from('match_attendance')
        .select(`${column}, ${timestampColumn}`)
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum)
        .eq(isOpponentTeam ? 'opponent_team_name' : 'player_id', isOpponentTeam ? opponentTeamName : actualPlayerId)
        .eq('is_opponent_team', isOpponentTeam)
        .single();
      
      if (fetchError) {
        console.error('데이터 조회 에러:', fetchError);
        toast.error('기록 삭제에 실패했습니다');
        return;
      }
      
      // 현재 값에서 1 감소 (최소 0)
      const newValue = Math.max((currentData?.[column] || 0) - 1, 0);
      
      // 업데이트할 데이터 준비
      const updateData: any = { [column]: newValue };
      
      // timestamp 처리
      if (newValue === 0) {
        // 값이 0이 되면 timestamp도 null로 설정
        updateData[timestampColumn] = null;
      } else if (currentData?.[timestampColumn]) {
        // 값이 남아있으면 timestamp에서 마지막 항목 제거
        const timestamps = currentData[timestampColumn].split(',').map(t => t.trim());
        if (timestamps.length > 1) {
          timestamps.pop(); // 마지막 항목 제거
          updateData[timestampColumn] = timestamps.join(', ');
        } else {
          updateData[timestampColumn] = null;
        }
      }
      
      const { error: updateError } = await supabase
        .from('match_attendance')
        .update(updateData)
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum)
        .eq(isOpponentTeam ? 'opponent_team_name' : 'player_id', isOpponentTeam ? opponentTeamName : actualPlayerId)
        .eq('is_opponent_team', isOpponentTeam);
      
      if (updateError) {
        console.error('업데이트 에러:', updateError);
        toast.error('기록 삭제에 실패했습니다');
        return;
      }
      
      toast.success('기록이 삭제되었습니다');
      await refreshGoalRecords();
    } catch (error) {
      console.error('기록 삭제 에러:', error);
      toast.error('기록 삭제에 실패했습니다');
    }
  };

  // 선수 추가
  const addPlayerToAttendance = async () => {
    if (!selectedPlayerToAdd) {
      toast.error('추가할 선수를 선택해주세요');
      return;
    }

    try {
      // 이미 출석한 선수인지 확인
      const isAlreadyAttending = attendingPlayers.some(player => player.id === selectedPlayerToAdd);
      if (isAlreadyAttending) {
        toast.error('이미 출석한 선수입니다');
        return;
      }

      // 선택된 선수 정보 가져오기
      const playerToAdd = allPlayers.find(player => player.id === selectedPlayerToAdd);
      if (!playerToAdd) {
        toast.error('선수 정보를 찾을 수 없습니다');
        return;
      }

      // match_attendance에 추가 (기존 포지션 데이터 보존)
      const { error } = await supabase
        .from('match_attendance')
        .upsert({
          match_id: matchIdNum,
          match_number: matchNumberNum, // 현재 경기 번호 사용
          player_id: selectedPlayerToAdd,
          status: 'attending',
          // 기존 포지션 데이터가 있으면 보존, 없으면 null
          tactics_position_x: null,
          tactics_position_y: null,
          tactics_team: null,
          goals: 0,
          assists: 0,
          substitutions: 0,
          is_substituted: false
        }, {
          onConflict: 'match_id,match_number,player_id'
        });

      if (error) {
        console.error('선수 추가 에러:', error);
        toast.error('선수 추가에 실패했습니다');
        return;
      }

      // 출석한 선수 목록 새로고침
      const updatedAttending = await fetchAttendingPlayers();
      setAttendingPlayers(updatedAttending);

      setSelectedPlayerToAdd('');
      setShowAddPlayerModal(false);
      toast.success(`${playerToAdd.name} 선수가 추가되었습니다`);
    } catch (error) {
      console.error('선수 추가 에러:', error);
      toast.error('선수 추가에 실패했습니다');
    }
  };

  // 상대팀 추가 함수
  const addOpponentTeam = async () => {
    if (!opponentTeamName.trim()) {
      toast.error('상대팀 이름을 입력해주세요.');
      return;
    }

    try {
      // 상대팀을 match_attendance에 추가
      const { error } = await supabase
        .from('match_attendance')
        .insert({
          match_id: matchIdNum,
          match_number: matchNumberNum,
          player_id: null, // 상대팀은 player_id가 null
          status: 'attending',
          is_opponent_team: true,
          opponent_team_name: opponentTeamName.trim(),
          tactics_position_x: null,
          tactics_position_y: null,
          tactics_team: null,
          goals: 0,
          assists: 0,
          substitutions: 0,
          is_substituted: false
        });

      if (error) {
        console.error('상대팀 추가 에러:', error);
        toast.error('상대팀 추가에 실패했습니다');
        return;
      }

      // 출석한 선수 목록 새로고침
      const updatedAttending = await fetchAttendingPlayers();
      setAttendingPlayers(updatedAttending);

      setOpponentTeamName('');
      setShowAddOpponentModal(false);
      toast.success(`${opponentTeamName.trim()} 팀이 추가되었습니다`);
    } catch (error) {
      console.error('상대팀 추가 에러:', error);
      toast.error('상대팀 추가에 실패했습니다');
    }
  };

  // 저장 함수 수정
  const saveFormation = async () => {
    if (!canEdit) {
      toast.error('수정 권한이 없습니다');
      return;
    }
    try {
      // 저장 전에 다른 경기의 중복 데이터 정리
      await cleanupDuplicateData();
      
      // 현재 DB에서 득점 기록을 가져와서 보존
      const { data: currentAttendanceData } = await supabase
        .from('match_attendance')
        .select('player_id, goals, assists, goal_timestamp, assist_timestamp, tactics_team')
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum);
      
      // 선수별 득점 기록 매핑
      const goalRecordsMap = new Map();
      currentAttendanceData?.forEach(record => {
        goalRecordsMap.set(record.player_id, {
          goals: record.goals || 0,
          assists: record.assists || 0,
          goal_timestamp: record.goal_timestamp,
          assist_timestamp: record.assist_timestamp,
          tactics_team: record.tactics_team
        });
      });
      
      const formData = {
        match_id: matchIdNum,
        match_number: matchNumberNum,
        name: currentFormation.name,
        team_a_strategy: currentFormation.teamA_strategy,
        team_b_strategy: currentFormation.teamB_strategy,
        players: currentFormation.positions.map(player => {
          const goalRecord = goalRecordsMap.get(player.playerId);
          return {
            player_id: player.playerId,
            tactics_position_x: player.x,
            tactics_position_y: player.y,
            tactics_team: player.team,
            substitutions: player.substitutions || 0,
            is_substituted: player.isSubstituted || false,
            goals: goalRecord?.goals || player.goals || 0,
            assists: goalRecord?.assists || player.assists || 0
          };
        })
      };
      
      const result = await saveTactics(formData);
      if (result.success) {
        toast.success('작전판이 저장되었습니다');
      } else {
        toast.error('저장에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving formation:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  // 포메이션 초기화
  const resetFormation = async () => {
    if (!canEdit) return;
    
    // 확인 대화상자
    const confirmed = window.confirm(
      `정말로 ${matchNumber}경기의 작전판을 초기화하시겠습니까?\n\n` +
      '이 작업은 되돌릴 수 없으며, 모든 선수 위치, 전략, 득점 기록이 삭제됩니다.'
    );
    
    if (!confirmed) return;
    
    try {
      // 1. match_attendance 테이블에서 해당 경기의 위치 정보와 득점 기록 초기화
      const { error: attendanceError } = await supabase
        .from('match_attendance')
        .update({
          tactics_position_x: null,
          tactics_position_y: null,
          tactics_team: null,
          goals: 0,
          assists: 0,
          substitutions: 0,
          is_substituted: false,
          goal_timestamp: null,
          assist_timestamp: null
        })
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum);

      if (attendanceError) {
        console.error('match_attendance 초기화 에러:', attendanceError);
        toast.error("선수 위치 및 득점 기록 초기화에 실패했습니다.");
        return;
      }

      // 2. tactics 테이블에서 해당 경기의 전략 정보 삭제
      const { error: tacticsError } = await supabase
        .from('tactics')
        .delete()
        .eq('match_id', matchIdNum)
        .eq('match_number', matchNumberNum);

      if (tacticsError) {
        console.error('tactics 초기화 에러:', tacticsError);
        toast.error("전략 정보 초기화에 실패했습니다.");
        return;
      }
      
      // 3. 로컬 상태 초기화
      setFormations(prev => ({
        ...prev,
        [matchNumberNum]: {
          ...prev[matchNumberNum],
          positions: [],
          teamA_strategy: '',
          teamB_strategy: ''
        }
      }));

      // 4. 득점 기록 초기화
      setGoalGroups([]);
      setGoalRecords([]);

      toast.success(`${matchNumber}경기 포메이션이 초기화되었습니다`);
    } catch (error) {
      console.error('Failed to reset formation:', error);
      toast.error('초기화에 실패했습니다');
    }
  };

  // 경기 추가
  const addMatch = async () => {
    setShowAddMatchModal(true);
  };

  const handleAddMatch = async () => {
    const newMatchNumber = Math.max(...matchNumbers, 0) + 1;
    
    try {
      // 1. 1경기의 출석 데이터를 가져와서 새 경기에 복사
      const { data: firstMatchAttendance, error: fetchError } = await supabase
        .from('match_attendance')
        .select('*')
        .eq('match_id', matchIdNum)
        .eq('match_number', 1)
        .eq('status', 'attending');

      if (fetchError) {
        console.error('1경기 출석 데이터 조회 에러:', fetchError);
        toast.error('새 경기 생성에 실패했습니다');
        return;
      }

      // 2. 새 경기에 출석 데이터 복사
      if (firstMatchAttendance && firstMatchAttendance.length > 0) {
        const newAttendanceData = firstMatchAttendance.map(attendance => ({
          match_id: matchIdNum,
          match_number: newMatchNumber,
          player_id: attendance.player_id,
          status: 'attending',
          goals: 0,
          assists: 0,
          rating: 0,
          tactics_position_x: null,
          tactics_position_y: null,
          tactics_team: null,
          substitutions: 0,
          is_substituted: false,
          goal_timestamp: null,
          assist_timestamp: null
        }));

        const { error: insertError } = await supabase
          .from('match_attendance')
          .insert(newAttendanceData);

        if (insertError) {
          console.error('새 경기 출석 데이터 생성 에러:', insertError);
          toast.error('새 경기 생성에 실패했습니다');
          return;
        }
      }

      // 자체경기가 아닌 경우 상대팀 추가
      if (!isSelfMatchState && newMatchOpponentName.trim()) {
        const { error: opponentError } = await supabase
          .from('match_attendance')
          .insert({
            match_id: matchIdNum,
            match_number: newMatchNumber,
            player_id: null,
            status: 'attending',
            goals: 0,
            assists: 0,
            rating: 0,
            tactics_position_x: null,
            tactics_position_y: null,
            tactics_team: null,
            substitutions: 0,
            is_substituted: false,
            goal_timestamp: null,
            assist_timestamp: null,
            is_opponent_team: true,
            opponent_team_name: newMatchOpponentName.trim()
          });

        if (opponentError) {
          console.error('상대팀 추가 에러:', opponentError);
          toast.error('상대팀 추가에 실패했습니다');
        }
      }

      // 3. formations에 새 경기 추가
      setFormations(prev => ({
        ...prev,
        [newMatchNumber]: {
          name: `${newMatchNumber}경기 포메이션`,
          positions: [],
          created_by: userId || '',
          teamA_strategy: '',
          teamB_strategy: ''
        }
      }));
      
      // 4. matchNumbers에 새 경기 번호 추가
      setMatchNumbers(prev => [...prev, newMatchNumber].sort((a, b) => a - b));
      
      // 5. 모달 닫기 및 상태 초기화
      setShowAddMatchModal(false);
      setIsSelfMatchState(true);
      setNewMatchOpponentName('');
      
      // 6. 새 경기로 이동
      navigate(`/tactics/${matchId}/${newMatchNumber}`);
      
      toast.success(`${newMatchNumber}경기가 추가되었습니다`);
    } catch (error) {
      console.error('경기 추가 에러:', error);
      toast.error('새 경기 생성에 실패했습니다');
    }
  };

  // 경기 삭제
  const deleteMatch = async (matchNumber: number) => {
    if (Object.keys(formations).length <= 1) return; // 최소 1개는 유지
    
    try {
      // 1. Supabase에서 해당 경기의 작전판 데이터 삭제
      const { error: tacticsError } = await supabase
        .from('tactics')
        .delete()
        .eq('match_id', matchId)
        .eq('match_number', matchNumber);

      if (tacticsError) {
        console.error('tactics 삭제 에러:', tacticsError);
        toast.error("작전판 데이터 삭제에 실패했습니다.");
        return;
      }

      // 2. match_attendance 테이블에서 해당 경기의 모든 행 삭제
      const { error: attendanceError } = await supabase
        .from('match_attendance')
        .delete()
        .eq('match_id', matchId)
        .eq('match_number', matchNumber);

      if (attendanceError) {
        console.error('match_attendance 초기화 에러:', attendanceError);
        toast.error("선수 위치 데이터 초기화에 실패했습니다.");
        return;
      }

      // 3. 로컬 상태에서 해당 경기 삭제
      const newFormations = { ...formations };
      delete newFormations[matchNumber];
      setFormations(newFormations);
      
      // 4. matchNumbers에서도 해당 경기 번호 제거
      setMatchNumbers(prev => prev.filter(num => num !== matchNumber));
      
      // 5. 삭제된 경기가 현재 선택된 경기면 첫 번째 경기로 변경
      if (matchNumberNum === matchNumber) {
        const remainingMatchNumbers = matchNumbers.filter(num => num !== matchNumber).sort((a, b) => a - b);
        if (remainingMatchNumbers.length > 0) {
          const firstMatchNumber = remainingMatchNumbers[0];
          navigate(`/tactics/${matchId}/${firstMatchNumber}`);
        }
      }

      toast.success(`${matchNumber}경기 작전판이 삭제되었습니다.`);
    } catch (error) {
      console.error('경기 삭제 에러:', error);
      toast.error("경기 삭제 중 오류가 발생했습니다.");
    }
  };

  // 다음 페이지로 이동하는 함수
  const handleNextPage = async () => {
    if (hasUnsavedChanges()) {
      toast.error('저장되지 않은 변경사항이 있습니다. 먼저 저장해주세요.');
      return;
    }
    
    try {
      // 선수 스탯 페이지로 이동
      navigate(`/stats-management?matchId=${matchId}&matchNumber=${matchNumberNum}`);
    } catch (error) {
      toast.error('페이지 이동에 실패했습니다.');
    }
  };

  // 5. 삭제 함수
  const handleDeleteGoalGroup = async (group: GoalGroup) => {
    if (!window.confirm('정말로 이 득점 기록을 삭제하시겠습니까?')) return;
    // 득점자 -1
    await removeGoalRecord(group.scorerId, 'goal');
    // 어시스트자 -1
    if (group.assistantId) await removeGoalRecord(group.assistantId, 'assist');
    // 득점 기록 새로고침
    await refreshGoalRecords();
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* 세션 만료 표시는 제거하고, 현재 경기 번호만 표시 */}
                <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {matchNumber}경기
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
                {matchNumbers.map((matchNumber) => {
                  const saveStatus = getMatchSaveStatus(matchNumber);
                  const isCurrentMatch = matchNumberNum === matchNumber;
                  
                  return (
                    <div key={matchNumber} className="relative">
                      <Button
                        variant={isCurrentMatch ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          // 경기 선택 시 저장 확인 후 이동
                          handleMatchChange(matchNumber);
                        }}
                        className={`text-xs sm:text-sm relative ${
                          isCurrentMatch
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "hover:bg-blue-50"
                        }`}
                      >
                        {matchNumber}경기
                        {/* 저장 상태 표시 - 왼쪽 위로 이동하고 더 눈에 띄게 */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white shadow-lg">
                          {saveStatus === 'saved' && (
                            <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                          )}
                          {saveStatus === 'unsaved' && (
                            <div className="w-full h-full bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                          )}
                          {saveStatus === 'no-data' && (
                            <div className="w-full h-full bg-gray-400 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {/* 저장 상태 텍스트 표시 (작은 화면에서는 숨김) */}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[8px] font-medium">
                          {saveStatus === 'saved' && (
                            <span className="text-green-600 bg-green-50 px-1 rounded">저장됨</span>
                          )}
                          {saveStatus === 'unsaved' && (
                            <span className="text-orange-600 bg-orange-50 px-1 rounded animate-pulse">미저장</span>
                          )}
                          {saveStatus === 'no-data' && (
                            <span className="text-gray-500 bg-gray-50 px-1 rounded">빈 데이터</span>
                          )}
                        </div>
                      </Button>
                      {canEdit && matchNumbers.length > 1 && (
                        <button
                          onClick={async () => await deleteMatch(matchNumber)}
                          className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full text-white text-[10px] sm:text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 팀 선택 - 모든 화면 크기에서 표시 */}

          {/* PC: 경기장과 선수 명단을 좌우로 배치, 모바일: 세로로 배치 */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0">
            {/* 경기장 - PC에서는 4/5 차지 */}
            <div className="lg:col-span-4">
              <Card 
                className="shadow-lg h-[300px] lg:h-[500px] flex flex-col justify-center"
                // 모바일/PC 반응형 높이 조정 시작: 경기장 Card 높이
              >
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
                          <Button
                            onClick={handleNextPage}
                            size="sm"
                            disabled={hasUnsavedChanges()}
                            className={`text-xs sm:text-sm ${
                              hasUnsavedChanges() 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            다음 페이지
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-6">
                  <div
                    ref={fieldRef}
                    className="relative w-full h-[240px] lg:h-[400px] bg-green-500 rounded-lg border-4 border-white shadow-inner overflow-hidden"
                    // 모바일/PC 반응형 높이 조정 시작: 축구장 필드 div 높이
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
                      // 골키퍼 여부 확인 (페널티 박스 내부)
                      const isGoalkeeper = isInPenaltyBox(position.x, position.y, position.team);
                      // 현재 사용자 여부 확인
                      const isMyPlayer = isCurrentUser(position.playerName);
                      
                      // 색상 결정: 골키퍼 > 현재 사용자 > 팀 색상
                      let circleColor;
                      if (isGoalkeeper) {
                        circleColor = 'bg-yellow-500 hover:bg-yellow-600';
                      } else if (isMyPlayer) {
                        circleColor = position.team === 'A' ? 'bg-blue-800 hover:bg-blue-900 ring-2 ring-yellow-400' : 'bg-red-800 hover:bg-red-900 ring-2 ring-yellow-400';
                      } else {
                        circleColor = position.team === 'A' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';
                      }
                      
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
                            if (canEdit) {
                              // 이미 픽업된 선수가 있고 그 선수가 현재 클릭한 선수와 다르면 기존 픽업 해제
                              if (pickedPlayer && pickedPlayer.id !== position.playerId) {
                                setPickedPlayer(null);
                              }
                              // 현재 선수를 픽업 (이동 가능하도록)
                              pickupPlayer({ 
                                id: position.playerId, 
                                name: position.playerName, 
                                isOnField: true, 
                                team: position.team 
                              });
                            }
                          }}
                        >
                          <div className={`${circleColor} text-white rounded-full w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center shadow-lg border-2 border-white transition-colors relative ${
                            pickedPlayer?.id === position.playerId ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
                          }`}>
                            <span className="text-[8px] sm:text-[10px] font-bold">
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
                          <div className="absolute top-3 sm:top-5 md:top-6 left-1/2 transform -translate-x-1/2 text-center">
                            <div className={`text-gray-800 text-[7px] sm:text-xs px-0.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium shadow-sm border min-w-max max-w-10 sm:max-w-20 md:max-w-24 truncate ${
                              isMyPlayer ? 'bg-yellow-200 border-yellow-400 font-bold' : 'bg-white/90'
                            }`}>
                              {/* 모바일에서는 성만 표시, 데스크톱에서는 전체 이름 */}
                              <span className="sm:hidden">{position.playerName.split('_')[0]}</span>
                              <span className="hidden sm:inline">{position.playerName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 픽업된 선수가 있을 때 안내 메시지 */}
                    {pickedPlayer && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                        <div className="text-blue-800 text-xs sm:text-sm font-semibold bg-white/95 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg border border-blue-200">
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
              <Card 
                className="shadow-lg h-[160px] lg:h-[500px] flex flex-col"
                // 모바일/PC 반응형 높이 조정 시작: 선수명단 Card 높이
              >
                <CardHeader className="pb-1 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      선수 명단
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowAddPlayerModal(true)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          선수 추가
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 p-1 sm:p-3">
                  {/* PC용 세로 단일 열 */}
                  <div className="hidden lg:flex flex-col flex-1 h-full">
                                      <div className="text-sm text-gray-500 mb-3">
                    출석한 선수: {availablePlayers.length}명 / 총 {attendingPlayers.length}명
                  </div>
                    <div className="space-y-2 overflow-y-auto h-full pr-2">
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
                          <div className="bg-gray-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shadow-lg border-2 border-white hover:bg-gray-700 transition-colors mr-1 flex-shrink-0">
                            <span className="text-[12px] font-bold">
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
                      {availablePlayers.length === 0 && attendingPlayers.length > 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                          <Users className="w-8 h-8 mb-2 text-gray-300" />
                          <p className="text-sm">모든 출석 선수가 배치되었습니다</p>
                        </div>
                      )}
                      {attendingPlayers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                          <Users className="w-8 h-8 mb-2 text-gray-300" />
                          <p className="text-sm">출석한 선수가 없습니다</p>
                          <p className="text-xs text-gray-400 mt-1">출석체크를 먼저 진행해주세요</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 모바일용 가로 스크롤은 기존대로 유지 */}
                  <div className="lg:hidden">
                    {/* 모바일용 가로 스크롤 */}
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                      <span>← 스크롤하여 더 많은 선수를 확인하세요 →</span>
                      <span>출석: {availablePlayers.length}명 / 총 {attendingPlayers.length}명</span>
                    </div>
                    
                    <div 
                      ref={playerListContainerRef}
                      className="relative border border-gray-200 rounded-lg p-2 bg-gray-50 flex-1"
                      // 모바일/PC 반응형 높이 조정 시작: 선수명단 리스트 스크롤 영역 높이
                      style={{
                        height: '80px',
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
                            <div className="bg-gray-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shadow-lg border-2 border-white hover:bg-gray-700 transition-colors mb-0">
                              <span className="text-[12px] font-bold">
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
                        
                        {availablePlayers.length === 0 && attendingPlayers.length > 0 && (
                          <div className="flex items-center justify-center w-full py-4 text-center text-gray-500">
                            <Users className="w-6 h-6 mr-2 text-gray-300" />
                            <p className="text-xs">모든 출석 선수가 배치되었습니다</p>
                          </div>
                        )}
                        {attendingPlayers.length === 0 && (
                          <div className="flex items-center justify-center w-full py-4 text-center text-gray-500">
                            <Users className="w-6 h-6 mr-2 text-gray-300" />
                            <p className="text-xs">출석한 선수가 없습니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 전략 섹션 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* A팀 전략 */}
            <Card className="shadow-lg border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg p-2 sm:p-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-blue-900">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  {getTeamName('A')} 전술 지시
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                {canEdit ? (
                  <textarea
                    value={currentFormation.teamA_strategy || ''}
                    onChange={(e) => updateStrategy('A', e.target.value)}
                    placeholder={`${getTeamName('A')}의 전술과 전략을 입력하세요...`}
                    className="w-full h-20 sm:h-24 p-2 sm:p-3 border border-blue-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  />
                ) : (
                  <div className="w-full h-20 sm:h-24 p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700">
                    {currentFormation.teamA_strategy || '전략이 입력되지 않았습니다.'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* B팀 전략 */}
            <Card className="shadow-lg border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg p-2 sm:p-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-red-900">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  {getTeamName('B')} 전술 지시
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                {canEdit ? (
                  <textarea
                    value={currentFormation.teamB_strategy || ''}
                    onChange={(e) => updateStrategy('B', e.target.value)}
                    placeholder={`${getTeamName('B')}의 전술과 전략을 입력하세요...`}
                    className="w-full h-20 sm:h-24 p-2 sm:p-3 border border-red-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
                  />
                ) : (
                  <div className="w-full h-20 sm:h-24 p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700">
                    {currentFormation.teamB_strategy || '전략이 입력되지 않았습니다.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 득점기록 섹션 */}
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-green-900">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  득점기록
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* 스코어 표시 */}
                  {goalRecords.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-green-200">
                      <span className="text-sm font-bold text-blue-600">{getTeamName('A')} {calculateScore().teamA}</span>
                      <span className="text-sm font-bold text-gray-600">-</span>
                      <span className="text-sm font-bold text-red-600">{getTeamName('B')} {calculateScore().teamB}</span>
                    </div>
                  )}
                  {canEdit && (
                    <Button
                      onClick={() => setShowGoalModal(true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                    >
                      득점 추가
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {goalGroups.length > 0 ? (
                <div className="max-h-[200px] sm:max-h-[300px] overflow-y-auto space-y-1 pr-1">
                  {goalGroups.map((g, index) => (
                    <div key={g.id} className={`flex w-full ${g.team === 'A' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md shadow-sm border border-green-200 bg-white max-w-[90%] ${g.team === 'A' ? 'ml-0 mr-auto' : 'ml-auto mr-0'}`}>
                        {/* 시간 순서 표시 */}
                        <span className="text-[8px] text-gray-500 font-bold bg-gray-100 px-1 py-0.5 rounded border">
                          {index + 1}순
                        </span>
                        <span className={`font-bold text-xs ${g.team === 'A' ? 'text-blue-700' : 'text-red-700'}`}>{g.scorerName}</span>
                        {g.assistantName && <span className="text-gray-500 text-[10px]">→ {g.assistantName}</span>}
                        <span className="text-gray-400 text-[10px] font-medium">({g.timestamp})</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded ${g.team === 'A' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{getTeamName(g.team)}</span>
                        {/* 수정/삭제 버튼 */}
                        {canEdit && (
                          <>
                            <button 
                              className="text-[10px] px-1 py-0.5 ml-1 border border-gray-300 rounded hover:bg-gray-50" 
                              onClick={() => setEditGoalGroup(g)}
                            >
                              수정
                            </button>
                            <button 
                              className="text-[10px] px-1 py-0.5 border border-red-300 rounded text-red-600 hover:bg-red-50" 
                              onClick={() => handleDeleteGoalGroup(g)}
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">아직 득점기록이 없습니다</p>
                  {canEdit && (
                    <p className="text-xs mt-1">"득점 추가" 버튼을 눌러 득점을 기록하세요</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 도움말 */}
          <Card className="shadow-lg bg-blue-50 border-blue-200">
            <CardContent className="p-2 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">사용법</h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
                <li>• 상단에서 경기를 선택하거나 새로운 경기를 추가하세요</li>
                <li>• 선수 명단의 선수를 클릭하여 선택한 후, 경기장의 원하는 위치를 클릭하여 배치하세요</li>
                <li>• 경기장의 선수를 클릭하여 선택한 후, 다른 위치를 클릭하여 이동할 수 있습니다</li>
                <li>• <span className="font-semibold text-green-700">경기장 위치에 따라 자동으로 팀이 결정됩니다 (좌측: A팀, 우측: B팀)</span></li>
                <li>• 경기장의 선수를 더블클릭하거나 X 버튼을 클릭하면 벤치로 돌아갑니다</li>
                <li>• <span className="font-semibold text-yellow-700">페널티 박스에 배치된 선수는 노란색으로 표시됩니다 (골키퍼)</span></li>
                <li>• <span className="font-semibold text-purple-700">본인의 이름이 포함된 선수는 진한 색상과 노란 테두리로 강조됩니다</span></li>
                <li>• 감독/코치는 각 팀의 전술 지시란에 전술을 입력할 수 있습니다</li>
                <li>• <span className="font-semibold text-orange-700">"저장" 버튼을 눌러야 작전판이 데이터베이스에 저장됩니다</span></li>
                <li>• <span className="font-semibold text-green-700">경기 버튼의 점 표시: 초록색(저장됨), 주황색(저장되지 않음), 회색(데이터 없음)</span></li>
                <li>• 각 경기별로 독립적인 포메이션을 관리할 수 있습니다</li>
                <li>• 저장되지 않은 변경사항이 있을 때 다른 경기로 이동하면 저장 확인 메시지가 나타납니다</li>
                {!canEdit && <li>• 현재 읽기 전용 모드입니다. 수정하려면 감독/코치 권한이 필요합니다</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 득점 추가 모달 */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">득점 추가</h3>
            
            <div className="space-y-4">
              {/* 득점 팀 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  득점 팀 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGoal(prev => ({ ...prev, team: 'A' }))}
                    className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                      newGoal.team === 'A'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {getTeamName('A')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGoal(prev => ({ ...prev, team: 'B' }))}
                    className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                      newGoal.team === 'B'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                    }`}
                  >
                    {getTeamName('B')}
                  </button>
                </div>
              </div>

              {/* 득점자 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  득점자 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newGoal.scorer}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, scorer: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">득점자를 선택하세요</option>
                  {attendingPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 어시스트 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  어시스트
                </label>
                <select
                  value={newGoal.assistant}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, assistant: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">어시스트를 선택하세요 (선택사항)</option>
                  {attendingPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>



            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={addGoalRecord}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                추가
              </Button>
              <Button
                onClick={() => {
                  setShowGoalModal(false);
                  setNewGoal({ scorer: '', assistant: '', team: 'A' });
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 선수 추가 모달 */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">선수 추가</h3>
            
            <div className="space-y-4">
              {/* 선수 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가할 선수 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPlayerToAdd}
                  onChange={(e) => setSelectedPlayerToAdd(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선수를 선택하세요</option>
                  {allPlayers
                    .filter(player => !attendingPlayers.some(attending => attending.id === player.id))
                    .map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.position})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  이미 출석한 선수는 표시되지 않습니다
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={addPlayerToAttendance}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                추가
              </Button>
              <Button
                onClick={() => {
                  setShowAddPlayerModal(false);
                  setSelectedPlayerToAdd('');
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 상대팀 추가 모달 */}
      {showAddOpponentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">상대팀 추가</h3>
            
            <div className="space-y-4">
              {/* 상대팀 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상대팀 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={opponentTeamName}
                  onChange={(e) => setOpponentTeamName(e.target.value)}
                  placeholder="예: 지크, FC서울, 맨유 등"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  상대팀 이름을 입력하면 득점 기록이 가능합니다
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={addOpponentTeam}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                추가
              </Button>
              <Button
                onClick={() => {
                  setShowAddOpponentModal(false);
                  setOpponentTeamName('');
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 경기 추가 모달 */}
      {showAddMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 경기 추가</h3>
            
            <div className="space-y-4">
              {/* 경기 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경기 유형 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSelfMatchState(true)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      isSelfMatchState
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-sm font-medium">자체 경기</div>
                    <div className="text-xs opacity-80">무쏘 vs 무쏘</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSelfMatchState(false)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      !isSelfMatchState
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-sm font-medium">대외 경기</div>
                    <div className="text-xs opacity-80">무쏘 vs 상대팀</div>
                  </button>
                </div>
              </div>

              {/* 상대팀 이름 입력 (대외 경기인 경우만) */}
              {!isSelfMatchState && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상대팀 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMatchOpponentName}
                    onChange={(e) => setNewMatchOpponentName(e.target.value)}
                    placeholder="예: 지크, FC서울, 맨유 등"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    상대팀 이름을 입력하면 득점 기록이 가능합니다
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleAddMatch}
                disabled={!isSelfMatchState && !newMatchOpponentName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                경기 추가
              </Button>
              <Button
                onClick={() => {
                  setShowAddMatchModal(false);
                  setIsSelfMatchState(true);
                  setNewMatchOpponentName('');
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Tactics; 