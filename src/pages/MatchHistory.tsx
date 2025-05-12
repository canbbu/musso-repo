import React, { useState } from 'react';
import { useMatchData } from '@/hooks/use-match-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Eye, FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/Layout';

const MatchHistory = () => {
  const { matches } = useMatchData();
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const filteredMatches = sortedMatches.filter(match => 
    match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(match.date).toLocaleDateString('ko-KR').includes(searchTerm)
  );
  
  const handleViewMatch = (matchId: number) => {
    navigate(`/matches?matchId=${matchId}`);
  };
  
  const handleEditMatch = (matchId: number) => {
    navigate(`/matches?matchId=${matchId}&edit=true`);
  };
  
  return (
    <Layout>
      <div className="match-history-container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">이벤트 이력</h1>
          <p className="text-gray-600">전체 이벤트 기록을 확인합니다.</p>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>전체 이벤트 목록</CardTitle>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border rounded-md"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>상대팀</TableHead>
                  <TableHead>장소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>결과</TableHead>
                  <TableHead>MVP</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.length > 0 ? (
                  filteredMatches.map(match => (
                    <TableRow key={match.id}>
                      <TableCell>
                        {new Date(match.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{match.opponent}</TableCell>
                      <TableCell>{match.location}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800' 
                            : match.status === 'ongoing' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {match.status === 'upcoming' ? '예정됨' : match.status === 'ongoing' ? '진행중' : '완료'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {match.status === 'completed' ? (
                          <span className={`font-medium ${
                            match.result === 'win' 
                              ? 'text-green-600' 
                              : match.result === 'loss' 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                          }`}>
                            {match.score} ({match.result === 'win' ? '승' : match.result === 'loss' ? '패' : '무'})
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{match.mvp || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewMatch(match.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            보기
                          </Button>
                          {canManagePlayerStats() && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditMatch(match.id)}
                            >
                              <FileEdit className="h-4 w-4 mr-1" />
                              관리
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MatchHistory;
