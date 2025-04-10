import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerAttendanceForm } from '@/components/match/PlayerAttendanceForm';
import { AttendanceRecordForm } from '@/components/match/AttendanceRecordForm';
import { MatchRecordForm } from '@/components/match/MatchRecordForm';
import { CompletedMatchSection } from '@/components/match/CompletedMatchSection';
import { NoMatchesInfo } from '@/components/match/NoMatchesInfo';
import { PlayerStatsRecorder } from '@/components/match/PlayerStatsRecorder';
import { useMatches } from '@/hooks/use-match-data';
import { Match } from '@/hooks/use-match-data'; // Import Match type

// Define types for attendance status
type AttendanceStatus = 'present' | 'absent' | 'late';

// Define a type for the attendance record
interface AttendanceRecord {
  playerId: string;
  status: AttendanceStatus;
}

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
            <NoMatchesInfo />
          )}
        </TabsContent>
        <TabsContent value="completed">
          <CompletedMatchSection />
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
                          <PlayerAttendanceForm matchId={selectedMatchId} />
                          <AttendanceRecordForm matchId={selectedMatchId} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="record">
                      <MatchRecordForm match={matches.find(m => m.id === selectedMatchId)} onSave={handleSaveMatchData} />
                    </TabsContent>
                    <TabsContent value="stats">
                      <PlayerStatsRecorder matchId={selectedMatchId} />
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
