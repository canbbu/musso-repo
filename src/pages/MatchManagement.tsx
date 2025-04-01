
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Check, X, AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Attendance {
  attending: number;
  notAttending: number;
  pending: number;
}

interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  attendance: Attendance;
  userResponse?: 'attending' | 'notAttending' | null;
  score?: string;
  result?: 'win' | 'loss' | 'draw';
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const MatchManagement = () => {
  const { canManageAnnouncements } = useAuth();
  const { toast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([
    { 
      id: 1, 
      date: '2023-11-25T19:00', 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울', 
      status: 'upcoming',
      attendance: { attending: 8, notAttending: 3, pending: 5 },
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
      attendance: { attending: 5, notAttending: 2, pending: 9 },
      createdBy: '김운영'
    },
    { 
      id: 3, 
      date: '2023-11-18T16:00', 
      location: '올림픽 공원 축구장', 
      opponent: '드림 FC', 
      status: 'completed',
      attendance: { attending: 11, notAttending: 4, pending: 0 },
      score: '2-1',
      result: 'win',
      createdBy: '박감독',
      updatedBy: '박감독',
      updatedAt: '2023-11-18 18:30'
    },
    {
      id: 4,
      date: '2023-11-11T14:00',
      location: '강동 구민 체육관',
      opponent: '강동 FC',
      status: 'completed',
      attendance: { attending: 10, notAttending: 5, pending: 0 },
      score: '1-2',
      result: 'loss',
      createdBy: '박감독',
      updatedBy: '박감독',
      updatedAt: '2023-11-11 16:30'
    }
  ]);
  
  // Get the current year's total matches
  const currentYearMatches = matches.filter(
    match => new Date(match.date).getFullYear() === new Date().getFullYear()
  ).length;

  const handleAttendanceChange = (matchId: number, response: 'attending' | 'notAttending') => {
    setMatches(matches.map(match => {
      if (match.id === matchId) {
        const oldResponse = match.userResponse;
        const newAttendance = { ...match.attendance };
        
        // Adjust counts based on the old and new responses
        if (oldResponse === 'attending') newAttendance.attending--;
        if (oldResponse === 'notAttending') newAttendance.notAttending--;
        if (oldResponse === null) newAttendance.pending--;
        
        if (response === 'attending') newAttendance.attending++;
        if (response === 'notAttending') newAttendance.notAttending++;
        
        toast({
          title: response === 'attending' ? '참석 확인' : '불참 확인',
          description: `${match.opponent}와의 경기에 ${response === 'attending' ? '참석' : '불참'}으로 표시되었습니다.`,
        });
        
        return {
          ...match,
          attendance: newAttendance,
          userResponse: response
        };
      }
      return match;
    }));
  };

  return (
    <div className="match-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">경기 관리</h1>
        <p className="text-gray-600">일정, 결과 및 모든 팀 경기 관리</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              이번년도 경기
            </CardTitle>
            <CardDescription>총 경기 수</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentYearMatches} 경기</p>
          </CardContent>
        </Card>
      </div>

      <div className="upcoming-matches mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">다가오는 경기</h2>
          {canManageAnnouncements() && (
            <Button onClick={() => {window.location.href = "/announcement-management"}} variant="default" className="flex items-center">
              새 경기 등록
            </Button>
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
                    <p className="text-gray-600 mb-3">{match.location}</p>
                    
                    {/* Attendance information */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full mr-1">
                          <Check size={12} />
                        </span>
                        <span>참석: {match.attendance.attending}명</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full mr-1">
                          <X size={12} />
                        </span>
                        <span>불참: {match.attendance.notAttending}명</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-300 text-gray-700 rounded-full mr-1">
                          ?
                        </span>
                        <span>미정: {match.attendance.pending}명</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      등록자: {match.createdBy}
                      {match.updatedBy && (
                        <span> | 최종 수정: {match.updatedBy} ({match.updatedAt})</span>
                      )}
                    </div>
                  </div>
                  <div className="match-actions flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        variant={match.userResponse === 'attending' ? 'default' : 'secondary'} 
                        className={`flex-1 flex items-center justify-center ${
                          match.userResponse === 'attending' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : ''
                        }`}
                        onClick={() => handleAttendanceChange(match.id, 'attending')}
                      >
                        <Check size={18} className="mr-1" />
                        참석
                      </Button>
                      <Button 
                        variant={match.userResponse === 'notAttending' ? 'destructive' : 'secondary'} 
                        className="flex-1 flex items-center justify-center"
                        onClick={() => handleAttendanceChange(match.id, 'notAttending')}
                      >
                        <X size={18} className="mr-1" />
                        불참
                      </Button>
                    </div>
                    {canManageAnnouncements() && (
                      <Button className="flex items-center justify-center">
                        경기 관리
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {matches.filter(match => match.status === 'upcoming').length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded">
              <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-gray-500">예정된 경기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="completed-matches">
        <h2 className="text-2xl font-semibold mb-4">최근 경기</h2>
        <div className="grid grid-cols-1 gap-4">
          {matches.filter(match => match.status === 'completed').map(match => (
            <Card key={match.id} className={`border-l-4 ${match.result === 'win' ? 'border-l-green-500' : match.result === 'loss' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="match-info mb-4 md:mb-0">
                    <div className="flex items-center mb-1">
                      <h3 className="text-xl font-semibold">vs {match.opponent}</h3>
                      <span className={`ml-3 px-2 py-1 ${
                        match.result === 'win' 
                          ? 'bg-green-100 text-green-800' 
                          : match.result === 'loss' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      } text-sm rounded-full`}>
                        {match.result === 'win' ? '승리' : match.result === 'loss' ? '패배' : '무승부'} {match.score}
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
                    
                    {/* Attendance information */}
                    <div className="flex gap-4 text-sm mt-2">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full mr-1">
                          <Check size={12} />
                        </span>
                        <span>참석: {match.attendance.attending}명</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      등록자: {match.createdBy}
                      {match.updatedBy && (
                        <span> | 최종 수정: {match.updatedBy} ({match.updatedAt})</span>
                      )}
                    </div>
                  </div>
                  <div className="match-actions">
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                      경기 결과 보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {matches.filter(match => match.status === 'completed').length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded">
              <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-gray-500">완료된 경기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;
