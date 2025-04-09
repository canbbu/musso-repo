
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Trophy, Award, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Player {
  id: string;
  name: string;
  votes: number;
  hasVoted: boolean;
}

interface MvpVotingCardProps {
  matchId: number;
  matchDate: string;
  opponent: string;
  result?: 'win' | 'loss' | 'draw';
  score?: string;
}

const MvpVotingCard = ({ matchId, matchDate, opponent, result, score }: MvpVotingCardProps) => {
  const { toast } = useToast();
  const { userName } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  useEffect(() => {
    // In a real app, we would fetch data from an API
    // For this example, we'll use mock data
    const mockPlayers: Player[] = [
      { id: 'player1', name: '김선수', votes: 3, hasVoted: false },
      { id: 'player2', name: '이공격수', votes: 5, hasVoted: false },
      { id: 'player3', name: '박수비', votes: 2, hasVoted: false },
      { id: 'player4', name: '정미드필더', votes: 1, hasVoted: false },
      { id: 'player5', name: '최골키퍼', votes: 4, hasVoted: false },
    ];
    
    setPlayers(mockPlayers);
    
    // Set a 24-hour voting period from the match time
    const matchTime = new Date(matchDate).getTime();
    const now = new Date().getTime();
    const votingDeadline = matchTime + (24 * 60 * 60 * 1000); // 24 hours after match
    
    if (now < votingDeadline) {
      setTimeLeft(Math.floor((votingDeadline - now) / (1000 * 60 * 60))); // Hours left
      
      // Set a timer to update the time left
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const hoursLeft = Math.floor((votingDeadline - currentTime) / (1000 * 60 * 60));
        setTimeLeft(hoursLeft);
        
        if (hoursLeft <= 0) {
          clearInterval(timer);
        }
      }, 60000); // Update every minute
      
      return () => clearInterval(timer);
    } else {
      setTimeLeft(0);
    }
  }, [matchId, matchDate]);
  
  const handleVote = (playerId: string) => {
    if (hasUserVoted) return;
    
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, votes: player.votes + 1, hasVoted: true }
          : player
      )
    );
    setHasUserVoted(true);
    
    // In a real app, we would send this vote to an API
    
    toast({
      title: "투표 완료",
      description: `${players.find(p => p.id === playerId)?.name}에게 MVP 투표를 하셨습니다.`,
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Sort players by vote count
  const sortedPlayers = [...players].sort((a, b) => b.votes - a.votes);
  const topPlayer = sortedPlayers[0];
  
  // Check if voting period has ended
  const votingEnded = timeLeft !== null && timeLeft <= 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            <span>{formatDate(matchDate)} MVP 투표</span>
          </div>
          {score && (
            <span className={`px-3 py-1 rounded-full text-sm ${
              result === 'win' 
                ? 'bg-green-100 text-green-800' 
                : result === 'loss' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {score}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-gray-500">vs {opponent}</p>
      </CardHeader>
      <CardContent>
        {votingEnded ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-3">
              <Award className="w-16 h-16 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-1">MVP - {topPlayer.name}</h3>
            <p className="text-gray-600">{topPlayer.votes}표</p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">투표가 종료되었습니다. 투표에 참여해주셔서 감사합니다!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm">
                {timeLeft !== null && (
                  <span className="font-semibold text-blue-600">투표 종료까지 {timeLeft}시간 남았습니다.</span>
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                오늘 경기에서 가장 활약한 선수를 선택해주세요.
              </p>
            </div>
            
            <div className="space-y-2">
              {sortedPlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{player.votes}표</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleVote(player.id)}
                    disabled={hasUserVoted}
                    className={player.hasVoted ? "bg-blue-50" : ""}
                  >
                    {player.hasVoted ? (
                      <>
                        <ThumbsUp className="h-4 w-4 mr-1 text-blue-500" />
                        투표함
                      </>
                    ) : (
                      "투표하기"
                    )}
                  </Button>
                </div>
              ))}
            </div>
            
            {hasUserVoted && (
              <p className="text-sm text-center mt-4 text-gray-600">
                이미 투표하셨습니다. 결과는 24시간 후에 확인할 수 있습니다.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MvpVotingCard;
