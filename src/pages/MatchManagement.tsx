
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import NoMatchesInfo from '@/components/match/NoMatchesInfo';
import MatchSection from '@/components/match/MatchSection';
import PlayerAttendanceForm from '@/components/match/PlayerAttendanceForm';
import PlayerStatsRecorder from '@/components/match/PlayerStatsRecorder';
import { useMatchData, Match } from '@/hooks/use-match-data';
import { useAuth } from '@/hooks/use-auth';

// Define types for attendance status
type AttendanceStatus = 'present' | 'absent' | 'late';

// Define a type for the attendance record
interface AttendanceRecord {
  playerId: string;
  status: AttendanceStatus;
}

const MatchManagement = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { matches, isLoading, error, handleAttendanceChange } = useMatchData();
  const [activeTab, setActiveTab] = useState<string>("attendance");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canManageAnnouncements } = useAuth();
  
  if (isLoading) {
    return <div>Loading matches...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Convert the string ID to number when needed
  const getSelectedMatchAsNumber = () => {
    return selectedMatchId ? Number(selectedMatchId) : null;
  };
  
  const handleViewMatch = (matchId: number) => {
    setSelectedMatchId(matchId.toString());
    setDialogOpen(true);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMatchId(null);
  };

  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  const selectedMatch = matches.find(m => m.id === Number(selectedMatchId));

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">경기 관리</h1>
        <p className="text-gray-600">팀의 경기 일정을 관리하고 출석을 체크합니다.</p>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">예정된 경기</TabsTrigger>
          <TabsTrigger value="completed">완료된 경기</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <MatchSection 
            title="다가오는 경기"
            matches={upcomingMatches}
            onAttendanceChange={handleAttendanceChange}
            canManageAnnouncements={canManageAnnouncements()}
            emptyMessage="등록된 예정 경기가 없습니다."
            showAddButton={true}
            onAddClick={() => console.log('Adding new match')}
            onViewMatch={handleViewMatch}
          />
        </TabsContent>
        <TabsContent value="completed">
          <MatchSection 
            title="완료된 경기"
            matches={completedMatches}
            onAttendanceChange={() => {}}
            canManageAnnouncements={canManageAnnouncements()}
            emptyMessage="완료된 경기가 없습니다."
            onViewMatch={handleViewMatch}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMatch ? `${selectedMatch.opponent} 경기 상세` : '경기 상세'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="attendance" className="flex-1">출석 체크</TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">선수 스탯 기록</TabsTrigger>
              </TabsList>
              
              <TabsContent value="attendance">
                <PlayerAttendanceForm 
                  matchId={getSelectedMatchAsNumber() || 0}
                  matchDate={selectedMatch.date}
                  opponent={selectedMatch.opponent}
                  players={[]}  // This would need real player data
                  isCoach={true}
                />
              </TabsContent>
              
              <TabsContent value="stats">
                <PlayerStatsRecorder 
                  matchId={getSelectedMatchAsNumber() || 0}
                  matchDate={selectedMatch.date}
                  opponent={selectedMatch.opponent}
                  players={[]}  // This would need real player data
                  playerStats={[]}  // This would need real player stats data
                  onStatChange={(playerId, field, value) => {
                    console.log(`Updating ${field} for player ${playerId} to ${value}`);
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button onClick={closeDialog}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MatchManagement;
