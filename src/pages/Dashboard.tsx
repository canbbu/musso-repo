
import React, { useState } from 'react';
import '../styles/Dashboard.css';
import { Calendar, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
}

const Dashboard = () => {
  const [upcomingMatches] = useState<UpcomingMatch[]>([
    { id: 1, date: '2023-11-25 19:00', location: '서울 마포구 풋살장', opponent: 'FC 서울' },
    { id: 2, date: '2023-12-02 18:00', location: '강남 체육공원', opponent: '강남 유나이티드' },
  ]);
  
  const [announcements] = useState<Announcement[]>([
    { 
      id: 1, 
      title: '이번 주 경기 공지', 
      date: '2023-11-20', 
      content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
      author: '김운영',
      updatedAt: '2023-11-20 14:30'
    },
    { 
      id: 2, 
      title: '연말 모임 안내', 
      date: '2023-11-18', 
      content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
      author: '박감독',
      updatedAt: '2023-11-18 10:15'
    },
  ]);

  return (
    <div className="dashboard-content">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600">축구회 관리 시스템에 오신 것을 환영합니다.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              다가오는 경기
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <ul className="space-y-4">
                {upcomingMatches.map(match => (
                  <li key={match.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex gap-4">
                      <div className="bg-green-100 p-3 rounded-lg text-green-800 text-center min-w-16">
                        <div className="text-xl font-bold">{new Date(match.date).getDate()}</div>
                        <div className="text-sm">{new Date(match.date).toLocaleDateString('ko-KR', { month: 'short' })}</div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{match.opponent || '내부 경기'}</h3>
                        <p className="text-sm text-gray-600">{match.location}</p>
                        <p className="text-xs text-gray-500">{new Date(match.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">참석</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">예정된 경기가 없습니다.</p>
            )}
            <div className="mt-4 text-right">
              <a href="/matches" className="text-green-600 hover:underline text-sm">모든 경기 보기</a>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">승률</span>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">경기 참여율</span>
                <span className="font-semibold">80%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">팀내 득점 순위</span>
                <span className="font-semibold">3위</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">팀내 어시스트 순위</span>
                <span className="font-semibold">5위</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              공지사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <ul className="divide-y">
                {announcements.map(announcement => (
                  <li key={announcement.id} className="py-4">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                      <span>{announcement.date}</span>
                      <span>작성자: {announcement.author}</span>
                    </div>
                    <p className="mt-2 text-gray-700">{announcement.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">공지사항이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
