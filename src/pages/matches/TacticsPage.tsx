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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
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

// fallback에서 매 렌더마다 새 배열 참조가 생겨 useEffect 무한 루프가 발생하지 않도록 고정 참조
const EMPTY_POSITIONS: PlayerPosition[] = [];

/** 포메이션 슬롯: 팀 A 기준 (x, y) %, role은 GK/DF/MF/FW. 팀 B는 x를 100-x로 미러 */
type FormationSlot = { x: number; y: number; role: 'GK' | 'DF' | 'MF' | 'FW' };

// 4-3-3 포메이션 슬롯 (팀 A 좌측, x 작을수록 골대 쪽)
const FORMATION_4_3_3_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 18, role: 'DF' }, { x: 18, y: 42, role: 'DF' }, { x: 18, y: 58, role: 'DF' }, { x: 18, y: 82, role: 'DF' },
  { x: 32, y: 25, role: 'MF' }, { x: 32, y: 50, role: 'MF' }, { x: 32, y: 75, role: 'MF' },
  { x: 44, y: 25, role: 'FW' }, { x: 44, y: 50, role: 'FW' }, { x: 44, y: 75, role: 'FW' },
];

// 4-4-2 포메이션 슬롯 (팀 A, 포백)
const FORMATION_4_4_2_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 15, role: 'DF' }, { x: 18, y: 38, role: 'DF' }, { x: 18, y: 62, role: 'DF' }, { x: 18, y: 85, role: 'DF' },
  { x: 32, y: 20, role: 'MF' }, { x: 32, y: 45, role: 'MF' }, { x: 32, y: 55, role: 'MF' }, { x: 32, y: 80, role: 'MF' },
  { x: 44, y: 40, role: 'FW' }, { x: 44, y: 60, role: 'FW' },
];

// 3-5-2 포메이션 슬롯 (팀 A, 쓰리백)
const FORMATION_3_5_2_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 25, role: 'DF' }, { x: 18, y: 50, role: 'DF' }, { x: 18, y: 75, role: 'DF' },
  { x: 32, y: 15, role: 'MF' }, { x: 32, y: 35, role: 'MF' }, { x: 32, y: 50, role: 'MF' }, { x: 32, y: 65, role: 'MF' }, { x: 32, y: 85, role: 'MF' },
  { x: 44, y: 40, role: 'FW' }, { x: 44, y: 60, role: 'FW' },
];

// 3-4-3 포메이션 슬롯 (팀 A, 쓰리백)
const FORMATION_3_4_3_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 25, role: 'DF' }, { x: 18, y: 50, role: 'DF' }, { x: 18, y: 75, role: 'DF' },
  { x: 32, y: 22, role: 'MF' }, { x: 32, y: 45, role: 'MF' }, { x: 32, y: 55, role: 'MF' }, { x: 32, y: 78, role: 'MF' },
  { x: 44, y: 25, role: 'FW' }, { x: 44, y: 50, role: 'FW' }, { x: 44, y: 75, role: 'FW' },
];

// 5-3-2 포메이션 슬롯 (팀 A, 파이브백)
const FORMATION_5_3_2_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 12, role: 'DF' }, { x: 18, y: 30, role: 'DF' }, { x: 18, y: 50, role: 'DF' }, { x: 18, y: 70, role: 'DF' }, { x: 18, y: 88, role: 'DF' },
  { x: 32, y: 35, role: 'MF' }, { x: 32, y: 50, role: 'MF' }, { x: 32, y: 65, role: 'MF' },
  { x: 44, y: 40, role: 'FW' }, { x: 44, y: 60, role: 'FW' },
];

// 5-4-1 포메이션 슬롯 (팀 A, 파이브백)
const FORMATION_5_4_1_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 12, role: 'DF' }, { x: 18, y: 30, role: 'DF' }, { x: 18, y: 50, role: 'DF' }, { x: 18, y: 70, role: 'DF' }, { x: 18, y: 88, role: 'DF' },
  { x: 32, y: 22, role: 'MF' }, { x: 32, y: 42, role: 'MF' }, { x: 32, y: 58, role: 'MF' }, { x: 32, y: 78, role: 'MF' },
  { x: 44, y: 50, role: 'FW' },
];

// 4-2-3-1 포메이션 슬롯 (팀 A, 포백)
const FORMATION_4_2_3_1_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 18, role: 'DF' }, { x: 18, y: 40, role: 'DF' }, { x: 18, y: 60, role: 'DF' }, { x: 18, y: 82, role: 'DF' },
  { x: 28, y: 40, role: 'MF' }, { x: 28, y: 60, role: 'MF' },
  { x: 36, y: 22, role: 'MF' }, { x: 36, y: 50, role: 'MF' }, { x: 36, y: 78, role: 'MF' },
  { x: 44, y: 50, role: 'FW' },
];

// 4-5-1 포메이션 슬롯 (팀 A, 포백)
const FORMATION_4_5_1_SLOTS_A: FormationSlot[] = [
  { x: 10, y: 50, role: 'GK' },
  { x: 18, y: 15, role: 'DF' }, { x: 18, y: 38, role: 'DF' }, { x: 18, y: 62, role: 'DF' }, { x: 18, y: 85, role: 'DF' },
  { x: 32, y: 15, role: 'MF' }, { x: 32, y: 35, role: 'MF' }, { x: 32, y: 50, role: 'MF' }, { x: 32, y: 65, role: 'MF' }, { x: 32, y: 85, role: 'MF' },
  { x: 44, y: 50, role: 'FW' },
];

