
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, UserCheck, Goal, Home, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface PlayerStat {
  id: number;
  name: string;
  position: string;
  matches: number;
  goals: number;
  assists: number;
  attendance: number;
  mvps: number;
}

interface MatchStat {
  id: number;
  date: string;
  opponent: string;
  result: string;
  goals: number;
  assists: number;
  played: boolean;
  mvp: boolean;
}

const PlayerStats = () => {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStat | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchStat[]>([]);
  const [topScorers, setTopScorers] = useState<Partial<PlayerStat>[]>([]);
  const [topAssisters, setTopAssisters] = useState<Partial<PlayerStat>[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simulate data loading
    setTimeout(() => {
      // Set mock player statistics
      setPlayerStats({
        id: 1,
        name: '홍길동',
        position: '공격수',
        matches: 15,
        goals: 8,
        assists: 5,
        attendance: 92,
        mvps: 3
      });

      // Set mock recent matches
      setRecentMatches([
        {
          id: 1,
          date: '2023-11-15',
          opponent: 'FC 서울',
          result: '승리 (3-1)',
          goals: 2,
          assists: 0,
          played: true,
          mvp: true
        },
        {
          id: 2,
          date: '2023-11-08',
          opponent: '강남 유나이티드',
          result: '무승부 (2-2)',
          goals: 1,
          assists: 1,
          played: true,
          mvp: false
        },
        {
          id: 3,
          date: '2023-10-28',
          opponent: '한강 FC',
          result: '패배 (1-3)',
          goals: 0,
          assists: 1,
          played: true,
          mvp: false
        },
        {
          id: 4,
          date: '2023-10-19',
          opponent: '부산 다이나모',
          result: '승리 (2-0)',
          goals: 1,
          assists: 0,
          played: true,
          mvp: false
        },
        {
          id: 5,
          date: '2023-10-12',
          opponent: '인천 레인저스',
          result: '승리 (4-2)',
          goals: 2,
          assists: 1,
          played: true,
          mvp: true
        }
      ]);

      // Set mock top scorers
      setTopScorers([
        { id: 1, name: '홍길동', goals: 8 },
        { id: 2, name: '김철수', goals: 7 },
        { id: 3, name: '박영희', goals: 6 },
        { id: 4, name: '이민수', goals: 5 },
        { id: 5, name: '정우진', goals: 4 }
      ]);

      // Set mock top assisters
      setTopAssisters([
        { id: 2, name: '김철수', assists: 7 },
        { id: 1, name: '홍길동', assists: 5 },
        { id: 5, name: '정우진', assists: 5 },
        { id: 3, name: '박영희', assists: 4 },
        { id: 6, name: '최지훈', assists: 3 }
      ]);

      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const getStatColor = (stat: number, maxValue: number) => {
    const percentage = (stat / maxValue) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
        <p className="ml-2">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="player-stats-container p-6">
      {/* Home Button */}
      <a href="/dashboard" className="home-button">
        <Home className="home-icon" size={16} />
        홈으로 돌아가기
      </a>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Player Statistics</h1>
        <p className="text-gray-600">View your performance stats and team rankings</p>
      </div>

      {playerStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Goal className="mr-2 h-5 w-5 text-purple-600" />
                골 / 어시스트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{playerStats.goals}</span>
                <span className="text-xl mx-2">/</span>
                <span className="text-3xl font-bold">{playerStats.assists}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">총 {playerStats.matches}경기</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-blue-600" />
                출석률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{playerStats.attendance}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${playerStats.attendance}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                경기당 공헌도
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {((playerStats.goals + playerStats.assists) / playerStats.matches).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mt-1">골 + 어시스트 / 경기</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-600" />
                MVP 횟수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{playerStats.mvps}</p>
              <p className="text-sm text-gray-600 mt-1">총 {playerStats.matches}경기 중</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-4">최근 경기 기록</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상대팀</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결과</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">득점</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">어시스트</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MVP</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentMatches.map((match) => (
                      <tr key={match.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{match.date}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{match.opponent}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            match.result.includes('승리') ? 'bg-green-100 text-green-800' : 
                            match.result.includes('무승부') ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {match.result}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`font-semibold ${getStatColor(match.goals, 3)}`}>
                            {match.goals}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`font-semibold ${getStatColor(match.assists, 3)}`}>
                            {match.assists}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                          {match.mvp ? (
                            <Award className="h-5 w-5 text-yellow-500 inline" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">팀 랭킹</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">득점 랭킹</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topScorers.map((player, index) => (
                  <li key={player.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-gray-300' : 
                      index === 2 ? 'bg-amber-700' : 'bg-gray-200'
                    }`}>
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="flex-grow">{player.name}</span>
                    <span className="font-semibold text-green-600">{player.goals}골</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">어시스트 랭킹</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topAssisters.map((player, index) => (
                  <li key={player.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-gray-300' : 
                      index === 2 ? 'bg-amber-700' : 'bg-gray-200'
                    }`}>
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="flex-grow">{player.name}</span>
                    <span className="font-semibold text-blue-600">{player.assists}어시스트</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation */}
      <button onClick={toggleMobileNav} className="fixed bottom-4 right-4 z-50 bg-green-500 text-white rounded-full p-3 shadow-lg md:hidden">
        <Menu size={24} />
      </button>
      
      <div className={`mobile-sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <h3>축구회</h3>
          <button className="close-sidebar" onClick={toggleMobileNav}>
            <X size={20} />
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li><a href="/dashboard">홈</a></li>
          <li><a href="/matches">경기</a></li>
          <li><a href="/stats" className="active">기록</a></li>
          <li><a href="/community">커뮤니티</a></li>
          <li><a href="/gallery">갤러리</a></li>
          <li><a href="/finance">회계</a></li>
        </ul>
      </div>
    </div>
  );
};

export default PlayerStats;
