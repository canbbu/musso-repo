
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Users, Award, ArrowRight } from "lucide-react";

interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  score?: string;
}

const MatchManagement = () => {
  const [matches, setMatches] = useState<Match[]>([
    { 
      id: 1, 
      date: '2023-11-25T19:00', 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울', 
      status: 'upcoming'
    },
    { 
      id: 2, 
      date: '2023-12-02T18:00', 
      location: '강남 체육공원', 
      opponent: '강남 유나이티드', 
      status: 'upcoming'
    },
    { 
      id: 3, 
      date: '2023-11-18T16:00', 
      location: '올림픽 공원 축구장', 
      opponent: '드림 FC', 
      status: 'completed',
      score: '2-1'
    }
  ]);

  return (
    <div className="match-management-container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Match Management</h1>
        <p className="text-gray-600">Schedule, track, and manage all team matches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Upcoming Matches
            </CardTitle>
            <CardDescription>Next games scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{matches.filter(m => m.status === 'upcoming').length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Player Attendance
            </CardTitle>
            <CardDescription>Average match participation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">85%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-600" />
              Team Performance
            </CardTitle>
            <CardDescription>Win-loss record</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7W 2L 1D</p>
          </CardContent>
        </Card>
      </div>

      <div className="upcoming-matches mb-10">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Matches</h2>
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
                  </div>
                  <div className="match-actions flex space-x-3">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                      관리하기
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                      출석체크
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="completed-matches">
        <h2 className="text-2xl font-semibold mb-4">Recent Matches</h2>
        <div className="grid grid-cols-1 gap-4">
          {matches.filter(match => match.status === 'completed').map(match => (
            <Card key={match.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="match-info mb-4 md:mb-0">
                    <div className="flex items-center mb-1">
                      <h3 className="text-xl font-semibold">vs {match.opponent}</h3>
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Win {match.score}
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
                  </div>
                  <div className="match-actions">
                    <button className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition">
                      경기 결과 보기 <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;
