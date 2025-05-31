import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Goal, Trophy, CalendarCheck, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { RankingTab, Player } from '@/hooks/use-player-rankings';

interface RankingTableProps {
  activeTab: RankingTab;
  players: Player[];
}

const RankingTable = ({ activeTab, players }: RankingTableProps) => {
  const getLabelByTab = () => {
    switch (activeTab) {
      case 'goals':
        return '득점';
      case 'assists':
        return '어시스트';
      case 'attendance':
        return '출석률';
      case 'rating':
        return '평점';
      default:
        return '득점';
    }
  };
  
  const getIconByTab = () => {
    switch (activeTab) {
      case 'goals':
        return <Goal className="text-green-500 h-5 w-5" />;
      case 'assists':
        return <Trophy className="text-blue-500 h-5 w-5" />;
      case 'attendance':
        return <CalendarCheck className="text-yellow-500 h-5 w-5" />;
      case 'rating':
        return <Star className="text-orange-500 h-5 w-5" />;
      default:
        return <Goal className="text-green-500 h-5 w-5" />;
    }
  };

  const getValueByTab = (player: Player) => {
    switch (activeTab) {
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'attendance':
        return `${player.attendance}%`;
      case 'rating':
        return player.rating;
      default:
        return player.goals;
    }
  };

  // 실제 순위를 계산하는 함수
  const calculateRank = (playerIndex: number): number => {
    const currentPlayer = players[playerIndex];
    const currentValue = (() => {
      switch (activeTab) {
        case 'goals':
          return currentPlayer.goals;
        case 'assists':
          return currentPlayer.assists;
        case 'attendance':
          return currentPlayer.attendance;
        case 'rating':
          return currentPlayer.rating;
        default:
          return currentPlayer.goals;
      }
    })();

    // 현재 플레이어와 같은 수치를 가진 첫 번째 플레이어의 인덱스를 찾기
    let firstSameValueIndex = playerIndex;
    for (let i = 0; i < playerIndex; i++) {
      const comparePlayer = players[i];
      const compareValue = (() => {
        switch (activeTab) {
          case 'goals':
            return comparePlayer.goals;
          case 'assists':
            return comparePlayer.assists;
          case 'attendance':
            return comparePlayer.attendance;
          case 'rating':
            return comparePlayer.rating;
          default:
            return comparePlayer.goals;
        }
      })();

      if (compareValue === currentValue) {
        firstSameValueIndex = i;
        break;
      }
    }

    return firstSameValueIndex + 1;
  };

  // 순위에 따른 배경색 결정
  const getRankBackground = (rank: number): string => {
    if (rank <= 3) {
      return 'bg-gray-50';
    }
    return '';
  };

  return (
    <Card className="shadow">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          {getLabelByTab()} 순위
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">순위</TableHead>
              <TableHead>선수</TableHead>
              <TableHead>포지션</TableHead>
              <TableHead>출전 경기 수</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  {getIconByTab()}
                  <span className="ml-1">{getLabelByTab()}</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => {
              const rank = calculateRank(index);
              return (
                <TableRow key={player.id} className={getRankBackground(rank)}>
                  <TableCell className="text-center font-semibold">
                    {rank === 1 ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full">
                        1
                      </div>
                    ) : rank === 2 ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full">
                        2
                      </div>
                    ) : rank === 3 ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-700 text-white rounded-full">
                        3
                      </div>
                    ) : (
                      rank
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.games}경기</TableCell>
                  <TableCell className="text-center font-bold">
                    {getValueByTab(player)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RankingTable;
