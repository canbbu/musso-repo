
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, CalendarCheck, Goal, Trophy } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Player {
  id: string;
  name: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  attendance: number;
  rating: number;
}

const PlayerStats = () => {
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  
  const [players] = useState<Player[]>([
    { 
      id: 'p1', 
      name: '김선수', 
      position: '공격수',
      games: 18, 
      goals: 12, 
      assists: 5, 
      attendance: 90,
      rating: 8.4 
    },
    { 
      id: 'p2', 
      name: '이공격수', 
      position: '공격수',
      games: 15, 
      goals: 9, 
      assists: 8, 
      attendance: 80,
      rating: 7.9 
    },
    { 
      id: 'p3', 
      name: '박수비', 
      position: '수비수',
      games: 20, 
      goals: 2, 
      assists: 3, 
      attendance: 95,
      rating: 8.0 
    },
    { 
      id: 'p4', 
      name: '정미드필더', 
      position: '미드필더',
      games: 16, 
      goals: 6, 
      assists: 12, 
      attendance: 85,
      rating: 8.2 
    },
    { 
      id: 'p5', 
      name: '최골키퍼', 
      position: '골키퍼',
      games: 19, 
      goals: 0, 
      assists: 1, 
      attendance: 92,
      rating: 7.6 
    },
    { 
      id: 'p6', 
      name: '강윙어', 
      position: '윙어',
      games: 14, 
      goals: 7, 
      assists: 4, 
      attendance: 75,
      rating: 7.5 
    },
    { 
      id: 'p7', 
      name: '황수비', 
      position: '수비수',
      games: 17, 
      goals: 1, 
      assists: 2, 
      attendance: 88,
      rating: 7.8 
    }
  ]);
  
  // Get the top players in each category
  const goalRanking = [...players].sort((a, b) => b.goals - a.goals);
  const assistRanking = [...players].sort((a, b) => b.assists - a.assists);
  const attendanceRanking = [...players].sort((a, b) => b.attendance - a.attendance);
  const ratingRanking = [...players].sort((a, b) => b.rating - a.rating);
  
  const [activeTab, setActiveTab] = useState<'goals' | 'assists' | 'attendance' | 'rating'>('goals');
  
  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'goals':
        return goalRanking;
      case 'assists':
        return assistRanking;
      case 'attendance':
        return attendanceRanking;
      case 'rating':
        return ratingRanking;
      default:
        return goalRanking;
    }
  };
  
  const getValueByTab = (player: Player) => {
    switch (activeTab) {
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'attendance':
        return `${player.attendance}%`;
      case 'rating':
        return player.rating;
      default:
        return player.goals;
    }
  };
  
  const getLabelByTab = () => {
    switch (activeTab) {
      case 'goals':
        return '득점';
      case 'assists':
        return '어시스트';
      case 'attendance':
        return '출석률';
      case 'rating':
        return '평점';
      default:
        return '득점';
    }
  };
  
  const getIconByTab = () => {
    switch (activeTab) {
      case 'goals':
        return <Goal className="text-green-500 h-5 w-5" />;
      case 'assists':
        return <Trophy className="text-blue-500 h-5 w-5" />;
      case 'attendance':
        return <CalendarCheck className="text-yellow-500 h-5 w-5" />;
      case 'rating':
        return <Star className="text-orange-500 h-5 w-5" />;
      default:
        return <Goal className="text-green-500 h-5 w-5" />;
    }
  };

  return (
    <div className="player-stats-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">시즌 랭킹</h1>
        <p className="text-gray-600">선수들의 시즌 기록과 순위를 확인하세요.</p>
        
        {canManagePlayerStats() && (
          <div className="mt-4">
            <Button onClick={() => navigate('/stats-management')} className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              선수 기록 관리
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card 
          className={`cursor-pointer border-2 ${activeTab === 'goals' ? 'border-green-500 bg-green-50' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center">
              <Goal className="mr-2 h-4 w-4 text-green-600" />
              득점 랭킹
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{goalRanking[0]?.name || '-'}</div>
            <div className="text-sm text-gray-500">{goalRanking[0]?.goals || 0} 골</div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer border-2 ${activeTab === 'assists' ? 'border-blue-500 bg-blue-50' : ''}`}
          onClick={() => setActiveTab('assists')}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-blue-600" />
              어시스트 랭킹
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{assistRanking[0]?.name || '-'}</div>
            <div className="text-sm text-gray-500">{assistRanking[0]?.assists || 0} 어시스트</div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer border-2 ${activeTab === 'attendance' ? 'border-yellow-500 bg-yellow-50' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center">
              <CalendarCheck className="mr-2 h-4 w-4 text-yellow-600" />
              출석 랭킹
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{attendanceRanking[0]?.name || '-'}</div>
            <div className="text-sm text-gray-500">{attendanceRanking[0]?.attendance || 0}%</div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer border-2 ${activeTab === 'rating' ? 'border-orange-500 bg-orange-50' : ''}`}
          onClick={() => setActiveTab('rating')}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center">
              <Star className="mr-2 h-4 w-4 text-orange-600" />
              평점 랭킹
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{ratingRanking[0]?.name || '-'}</div>
            <div className="text-sm text-gray-500">{ratingRanking[0]?.rating || 0} 평점</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            {getLabelByTab()} 순위
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">순위</TableHead>
                <TableHead>선수</TableHead>
                <TableHead>포지션</TableHead>
                <TableHead>경기</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center">
                    {getIconByTab()}
                    <span className="ml-1">{getLabelByTab()}</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentRanking().map((player, index) => (
                <TableRow key={player.id} className={index < 3 ? 'bg-gray-50' : ''}>
                  <TableCell className="text-center font-semibold">
                    {index === 0 ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full">
                        1
                      </div>
                    ) : index === 1 ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full">
                        2
                      </div>
                    ) : index === 2 ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-700 text-white rounded-full">
                        3
                      </div>
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.games}경기</TableCell>
                  <TableCell className="text-center font-bold">
                    {getValueByTab(player)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStats;
