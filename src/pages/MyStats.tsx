
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { User, Award, Calendar, Goal, Trophy } from 'lucide-react';
import { usePlayerRankings } from '@/hooks/use-player-rankings';
import Layout from '@/components/Layout';

const MyStats = () => {
  const { userName } = useAuth();
  const { players } = usePlayerRankings();
  
  // Find player stats based on username (in a real app, this would be more robust)
  const playerStats = players.find(p => p.name === userName) || players[0];
  
  const attendanceRate = playerStats.attendance;
  const goalEfficiency = Math.round((playerStats.goals / playerStats.games) * 100);
  const assistEfficiency = Math.round((playerStats.assists / playerStats.games) * 100);
  
  return (
    <Layout>
      <div className="player-personal-stats">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">내 기록</h1>
          <p className="text-gray-600">{userName}님의 이번 시즌 활동 기록입니다.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5 text-primary" />
                선수 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">이름</span>
                    <span>{playerStats.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">포지션</span>
                    <span>{playerStats.position}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">참여 경기</span>
                    <span>{playerStats.games}경기</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">평점</span>
                    <span className="font-bold">{playerStats.rating}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Award className="mr-2 h-5 w-5 text-primary" />
                경기 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">출석률</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">득점</span>
                    <span>{playerStats.goals}골</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded ${i < Math.min(5, Math.ceil(playerStats.goals/2)) ? 'bg-green-500' : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">어시스트</span>
                    <span>{playerStats.assists}회</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded ${i < Math.min(5, Math.ceil(playerStats.assists/2)) ? 'bg-blue-500' : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Goal className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-800">득점 효율</p>
                <h3 className="text-2xl font-bold text-green-700">{goalEfficiency}%</h3>
                <p className="text-xs text-green-600 mt-1">경기당 {(playerStats.goals / playerStats.games).toFixed(1)}골</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Trophy className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-blue-800">어시스트 효율</p>
                <h3 className="text-2xl font-bold text-blue-700">{assistEfficiency}%</h3>
                <p className="text-xs text-blue-600 mt-1">경기당 {(playerStats.assists / playerStats.games).toFixed(1)}회</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-yellow-800">출석률</p>
                <h3 className="text-2xl font-bold text-yellow-700">{attendanceRate}%</h3>
                <p className="text-xs text-yellow-600 mt-1">{Math.round(playerStats.games * (attendanceRate/100))}회 참석</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MyStats;
