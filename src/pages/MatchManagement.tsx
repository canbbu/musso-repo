
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Award, ArrowRight, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  score?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const MatchManagement = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  const [matches, setMatches] = useState<Match[]>([
    { 
      id: 1, 
      date: '2023-11-25T19:00', 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울', 
      status: 'upcoming',
      createdBy: '박감독',
      updatedBy: '김운영',
      updatedAt: '2023-11-22 10:30'
    },
    { 
      id: 2, 
      date: '2023-12-02T18:00', 
      location: '강남 체육공원', 
      opponent: '강남 유나이티드', 
      status: 'upcoming',
      createdBy: '김운영'
    },
    { 
      id: 3, 
      date: '2023-11-18T16:00', 
      location: '올림픽 공원 축구장', 
      opponent: '드림 FC', 
      status: 'completed',
      score: '2-1',
      createdBy: '박감독',
      updatedBy: '박감독',
      updatedAt: '2023-11-18 18:30'
    }
  ]);
  
  useEffect(() => {
    // Check authentication and permissions
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setUserRole(role);
    setUserName(name);
  }, [navigate]);
  
  // Check if user has edit permissions
  const canManageMatches = (): boolean => {
    return userRole === 'executive' || userRole === 'coach';
  };
  
  // Add a new match (demo function)
  const handleAddMatch = () => {
    if (!canManageMatches() || !userName) return;
    
    const newMatch: Match = {
      id: matches.length + 1,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      location: '새 경기장 위치',
      opponent: '새 상대팀',
      status: 'upcoming',
      createdBy: userName
    };
    
    setMatches([...matches, newMatch]);
  };

  return (
    <div className="match-management-container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">경기 관리</h1>
        <p className="text-gray-600">일정, 결과 및 모든 팀 경기 관리</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              다가오는 경기
            </CardTitle>
            <CardDescription>예정된 다음 경기</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{matches.filter(m => m.status === 'upcoming').length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              선수 출석
            </CardTitle>
            <CardDescription>평균 경기 참여율</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">85%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-600" />
              팀 성과
            </CardTitle>
            <CardDescription>승패 기록</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7W 2L 1D</p>
          </CardContent>
        </Card>
      </div>

      <div className="upcoming-matches mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">다가오는 경기</h2>
          {canManageMatches() && (
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
              onClick={handleAddMatch}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              새 경기 등록
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {matches.filter(match => match.status === 'upcoming').map(match => (
            <Card key={match.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="match-info mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold mb-1">vs {match.opponent}</h3>
                    <p className="text-gray-600 mb-1">
                      {new Date(match.date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-gray-600">{match.location}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      등록자: {match.createdBy}
                      {match.updatedBy && (
                        <span> | 최종 수정: {match.updatedBy} ({match.updatedAt})</span>
                      )}
                    </div>
                  </div>
                  <div className="match-actions flex space-x-3">
                    {canManageMatches() && (
                      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center">
                        <Edit className="mr-1 h-4 w-4" />
                        관리하기
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                      출석체크
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {matches.filter(match => match.status === 'upcoming').length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">예정된 경기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="completed-matches">
        <h2 className="text-2xl font-semibold mb-4">최근 경기</h2>
        <div className="grid grid-cols-1 gap-4">
          {matches.filter(match => match.status === 'completed').map(match => (
            <Card key={match.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="match-info mb-4 md:mb-0">
                    <div className="flex items-center mb-1">
                      <h3 className="text-xl font-semibold">vs {match.opponent}</h3>
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        승리 {match.score}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      {new Date(match.date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-gray-600">{match.location}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      등록자: {match.createdBy}
                      {match.updatedBy && (
                        <span> | 최종 수정: {match.updatedBy} ({match.updatedAt})</span>
                      )}
                    </div>
                  </div>
                  <div className="match-actions flex space-x-3">
                    <button className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition">
                      경기 결과 보기 <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                    {canManageMatches() && (
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {matches.filter(match => match.status === 'completed').length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">완료된 경기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;