const FORMATION_TEMPLATES: Record<string, FormationSlot[]> = {
  '4-3-3': FORMATION_4_3_3_SLOTS_A,
  '4-4-2': FORMATION_4_4_2_SLOTS_A,
  '3-5-2': FORMATION_3_5_2_SLOTS_A,
  '3-4-3': FORMATION_3_4_3_SLOTS_A,
  '5-3-2': FORMATION_5_3_2_SLOTS_A,
  '5-4-1': FORMATION_5_4_1_SLOTS_A,
  '4-2-3-1': FORMATION_4_2_3_1_SLOTS_A,
  '4-5-1': FORMATION_4_5_1_SLOTS_A,
};

/** 포지션별 선수 이름 색상 (GK/DF/MF/FW 구분) */
const ROLE_NAME_COLORS: Record<'GK' | 'DF' | 'MF' | 'FW', string> = {
  GK: 'text-amber-700',
  DF: 'text-blue-700',
  MF: 'text-emerald-700',
  FW: 'text-rose-700',
};

/** 포메이션/포지션 배치 디버깅용 (true 시 콘솔 로그 출력) */
const DEBUG_FORMATION = true;

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
  const [showCleansheetModal, setShowCleansheetModal] = useState(false);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState('');
  const [opponentTeamName, setOpponentTeamName] = useState('');
  const [isSelfMatchState, setIsSelfMatchState] = useState(true);
  const [newMatchOpponentName, setNewMatchOpponentName] = useState('');
  // 1경기 유형 설정 모달 (작전판 첫 진입 시 자체/대외 선택)
  const [showMatch1ConfigModal, setShowMatch1ConfigModal] = useState(false);
  const formationPanelRef = useRef<HTMLDivElement>(null);
  const playerListContainerRef = useRef<HTMLDivElement>(null);
  const playerListInnerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  /** DB에서 포메이션 로드한 경기 키 (저장 후 tactics 변경 시 formations 덮어쓰기 방지) */
  const lastLoadedMatchKeyRef = useRef<string>('');

  // 2. 득점 묶음 상태 추가
  const [goalGroups, setGoalGroups] = useState<GoalGroup[]>([]);
  const [editGoalGroup, setEditGoalGroup] = useState<GoalGroup | null>(null);
  // 팀별 포메이션 타입 (선수를 놓을 때 해당 포지션 슬롯으로 스냅)
  const [formationTypeA, setFormationTypeA] = useState<string>('4-3-3');
  const [formationTypeB, setFormationTypeB] = useState<string>('4-4-2');
  // 수정 권한 확인
  const canEdit = canManage() || canManageMatches() || canManageSystem();

  // 현재 선택된 경기의 포메이션 (fallback은 EMPTY_POSITIONS 사용으로 참조 안정화 → useEffect 무한 루프 방지)
  const currentFormation = formations[matchNumberNum] || {
    name: `경기 #${matchId} - ${matchNumber}경기 작전판`,
    positions: EMPTY_POSITIONS,
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
  const fetchAttendingPlayers = useCallback(async (): Promise<Array<{id: string; name: string; position: string; isOpponentTeam?: boolean; cleansheet?: number}>> => {
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
          opponent_team_name,
          cleansheet
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
            isOpponentTeam: true,
            cleansheet: 0
          };
        } else {
          // 일반 선수인 경우
          const playerInfo = playersInfo.find(p => p.id === item.player_id);
          return {
            id: item.player_id,
            name: playerInfo?.name || 'Unknown',
            position: playerInfo?.position || 'Unknown',
            isOpponentTeam: false,
            cleansheet: item.cleansheet || 0
          };
        }
      }) || [];
    } catch (error) {
      return [];
    }
  }, [matchIdNum, matchNumberNum]);

  // 축구 경기용 선수 목록 (풋살 전용 회원 제외)
  const fetchAllPlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position')
        .eq('is_deleted', false)
        .neq('role', 'futsal-guest')
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

  // 1경기 진입 시 유형(자체/대외) 설정 팝업 표시 (한 번만; DB에 상대팀 행이 있으면 이미 설정된 것으로 간주)
  useEffect(() => {
    if (!matchIdNum || matchNumberNum !== 1 || matchNumbers.length === 0 || !matchNumbers.includes(1)) return;
    const storageKey = `tactics_match1_config_${matchIdNum}`;
    if (localStorage.getItem(storageKey)) return;

    const checkAndShow = async () => {
      const { data: opponentRow } = await supabase
        .from('match_attendance')
        .select('id')
        .eq('match_id', matchIdNum)
        .eq('match_number', 1)
        .eq('is_opponent_team', true)
        .maybeSingle();
      if (opponentRow) {
        localStorage.setItem(storageKey, 'opponent');
        return;
      }
      setShowMatch1ConfigModal(true);
      setIsSelfMatchState(true);
      setNewMatchOpponentName('');
    };
    checkAndShow();
  }, [matchIdNum, matchNumberNum, matchNumbers]);

  // DB에서 로드된 데이터를 formations에 반영 (경기/경기번호가 바뀔 때만 로드, 저장 후 tactics 변경 시 덮어쓰지 않음)
  useEffect(() => {
    if (!matchIdNum || !matchNumberNum) return;
    const matchKey = `${matchIdNum}-${matchNumberNum}`;
    // 같은 경기에서 tactics만 바뀐 경우(저장 후 fetchTactics 등)에는 로드하지 않아 수정 사항이 유지되도록 함
    if (lastLoadedMatchKeyRef.current === matchKey) {
      return;
    }
    lastLoadedMatchKeyRef.current = matchKey;

    const loadAttendanceData = async () => {
      const attendancePositions = await fetchAttendanceData();
      setFormations(prev => {
        const name = tactics?.name || `경기 #${matchId} - ${matchNumber}경기 작전판`;
        const teamA = tactics?.team_a_strategy ?? prev[matchNumberNum]?.teamA_strategy ?? '';
        const teamB = tactics?.team_b_strategy ?? prev[matchNumberNum]?.teamB_strategy ?? '';
        if (attendancePositions.length > 0) {
          return {
            ...prev,
            [matchNumberNum]: {
              name,
              positions: attendancePositions,
              created_by: userId || '',
              teamA_strategy: teamA,
              teamB_strategy: teamB
            }
          };
        }
        return {
          ...prev,
          [matchNumberNum]: {
            name,
            positions: [],
            created_by: userId || '',
            teamA_strategy: teamA,
            teamB_strategy: teamB
          }
        };
      });
    };

    loadAttendanceData();
    // tactics 제외: 저장 후 fetchTactics()로 tactics만 바뀌어도 effect가 돌면 formations가 DB로 덮어써져 수정 사항이 사라짐
  }, [matchIdNum, matchNumberNum, fetchAttendanceData]);

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
      // 포메이션 패널이나 선수 명단 클릭이 아닌 경우 선택 해제
      const target = e.target as HTMLElement;
      const isFieldClick = formationPanelRef.current?.contains(target);
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

  /** 팀별 포메이션 슬롯 (B팀은 x 미러) */
  const getSlotsForTeam = (team: 'A' | 'B'): FormationSlot[] => {
    const formationType = team === 'A' ? formationTypeA : formationTypeB;
    const template = FORMATION_TEMPLATES[formationType] || FORMATION_4_3_3_SLOTS_A;
    const slots = team === 'A' ? template : template.map(({ x, y, role }) => ({ x: 100 - x, y, role }));
    return slots;
  };

  /** 슬롯 인덱스에 배치된 선수 (각 선수를 가장 가까운 슬롯에 매칭했을 때 이 슬롯에 매칭된 선수). 없으면 null */
  const getPlayerAtSlot = (team: 'A' | 'B', slotIndex: number): PlayerPosition | null => {
    const slots = getSlotsForTeam(team);
    const teamPositions = currentFormation?.positions?.filter(p => p.team === team) || [];
    const slotToPos = new Map<number, PlayerPosition>();
    for (const pos of teamPositions) {
      let bestIdx = 0;
      let bestD = Math.sqrt(Math.pow(pos.x - slots[0].x, 2) + Math.pow(pos.y - slots[0].y, 2));
      for (let i = 1; i < slots.length; i++) {
        const d = Math.sqrt(Math.pow(pos.x - slots[i].x, 2) + Math.pow(pos.y - slots[i].y, 2));
        if (d < bestD) {
          bestD = d;
          bestIdx = i;
        }
      }
      const existing = slotToPos.get(bestIdx);
      const slot = slots[bestIdx];
      const dist = Math.sqrt(Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2));
      if (!existing || Math.sqrt(Math.pow(existing.x - slot.x, 2) + Math.pow(existing.y - slot.y, 2)) > dist) {
        slotToPos.set(bestIdx, pos);
      }
    }
    return slotToPos.get(slotIndex) ?? null;
  };

  /** 픽업된 선수를 지정 슬롯에 배치 (슬롯에 이미 있던 선수는 제거 후 배치) */
  const placePlayerInSlot = (team: 'A' | 'B', slotIndex: number): boolean => {
    if (!pickedPlayer || !canEdit) return false;
    const isOpponent = pickedPlayer.id?.startsWith('opponent_');
    if (isOpponent) {
      toast.error('상대팀은 배치할 수 없습니다');
      return false;
    }
    if (team === 'B' && attendingPlayers.some(p => p.isOpponentTeam)) {
      toast.error('상대팀 진영에는 선수를 배치할 수 없습니다');
      return false;
    }
    const slots = getSlotsForTeam(team);
    const slot = slots[slotIndex];
    if (!slot) return false;
    const maxSlots = slots.length;
    const currentTeamCount = currentFormation.positions.filter(p => p.team === team).length;
    if (!pickedPlayer.isOnField && currentTeamCount >= maxSlots) {
      toast.error(`${getTeamName(team)} 포메이션 인원이 가득 찼습니다 (${maxSlots}명)`);
      return false;
    }
    const existingAtSlot = getPlayerAtSlot(team, slotIndex);
    const newPos: PlayerPosition = {
      playerId: pickedPlayer.id,
      playerName: pickedPlayer.name,
      x: slot.x,
      y: slot.y,
      team
    };
    setFormations(prev => {
      const current = prev[matchNumberNum].positions;
      const withoutOld = existingAtSlot ? current.filter(p => p.playerId !== existingAtSlot.playerId) : current;
      const withoutPicked = withoutOld.filter(p => p.playerId !== pickedPlayer.id);
      const next = [...withoutPicked, newPos];
      return { ...prev, [matchNumberNum]: { ...prev[matchNumberNum], positions: next } };
    });
    setPickedPlayer(null);
    return true;
  };

  /** 이미 선수가 배치된 슬롯 제외. 한 선수당 "가장 가까운 슬롯 하나"만 점유로 간주해, 한 명이 두 슬롯을 점유하는 문제 방지 */
  const getEmptySlots = (team: 'A' | 'B', excludePlayerId?: string): FormationSlot[] => {
    const slots = getSlotsForTeam(team);
    const teamPositions = currentFormation?.positions?.filter(p => p.team === team) || [];
    const occupiedSlotIndices = new Set<number>();
    teamPositions.forEach(pos => {
      if (excludePlayerId && pos.playerId === excludePlayerId) return;
      let nearestIdx = 0;
      let minDist = Math.sqrt(Math.pow(slots[0].x - pos.x, 2) + Math.pow(slots[0].y - pos.y, 2));
      for (let i = 1; i < slots.length; i++) {
        const d = Math.sqrt(Math.pow(slots[i].x - pos.x, 2) + Math.pow(slots[i].y - pos.y, 2));
        if (d < minDist) {
          minDist = d;
          nearestIdx = i;
        }
      }
      occupiedSlotIndices.add(nearestIdx);
    });
    const empty = slots.filter((_, i) => !occupiedSlotIndices.has(i));
    return empty;
  };

  /** 클릭/드롭 위치(targetX)가 어느 포지션 영역인지 반환 (경기장 4등분 기준) */
  const getRoleFromPosition = (targetX: number, team: 'A' | 'B'): 'GK' | 'DF' | 'MF' | 'FW' => {
    if (team === 'A') {
      if (targetX < 12.5) return 'GK';
      if (targetX < 25) return 'DF';
      if (targetX < 37.5) return 'MF';
      return 'FW';
    }
    // B팀: 우측 절반 50~100% → FW(50~62.5), MF(62.5~75), DF(75~87.5), GK(87.5~100)
    if (targetX >= 87.5) return 'GK';
    if (targetX >= 75) return 'DF';
    if (targetX >= 62.5) return 'MF';
    return 'FW';
  };

  /** 드롭/클릭 위치에서 가장 가까운 빈 포지션 슬롯으로 스냅. 클릭한 영역(역할)과 같은 역할 슬롯으로만 스냅(다른 역할 슬롯으로 넘어가면 포메이션이 깨짐). */
  const findNearestSlot = (targetX: number, targetY: number, team: 'A' | 'B', excludePlayerId?: string): { x: number; y: number } | null => {
    const emptySlots = getEmptySlots(team, excludePlayerId);
    if (emptySlots.length === 0) {
      return null;
    }
    const preferredRole = getRoleFromPosition(targetX, team);
    const sameRoleSlots = emptySlots.filter(s => s.role === preferredRole);
    // 같은 역할의 빈 슬롯만 사용. 다른 역할로 스냅하면 4-4-2가 4-3-3처럼 보이는 문제 방지
    if (sameRoleSlots.length === 0) {
      return null;
    }
    let nearest = sameRoleSlots[0];
    let minDist = Math.sqrt(Math.pow(nearest.x - targetX, 2) + Math.pow(nearest.y - targetY, 2));
    for (let i = 1; i < sameRoleSlots.length; i++) {
      const d = Math.sqrt(Math.pow(sameRoleSlots[i].x - targetX, 2) + Math.pow(sameRoleSlots[i].y - targetY, 2));
      if (d < minDist) {
        minDist = d;
        nearest = sameRoleSlots[i];
      }
    }
    return { x: nearest.x, y: nearest.y };
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

  /** 클릭/드롭 공통: 선택된 선수를 (targetX, targetY) 위치에 배치. 성공 시 true, 실패 시 false */
  const placePickedPlayerAt = useCallback((targetX: number, targetY: number): boolean => {
    if (!pickedPlayer || !canEdit) return false;
    if (targetX < 5 || targetX > 95 || targetY < 5 || targetY > 95) return false;

    const isOpponentTeam = pickedPlayer.id && pickedPlayer.id.startsWith('opponent_');
    if (isOpponentTeam) {
      toast.error('상대팀은 경기장에 배치할 수 없습니다');
      return false;
    }

    const targetTeam: 'A' | 'B' = targetX <= 50 ? 'A' : 'B';
    if (targetTeam === 'B') {
      const hasOpponentTeam = attendingPlayers.some(player => player.isOpponentTeam);
      if (hasOpponentTeam) {
        toast.error('상대팀 진영에는 선수를 배치할 수 없습니다');
        return false;
      }
    }

    // 포메이션 인원 제한: 벤치에서 올릴 때 해당 팀 슬롯 수를 초과하면 배치 불가
    const maxSlots = getSlotsForTeam(targetTeam).length;
    const currentTeamCount = currentFormation.positions.filter(p => p.team === targetTeam).length;
    if (!pickedPlayer.isOnField && currentTeamCount >= maxSlots) {
      const formationLabel = targetTeam === 'A' ? formationTypeA : formationTypeB;
      toast.error(`${getTeamName(targetTeam)} 포메이션 인원이 가득 찼습니다 (${formationLabel}: ${maxSlots}명)`);
      return false;
    }

    // 포메이션 슬롯으로 스냅 (FW 쪽에 놓으면 FW 슬롯 등). 없으면 기존처럼 가장 가까운 빈 공간
    const snapped = findNearestSlot(targetX, targetY, targetTeam, pickedPlayer.isOnField ? pickedPlayer.id : undefined);
    const validPosition = snapped ?? findNearestValidPosition(targetX, targetY, pickedPlayer.isOnField ? pickedPlayer.id : undefined);

    if (pickedPlayer.isOnField) {
      const currentPlayer = currentFormation.positions.find(p => p.playerId === pickedPlayer.id);
      if (currentPlayer && currentPlayer.team !== targetTeam) {
        toast.success(`${pickedPlayer.name}이(가) ${getTeamName(targetTeam)}으로 이동했습니다`);
      }
      updatePlayerPosition(pickedPlayer.id, validPosition.x, validPosition.y, targetTeam);
    } else {
      if (selectedTeam !== targetTeam) {
        toast.info(`위치에 따라 ${getTeamName(targetTeam)}으로 배치됩니다`);
      }
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
    setPickedPlayer(null);
    return true;
  }, [pickedPlayer, canEdit, attendingPlayers, currentFormation.positions, selectedTeam, matchNumberNum, formationTypeA, formationTypeB]);

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
    setFormations(prev => {
      const current = prev[matchNumberNum].positions;
      const next = current.filter(pos => pos.playerId !== playerId);
      return {
        ...prev,
        [matchNumberNum]: {
          ...prev[matchNumberNum],
          positions: next
        }
      };
    });
  };

  /** 한 팀의 선수들을 현재 포메이션 슬롯에 맞춰 재배치. 역할(구역)이 맞는 선수를 우선 해당 역할 슬롯에 배치해 4-4-2 등 포메이션 라인이 맞게 함. */
  const computeTeamPositionsByFormation = (team: 'A' | 'B', positions: PlayerPosition[]): PlayerPosition[] => {
    const slots = getSlotsForTeam(team);
    const teamPositions = positions.filter(p => p.team === team);
    if (teamPositions.length === 0) return [];
    const roleOrder: Record<'GK' | 'DF' | 'MF' | 'FW', number> = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const sortedSlots = [...slots].sort((a, b) => {
      if (roleOrder[a.role] !== roleOrder[b.role]) return roleOrder[a.role] - roleOrder[b.role];
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    const assigned = new Set<string>();
    const newTeamPositions: PlayerPosition[] = [];
    for (const slot of sortedSlots) {
      const posRole = (x: number) => getRoleFromPosition(x, team);
      const sameRolePositions = teamPositions.filter(p => !assigned.has(p.playerId) && posRole(p.x) === slot.role);
      const candidates = sameRolePositions.length > 0 ? sameRolePositions : teamPositions.filter(p => !assigned.has(p.playerId));
      let nearestPos: PlayerPosition | null = null;
      let nearestDist = Infinity;
      for (const pos of candidates) {
        if (assigned.has(pos.playerId)) continue;
        const d = Math.pow(pos.x - slot.x, 2) + Math.pow(pos.y - slot.y, 2);
        if (d < nearestDist) {
          nearestDist = d;
          nearestPos = pos;
        }
      }
      if (nearestPos) {
        assigned.add(nearestPos.playerId);
        newTeamPositions.push({
          ...nearestPos,
          x: slot.x,
          y: slot.y,
          team
        });
      }
    }
    for (const pos of teamPositions) {
      if (!assigned.has(pos.playerId)) newTeamPositions.push(pos);
    }
    return newTeamPositions;
  };

  /** A·B 팀 모두 현재 설정된 포메이션에 맞춰 선수 재배치 */
  const applyFormation = () => {
    if (!canEdit) return;
    const current = currentFormation.positions;
    const newA = computeTeamPositionsByFormation('A', current);
    const newB = computeTeamPositionsByFormation('B', current);
    setFormations(prev => ({
      ...prev,
      [matchNumberNum]: {
        ...prev[matchNumberNum],
        positions: [...newA, ...newB]
      }
    }));
    toast.success('설정된 포메이션에 맞춰 선수를 재배치했습니다');
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
    const positionsToSave = currentFormation.positions;
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
      console.error('[포메이션] 저장 예외', error);
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

  // 1경기 유형 설정 확인 (자체/대외 선택 후)
  const handleMatch1Config = async () => {
    const storageKey = `tactics_match1_config_${matchIdNum}`;
    try {
      if (!isSelfMatchState && newMatchOpponentName.trim()) {
        // 이미 1경기 상대팀 행이 있는지 확인 (중복 방지)
        const { data: existing } = await supabase
          .from('match_attendance')
          .select('id')
          .eq('match_id', matchIdNum)
          .eq('match_number', 1)
          .eq('is_opponent_team', true)
          .maybeSingle();
        if (!existing) {
          const { error: opponentError } = await supabase
            .from('match_attendance')
            .insert({
              match_id: matchIdNum,
              match_number: 1,
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
            console.error('1경기 상대팀 추가 에러:', opponentError);
            toast.error('상대팀 추가에 실패했습니다');
            return;
          }
        }
      }
      localStorage.setItem(storageKey, isSelfMatchState ? 'self' : 'opponent');
      setShowMatch1ConfigModal(false);
      setIsSelfMatchState(true);
      setNewMatchOpponentName('');
      toast.success(isSelfMatchState ? '1경기가 자체 경기로 설정되었습니다' : `1경기가 대외 경기(상대: ${newMatchOpponentName.trim()})로 설정되었습니다`);
    } catch (error) {
      console.error('1경기 설정 에러:', error);
      toast.error('1경기 설정에 실패했습니다');
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-4 min-w-0 overflow-hidden">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3 min-w-0">
                  <Clipboard className="w-5 h-5 sm:w-8 sm:h-8 text-green-600 shrink-0" />
                  <span className="truncate">작전판</span>
                </h1>
                <p className="text-xs sm:text-base text-gray-600 break-words min-w-0">경기별로 선수들을 배치하고 포메이션을 만들어보세요</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
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
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base min-w-0 shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">경기 선택</span>
                </CardTitle>
                {canEdit && (
                  <Button
                    onClick={addMatch}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm shrink-0"
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

          {/* PC: 포메이션 편집과 선수 명단을 좌우로 배치, 모바일: 세로로 배치 */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0">
            {/* 포메이션 편집 영역 - PC에서는 4/5 차지 */}
            <div className="lg:col-span-4">
              <Card 
                className="shadow-lg min-h-[300px] lg:min-h-[400px] flex flex-col"
              >
                <CardHeader className="pb-1 sm:pb-6">
                  <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base">
                    <span className="min-w-0 break-words">포메이션 편집 (A팀 / B팀)</span>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap min-w-0">
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
                      <div className="lg:hidden flex-shrink-0">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-green-300 text-green-700 text-xs">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {currentFormation.positions.length}명 배치됨
                        </Badge>
                      </div>
                      {canEdit && (
                        <div className="flex flex-wrap gap-1 sm:gap-2 justify-end sm:justify-start min-w-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={applyFormation}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm shrink-0"
                          >
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
                            <span className="hidden sm:inline">포메이션 적용</span>
                            <span className="sm:hidden">적용</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFormation}
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm shrink-0"
                          >
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                            초기화
                          </Button>
                          <Button
                            onClick={saveFormation}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm shrink-0"
                          >
                            <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                            저장
                          </Button>
                          <Button
                            onClick={handleNextPage}
                            size="sm"
                            disabled={hasUnsavedChanges()}
                            className={`text-xs sm:text-sm shrink-0 ${
                              hasUnsavedChanges() 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                            <span className="hidden sm:inline">다음 페이지</span>
                            <span className="sm:hidden">다음</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent ref={formationPanelRef} className="p-1 sm:p-6 space-y-6">
                  {/* A팀 포메이션 — 포지션별 슬롯에 선수 배치 */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-3 min-w-0 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="text-white text-xs sm:text-sm font-bold bg-blue-600 px-2 py-1 rounded shadow shrink-0">A팀 포메이션</span>
                        <span className="text-blue-900 text-xs font-medium bg-blue-100 px-2 py-0.5 rounded border border-blue-300 shrink-0">{formationTypeA}</span>
                      </div>
                      {canEdit && (
                        <Select value={formationTypeA} onValueChange={(v) => setFormationTypeA(v || '4-3-3')}>
                          <SelectTrigger className="w-[80px] sm:w-[92px] h-8 text-xs border-blue-200 bg-white shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4-3-3">4-3-3 (포백)</SelectItem>
                            <SelectItem value="4-4-2">4-4-2 (포백)</SelectItem>
                            <SelectItem value="4-2-3-1">4-2-3-1 (포백)</SelectItem>
                            <SelectItem value="4-5-1">4-5-1 (포백)</SelectItem>
                            <SelectItem value="3-5-2">3-5-2 (쓰리백)</SelectItem>
                            <SelectItem value="3-4-3">3-4-3 (쓰리백)</SelectItem>
                            <SelectItem value="5-3-2">5-3-2 (파이브백)</SelectItem>
                            <SelectItem value="5-4-1">5-4-1 (파이브백)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {/* 포지션별 왼쪽→오른쪽 배치: GK | DF | MF | FW */}
                    <div className="flex flex-row gap-3 sm:gap-4 flex-wrap">
                      {(['GK', 'DF', 'MF', 'FW'] as const).map((role) => {
                        const slots = getSlotsForTeam('A').map((s, i) => ({ ...s, index: i })).filter(s => s.role === role);
                        if (slots.length === 0) return null;
                        return (
                          <div key={role} className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-gray-600">{role}</span>
                            <div className="flex flex-col gap-1.5">
                              {slots.map(({ index }) => {
                                const pos = getPlayerAtSlot('A', index);
                                return (
                                  <div
                                    key={index}
                                    draggable={canEdit && !!pos}
                                    onDragStart={(e) => pos && canEdit && (pickupPlayer({ id: pos.playerId, name: pos.playerName, isOnField: true, team: 'A' }), e.dataTransfer.setData('text/plain', pos.playerId), e.dataTransfer.effectAllowed = 'move')}
                                    onDragEnd={() => setPickedPlayer(null)}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                    onDrop={(e) => { e.preventDefault(); placePlayerInSlot('A', index); }}
                                    onClick={() => {
                                      if (!canEdit) return;
                                      if (pickedPlayer) placePlayerInSlot('A', index);
                                      else if (pos) pickupPlayer({ id: pos.playerId, name: pos.playerName, isOnField: true, team: 'A' });
                                    }}
                                    className={`min-w-[72px] sm:min-w-[88px] max-w-full px-2 py-1.5 rounded-md border text-xs transition-colors overflow-hidden ${
                                      pos ? 'bg-blue-100 border-blue-300 text-blue-900 cursor-grab' : 'bg-white border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:bg-blue-50/50'
                                    } ${pickedPlayer ? 'cursor-pointer' : ''} ${pos && pickedPlayer?.id === pos.playerId ? 'ring-2 ring-yellow-400' : ''}`}
                                  >
                                    {pos ? (
                                      <span className="flex items-center justify-between gap-1 min-w-0">
                                        <span className={`truncate font-medium min-w-0 ${ROLE_NAME_COLORS[role]}`}>{pos.playerName.split('_')[0]}</span>
                                        {canEdit && (
                                          <button type="button" onClick={(e) => { e.stopPropagation(); removePlayerFromField(pos.playerId); }} className="text-gray-500 hover:text-red-600 shrink-0">×</button>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 whitespace-nowrap">선수 배치</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* B팀 포메이션 — 포지션별 슬롯에 선수 배치 */}
                  <div className="rounded-lg border border-red-200 bg-red-50/30 p-3 min-w-0 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="text-white text-xs sm:text-sm font-bold bg-red-600 px-2 py-1 rounded shadow shrink-0">B팀 포메이션</span>
                        <span className="text-red-900 text-xs font-medium bg-red-100 px-2 py-0.5 rounded border border-red-300 shrink-0">{formationTypeB}</span>
                      </div>
                      {canEdit && (
                        <Select value={formationTypeB} onValueChange={(v) => setFormationTypeB(v || '4-4-2')}>
                          <SelectTrigger className="w-[80px] sm:w-[92px] h-8 text-xs border-red-200 bg-white shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4-3-3">4-3-3 (포백)</SelectItem>
                            <SelectItem value="4-4-2">4-4-2 (포백)</SelectItem>
                            <SelectItem value="4-2-3-1">4-2-3-1 (포백)</SelectItem>
                            <SelectItem value="4-5-1">4-5-1 (포백)</SelectItem>
                            <SelectItem value="3-5-2">3-5-2 (쓰리백)</SelectItem>
                            <SelectItem value="3-4-3">3-4-3 (쓰리백)</SelectItem>
                            <SelectItem value="5-3-2">5-3-2 (파이브백)</SelectItem>
                            <SelectItem value="5-4-1">5-4-1 (파이브백)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {/* 포지션별 왼쪽→오른쪽 배치: GK | DF | MF | FW */}
                    <div className="flex flex-row gap-3 sm:gap-4 flex-wrap">
                      {(['GK', 'DF', 'MF', 'FW'] as const).map((role) => {
                        const slots = getSlotsForTeam('B').map((s, i) => ({ ...s, index: i })).filter(s => s.role === role);
                        if (slots.length === 0) return null;
                        return (
                          <div key={role} className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-gray-600">{role}</span>
                            <div className="flex flex-col gap-1.5">
                              {slots.map(({ index }) => {
                                const pos = getPlayerAtSlot('B', index);
                                return (
                                  <div
                                    key={index}
                                    draggable={canEdit && !!pos}
                                    onDragStart={(e) => pos && canEdit && (pickupPlayer({ id: pos.playerId, name: pos.playerName, isOnField: true, team: 'B' }), e.dataTransfer.setData('text/plain', pos.playerId), e.dataTransfer.effectAllowed = 'move')}
                                    onDragEnd={() => setPickedPlayer(null)}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                    onDrop={(e) => { e.preventDefault(); placePlayerInSlot('B', index); }}
                                    onClick={() => {
                                      if (!canEdit) return;
                                      if (pickedPlayer) placePlayerInSlot('B', index);
                                      else if (pos) pickupPlayer({ id: pos.playerId, name: pos.playerName, isOnField: true, team: 'B' });
                                    }}
                                    className={`min-w-[72px] sm:min-w-[88px] max-w-full px-2 py-1.5 rounded-md border text-xs transition-colors overflow-hidden ${
                                      pos ? 'bg-red-100 border-red-300 text-red-900 cursor-grab' : 'bg-white border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:bg-red-50/50'
                                    } ${pickedPlayer ? 'cursor-pointer' : ''} ${pos && pickedPlayer?.id === pos.playerId ? 'ring-2 ring-yellow-400' : ''}`}
                                  >
                                    {pos ? (
                                      <span className="flex items-center justify-between gap-1 min-w-0">
                                        <span className={`truncate font-medium min-w-0 ${ROLE_NAME_COLORS[role]}`}>{pos.playerName.split('_')[0]}</span>
                                        {canEdit && (
                                          <button type="button" onClick={(e) => { e.stopPropagation(); removePlayerFromField(pos.playerId); }} className="text-gray-500 hover:text-red-600 shrink-0">×</button>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 whitespace-nowrap">선수 배치</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {pickedPlayer && (
                    <div className="text-center py-1.5 px-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 rounded border border-blue-200 break-words min-w-0 overflow-hidden">
                      {pickedPlayer.name} — 배치할 포지션 칸을 클릭하거나 드래그해서 놓기
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 선수 명단 - PC에서는 1/5 차지, 모바일에서는 포메이션 아래 전체 폭 */}
            <div className="lg:col-span-1">
              <Card 
                className="shadow-lg h-[160px] lg:h-[500px] flex flex-col"
                // 모바일/PC 반응형 높이 조정 시작: 선수명단 Card 높이
              >
                <CardHeader className="pb-1 sm:pb-3">
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base min-w-0">
                    <div className="flex items-center gap-2 min-w-0 shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span className="truncate">선수 명단</span>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 shrink-0">
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
                          draggable={canEdit}
                          onDragStart={(e) => {
                            if (canEdit) {
                              pickupPlayer({ ...player, isOnField: false, team: selectedTeam });
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', player.id);
                            }
                          }}
                          onDragEnd={() => setPickedPlayer(null)}
                          className={`flex items-center p-2 border rounded-lg ${
                            canEdit ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:bg-gray-50' : 'cursor-default'
                          } transition-all select-none ${
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
                    <div className="text-xs text-gray-500 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0 overflow-hidden">
                      <span className="truncate">← 스크롤하여 더 많은 선수를 확인하세요 →</span>
                      <span className="shrink-0">출석: {availablePlayers.length}명 / 총 {attendingPlayers.length}명</span>
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
                            draggable={canEdit}
                            onDragStart={(e) => {
                              if (canEdit) {
                                pickupPlayer({ ...player, isOnField: false, team: selectedTeam });
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', player.id);
                              }
                            }}
                            onDragEnd={() => setPickedPlayer(null)}
                            className={`flex flex-col items-center flex-shrink-0 w-16 select-none ${
                              canEdit ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-default'
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

          {/* 철벽지수 입력 섹션 */}
          <Card className="shadow-lg border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg p-2 sm:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-purple-900">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  철벽지수 입력 (무실점 수비수 및 골키퍼)
                </CardTitle>
                {canEdit && attendingPlayers.filter(p => !p.isOpponentTeam).length > 0 && (
                  <Button
                    onClick={() => setShowCleansheetModal(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    철벽지수 선택
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {attendingPlayers.filter(p => !p.isOpponentTeam && p.cleansheet === 1).length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-2 text-purple-700">철벽지수 적용된 선수</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attendingPlayers
                      .filter(p => !p.isOpponentTeam && p.cleansheet === 1)
                      .map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">{player.name}</span>
                            <span className="text-xs text-gray-500">({player.position})</span>
                          </div>
                          {canEdit && (
                            <button
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('match_attendance')
                                    .update({ cleansheet: 0 })
                                    .eq('match_id', matchIdNum)
                                    .eq('match_number', matchNumberNum)
                                    .eq('player_id', player.id);
                                  
                                  if (error) {
                                    console.error('철벽지수 업데이트 오류:', error);
                                    toast.error('철벽지수 해제에 실패했습니다.');
                                  } else {
                                    toast.success(`${player.name}의 철벽지수가 해제되었습니다.`);
                                    setAttendingPlayers(prev => 
                                      prev.map(p => 
                                        p.id === player.id 
                                          ? { ...p, cleansheet: 0 }
                                          : p
                                      )
                                    );
                                  }
                                } catch (error) {
                                  console.error('철벽지수 업데이트 중 예외:', error);
                                  toast.error('철벽지수 해제에 실패했습니다.');
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              해제
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">철벽지수가 적용된 선수가 없습니다</p>
                  {canEdit && (
                    <p className="text-xs mt-1 text-gray-400">"철벽지수 선택" 버튼을 눌러 선수를 선택하세요</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 도움말 */}
          <Card className="shadow-lg bg-blue-50 border-blue-200 min-w-0 overflow-hidden">
            <CardContent className="p-2 sm:p-4 min-w-0">
              <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">사용법</h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1 break-words min-w-0 overflow-hidden">
                <li>• 상단에서 경기를 선택하거나 새로운 경기를 추가하세요</li>
                <li>• <strong>드래그 앤 드롭:</strong> 벤치 또는 포메이션 슬롯의 선수를 잡아당겨 배치할 포지션 칸(GK/DF/MF/FW)에 놓으면 됩니다</li>
                <li>• <strong>클릭 방식:</strong> 선수를 클릭한 뒤, 배치할 포지션 칸을 클릭해도 됩니다</li>
                <li>• <span className="font-semibold text-green-700">A팀·B팀 포메이션을 각각 선택(4-3-3, 4-4-2)한 뒤 해당 슬롯에 선수를 배치합니다</span></li>
                <li>• 포메이션 슬롯의 선수에서 X 버튼을 누르면 해당 슬롯에서 제거(벤치로) 됩니다</li>
                <li>• <span className="font-semibold text-purple-700">선택한 선수는 노란 테두리로 표시됩니다</span></li>
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

      {/* 철벽지수 선택 모달 */}
      {showCleansheetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                철벽지수 선택 (무실점 수비수 및 골키퍼)
              </h3>
              <button
                onClick={() => setShowCleansheetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="space-y-2">
                {attendingPlayers
                  .filter(p => !p.isOpponentTeam)
                  .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'))
                  .map((player) => (
                    <label
                      key={player.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={player.cleansheet === 1}
                        onChange={async (e) => {
                          if (!canEdit) return;
                          const cleansheetValue = e.target.checked ? 1 : 0;
                          
                          // DB 업데이트
                          try {
                            const { error } = await supabase
                              .from('match_attendance')
                              .update({ cleansheet: cleansheetValue })
                              .eq('match_id', matchIdNum)
                              .eq('match_number', matchNumberNum)
                              .eq('player_id', player.id);
                            
                            if (error) {
                              console.error('철벽지수 업데이트 오류:', error);
                              toast.error(`${player.name}의 철벽지수 업데이트에 실패했습니다.`);
                            } else {
                              // 선수 목록 업데이트
                              setAttendingPlayers(prev => 
                                prev.map(p => 
                                  p.id === player.id 
                                    ? { ...p, cleansheet: cleansheetValue }
                                    : p
                                )
                              );
                            }
                          } catch (error) {
                            console.error('철벽지수 업데이트 중 예외:', error);
                            toast.error(`${player.name}의 철벽지수 업데이트에 실패했습니다.`);
                          }
                        }}
                        disabled={!canEdit}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{player.name}</span>
                          {player.position && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {player.position}
                            </span>
                          )}
                          {player.cleansheet === 1 && (
                            <Shield className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
              
              {attendingPlayers.filter(p => !p.isOpponentTeam).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">출석한 선수가 없습니다</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => setShowCleansheetModal(false)}
                className="flex-1"
              >
                완료
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

      {/* 1경기 유형 설정 모달 (작전판 첫 진입 시) */}
      {showMatch1ConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">1경기 유형 설정</h3>
            <p className="text-sm text-gray-500 mb-4">1경기가 자체 경기인지, 상대팀이 있는 대외 경기인지 선택하세요.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">경기 유형 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSelfMatchState(true)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      isSelfMatchState ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-sm font-medium">자체 경기</div>
                    <div className="text-xs opacity-80">무쏘 vs 무쏘</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSelfMatchState(false)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      !isSelfMatchState ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-sm font-medium">대외 경기</div>
                    <div className="text-xs opacity-80">무쏘 vs 상대팀</div>
                  </button>
                </div>
              </div>
              {!isSelfMatchState && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상대팀 이름 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newMatchOpponentName}
                    onChange={(e) => setNewMatchOpponentName(e.target.value)}
                    placeholder="예: 지크, FC서울, 맨유 등"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleMatch1Config}
                disabled={!isSelfMatchState && !newMatchOpponentName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                확인
              </Button>
              <Button
                onClick={() => setShowMatch1ConfigModal(false)}
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