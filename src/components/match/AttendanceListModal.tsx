import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { Check, X, Clock } from 'lucide-react';
import { formatKoreanDate } from '@/utils/date-helpers';

interface Player {
  id: number | string;
  username: string;
  name: string;
  role: string;
  attendance_status?: string;
}

interface MatchInfo {
  date: string;
  opponent: string;
  location: string;
}

interface AttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: number;
  matchInfo: MatchInfo;
}

const roleOrder = {
  '회장': 1,
  '부회장': 2,
  '코치': 3,
  '선수': 4,
  '매니저': 5,
  '': 6 // 역할이 없는 경우
};

const AttendanceListModal = ({ isOpen, onClose, matchId, matchInfo }: AttendanceListModalProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // 참석 상태 정규화 함수
  const getNormalizedStatus = (status: string) => {
    if (status === 'attending') return '참석';
    if (status === 'not_attending') return '불참';
    return '미정';
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 전체 회원 목록 가져오기
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*');
        
      if (playersError) throw playersError;
      
      // 해당 이벤트에 대한 참석 정보 가져오기
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select('player_id, status')
        .eq('match_id', matchId);
        
      if (attendanceError) throw attendanceError;
      
      // 참석 정보와 회원 정보 병합
      const playersWithAttendance = playersData.map((player: Player) => {
        const attendance = attendanceData?.find((a: any) => a.player_id === player.id);
        return {
          ...player,
          attendance_status: attendance ? getNormalizedStatus(attendance.status) : '미정'
        };
      });
      
      // 이름 기준 오름차순 정렬
      const sortedPlayers = playersWithAttendance.sort((a: Player, b: Player) => a.name.localeCompare(b.name, 'ko'));
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('참석 정보를 불러오는 중 오류가 발생했습니다:', error);
      setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && matchId) {
      fetchAttendanceData();
    }
  }, [isOpen, matchId]);
  
  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case '참석':
        return 'bg-green-100 text-green-800';
      case '불참':
        return 'bg-red-100 text-red-800';
      case '미정':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getAttendanceStatusIcon = (status: string) => {
    switch (status) {
      case '참석':
        return <Check className="h-4 w-4 text-green-600" />;
      case '불참':
        return <X className="h-4 w-4 text-red-600" />;
      case '미정':
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const attending = players.filter(player => player.attendance_status === '참석');
  const notAttending = players.filter(player => player.attendance_status === '불참');
  const pending = players.filter(player => player.attendance_status === '미정');
  
  const formattedDate = formatKoreanDate(matchInfo.date);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {formattedDate} 이벤트 참석 현황
          </DialogTitle>
          <div className="mt-2 text-sm text-gray-500">
            <p>상대팀: {matchInfo.opponent}</p>
            <p>장소: {matchInfo.location}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                참석: {attending.length}명
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                불참: {notAttending.length}명
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                미정: {pending.length}명
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">전체 ({players.length})</TabsTrigger>
            <TabsTrigger value="attending">참석 ({attending.length})</TabsTrigger>
            <TabsTrigger value="notAttending">불참 ({notAttending.length})</TabsTrigger>
            <TabsTrigger value="pending">미정 ({pending.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {renderPlayerList(players)}
          </TabsContent>
          
          <TabsContent value="attending" className="mt-4">
            {renderPlayerList(attending)}
          </TabsContent>
          
          <TabsContent value="notAttending" className="mt-4">
            {renderPlayerList(notAttending)}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            {renderPlayerList(pending)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
  
  function renderPlayerList(playerList: Player[]) {
    if (loading) {
      return <div className="py-8 text-center">데이터를 불러오는 중...</div>;
    }
    
    if (error) {
      return <div className="py-8 text-center text-red-500">{error}</div>;
    }
    
    if (playerList.length === 0) {
      return <div className="py-8 text-center">해당 분류의 회원이 없습니다.</div>;
    }
    
    return (
      <div className="space-y-4">
        {playerList.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
            <div className="flex items-center">
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-500">{player.username}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${getAttendanceStatusColor(player.attendance_status || '미정')}`}
              >
                {getAttendanceStatusIcon(player.attendance_status || '미정')}
                {player.attendance_status || '미정'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default AttendanceListModal; 