
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Calendar, Star } from "lucide-react";

interface Player {
  id: number;
  name: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  rating: number;
  attendance: number;
}

const PlayerStats = () => {
  const [players] = useState<Player[]>([
    { id: 1, name: '김민수', position: 'FW', games: 15, goals: 12, assists: 5, rating: 8.2, attendance: 95 },
    { id: 2, name: '이지훈', position: 'MF', games: 14, goals: 8, assists: 10, rating: 8.5, attendance: 90 },
    { id: 3, name: '박세준', position: 'DF', games: 16, goals: 2, assists: 3, rating: 7.8, attendance: 100 },
    { id: 4, name: '정우진', position: 'MF', games: 12, goals: 7, assists: 8, rating: 8.1, attendance: 80 },
    { id: 5, name: '오현우', position: 'FW', games: 13, goals: 10, assists: 4, rating: 8.0, attendance: 85 },
    { id: 6, name: '하성민', position: 'DF', games: 15, goals: 0, assists: 1, rating: 7.5, attendance: 95 },
    { id: 7, name: '강준호', position: 'GK', games: 16, goals: 0, assists: 0, rating: 7.9, attendance: 100 },
    { id: 8, name: '노태현', position: 'MF', games: 10, goals: 5, assists: 7, rating: 7.7, attendance: 70 },
    { id: 9, name: '이철수', position: 'FW', games: 11, goals: 9, assists: 2, rating: 7.6, attendance: 75 },
    { id: 10, name: '최영재', position: 'DF', games: 14, goals: 1, assists: 2, rating: 7.4, attendance: 90 }
  ]);

  // Sort players based on different statistics
  const goalScorers = [...players].sort((a, b) => b.goals - a.goals);
  const assistLeaders = [...players].sort((a, b) => b.assists - a.assists);
  const ratingLeaders = [...players].sort((a, b) => b.rating - a.rating);
  const attendanceLeaders = [...players].sort((a, b) => b.attendance - a.attendance);

  return (
    <div className="player-stats-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">시즌 랭킹</h1>
        <p className="text-gray-600">선수별 통계 및 순위 확인</p>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" /> 득점 랭킹
          </TabsTrigger>
          <TabsTrigger value="assists" className="flex items-center gap-1">
            <Award className="w-4 h-4" /> 어시스트 랭킹
          </TabsTrigger>
          <TabsTrigger value="rating" className="flex items-center gap-1">
            <Star className="w-4 h-4" /> 평점 랭킹
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> 출석 랭킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                득점 랭킹 (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">순위</th>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">포지션</th>
                      <th className="px-4 py-3 text-center">경기 수</th>
                      <th className="px-4 py-3 text-center font-bold">득점</th>
                      <th className="px-4 py-3 text-center">경기당 득점</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {goalScorers.slice(0, 10).map((player, index) => (
                      <tr key={player.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3">
                          {index < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              index === 0 ? 'bg-yellow-400' : 
                              index === 1 ? 'bg-gray-300' : 'bg-amber-600'
                            } text-white font-bold`}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="pl-2">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{player.name}</td>
                        <td className="px-4 py-3">{player.position}</td>
                        <td className="px-4 py-3 text-center">{player.games}</td>
                        <td className="px-4 py-3 text-center font-bold">{player.goals}</td>
                        <td className="px-4 py-3 text-center">{(player.goals / player.games).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assists">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-500" />
                어시스트 랭킹 (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">순위</th>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">포지션</th>
                      <th className="px-4 py-3 text-center">경기 수</th>
                      <th className="px-4 py-3 text-center font-bold">어시스트</th>
                      <th className="px-4 py-3 text-center">경기당 어시스트</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {assistLeaders.slice(0, 10).map((player, index) => (
                      <tr key={player.id} className={index < 3 ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-3">
                          {index < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              index === 0 ? 'bg-blue-400' : 
                              index === 1 ? 'bg-gray-300' : 'bg-blue-600'
                            } text-white font-bold`}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="pl-2">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{player.name}</td>
                        <td className="px-4 py-3">{player.position}</td>
                        <td className="px-4 py-3 text-center">{player.games}</td>
                        <td className="px-4 py-3 text-center font-bold">{player.assists}</td>
                        <td className="px-4 py-3 text-center">{(player.assists / player.games).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rating">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-purple-500" />
                평점 랭킹 (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">순위</th>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">포지션</th>
                      <th className="px-4 py-3 text-center">경기 수</th>
                      <th className="px-4 py-3 text-center font-bold">평균 평점</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ratingLeaders.slice(0, 10).map((player, index) => (
                      <tr key={player.id} className={index < 3 ? 'bg-purple-50' : ''}>
                        <td className="px-4 py-3">
                          {index < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              index === 0 ? 'bg-purple-400' : 
                              index === 1 ? 'bg-gray-300' : 'bg-purple-600'
                            } text-white font-bold`}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="pl-2">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{player.name}</td>
                        <td className="px-4 py-3">{player.position}</td>
                        <td className="px-4 py-3 text-center">{player.games}</td>
                        <td className="px-4 py-3 text-center font-bold">{player.rating.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-green-500" />
                출석 랭킹 (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">순위</th>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">포지션</th>
                      <th className="px-4 py-3 text-center">경기 수</th>
                      <th className="px-4 py-3 text-center font-bold">출석률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {attendanceLeaders.slice(0, 10).map((player, index) => (
                      <tr key={player.id} className={index < 3 ? 'bg-green-50' : ''}>
                        <td className="px-4 py-3">
                          {index < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              index === 0 ? 'bg-green-400' : 
                              index === 1 ? 'bg-gray-300' : 'bg-green-600'
                            } text-white font-bold`}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="pl-2">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{player.name}</td>
                        <td className="px-4 py-3">{player.position}</td>
                        <td className="px-4 py-3 text-center">{player.games}</td>
                        <td className="px-4 py-3 text-center font-bold">{player.attendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerStats;
