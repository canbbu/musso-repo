import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlayerAttendanceForm from '@/components/match/PlayerAttendanceForm';
import AttendanceRecordForm from '@/components/match/AttendanceRecordForm';
import MatchRecordForm from '@/components/match/MatchRecordForm';
import CompletedMatchSection from '@/components/match/CompletedMatchSection';
import NoMatchesInfo from '@/components/match/NoMatchesInfo';
import PlayerStatsRecorder from '@/components/match/PlayerStatsRecorder';
import { useMatchData, Match } from '@/hooks/use-match-data'; // Change to useMatchData which exists

// Define types for attendance status
type AttendanceStatus = 'present' | 'absent' | 'late';

// Define a type for the attendance record
interface AttendanceRecord {
  playerId: string;
  status: AttendanceStatus;
}

// Create a custom hook that builds on useMatchData
const useMatches = () => {
  const matchData = useMatchData();
  return {
    matches: matchData.matches,
    isLoading: false, // Since we have static data for now
    error: null,
    selectedMatchId: matchData.selectedMatchId,
    setSelectedMatchId: matchData.setSelectedMatchId
  };
};

const MatchManagement = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { matches, isLoading, error } = useMatches();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  if (isLoading) {
    return <div>Loading matches...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Function to handle saving the match data
  const handleSaveMatchData = (matchData: Partial<Match>) => {
    console.log('Saving match data:', matchData);
    // In a real application, this would update the match data in the backend
  };

  return (
    <Layout>
      <Tabs defaultValue="upcoming" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="completed">Completed Matches</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {matches.length > 0 ? (
            matches.map((match) => (
              <Card key={match.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{match.opponent}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Date: {match.date}</p>
                  <p>Location: {match.location}</p>
                  <Button onClick={() => setSelectedMatchId(match.id)}>상세보기</Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <NoMatchesInfo message="등록된 예정 경기가 없습니다." />
          )}
        </TabsContent>
        <TabsContent value="completed">
          <CompletedMatchSection 
            title="완료된 경기"
            matches={matches.filter(match => match.status === 'completed')}
            emptyMessage="완료된 경기가 없습니다."
            canManagePlayerStats={true} 
          />
        </TabsContent>
      </Tabs>

      {selectedMatchId && (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <>
                  <Tabs defaultValue="attendance" className="w-full">
                    <TabsList>
                      <TabsTrigger value="attendance">출석 체크</TabsTrigger>
                      <TabsTrigger value="record">경기 기록</TabsTrigger>
                      <TabsTrigger value="stats">선수 스탯 기록</TabsTrigger>
                    </TabsList>
                    <TabsContent value="attendance">
                      <Card>
                        <CardHeader>
                          <CardTitle>출석 체크</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* Fixed the props based on what PlayerAttendanceForm expects */}
                          <PlayerAttendanceForm 
                            matchId={Number(selectedMatchId)}
                            matchDate={matches.find(m => m.id === Number(selectedMatchId))?.date || ''}
                            opponent={matches.find(m => m.id === Number(selectedMatchId))?.opponent || ''}
                            players={[]}  // This would need real player data
                            isCoach={true}
                          />
                          <AttendanceRecordForm 
                            matchId={Number(selectedMatchId)}
                            matchDate={matches.find(m => m.id === Number(selectedMatchId))?.date || ''}
                            opponent={matches.find(m => m.id === Number(selectedMatchId))?.opponent || ''}
                            players={[]}  // This would need real player data
                            isCoach={true}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="record">
                      <MatchRecordForm match={matches.find(m => m.id === Number(selectedMatchId)) as Match} onSave={handleSaveMatchData} />
                    </TabsContent>
                    <TabsContent value="stats">
                      <PlayerStatsRecorder 
                        matchId={Number(selectedMatchId)}
                        matchDate={matches.find(m => m.id === Number(selectedMatchId))?.date || ''}
                        opponent={matches.find(m => m.id === Number(selectedMatchId))?.opponent || ''}
                        players={[]}  // This would need real player data
                        playerStats={[]}  // This would need real player stats data
                        onStatChange={(playerId, field, value) => {
                          console.log(`Updating ${field} for player ${playerId} to ${value}`);
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                  <Button onClick={() => setSelectedMatchId(null)} className="mt-4">Close</Button>
                </>
              ) : (
                <p>No match selected.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default MatchManagement;
