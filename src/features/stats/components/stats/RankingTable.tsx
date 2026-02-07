import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Award, Goal, Trophy, CalendarCheck, Shield, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import type { RankingTab, Player } from '@/features/stats/types/stats.types';

/** 카테고리별: 해당 데이터가 있는 선수만 표시. 파워랭킹은 포인트 있는 선수만, 출석률은 전체 회원 */
const getDisplayPlayersByTab = (activeTab: RankingTab, players: Player[]): Player[] => {
  switch (activeTab) {
    case 'power':
      return players.filter((p) => (p.powerScore ?? 0) > 0); // 파워랭킹: 포인트 있는 선수만
    case 'goals':
      return players.filter((p) => (Number(p.goals) || 0) > 0);
    case 'assists':
      return players.filter((p) => (Number(p.assists) || 0) > 0);
    case 'attendance':
      return players; // 출석률: 모든 회원
    case 'cleansheet':
      return players.filter((p) => (Number(p.cleansheet) || 0) > 0);
    default:
      return players;
  }
};

interface RankingTableProps {
  activeTab: RankingTab;
  players: Player[];
  /** 전달 기간 동일 탭 랭킹(순서 배열). 있으면 전달 대비 컬럼 표시 */
  prevRanking?: Player[];
}

const RankingTable = ({ activeTab, players, prevRanking }: RankingTableProps) => {
  const displayPlayers = useMemo(
    () => getDisplayPlayersByTab(activeTab, players),
    [activeTab, players]
  );

  const getLabelByTab = () => {
    switch (activeTab) {
      case 'power':
        return '파워 랭킹';
      case 'goals':
        return '득점';
      case 'assists':
        return '어시스트';
      case 'attendance':
        return '출석률';
      case 'cleansheet':
        return '철벽지수';
      default:
        return '파워 랭킹';
    }
  };
  
  const getIconByTab = () => {
    switch (activeTab) {
      case 'power':
        return <Zap className="text-amber-500 h-5 w-5" />;
      case 'goals':
        return <Goal className="text-green-500 h-5 w-5" />;
      case 'assists':
        return <Trophy className="text-blue-500 h-5 w-5" />;
      case 'attendance':
        return <CalendarCheck className="text-yellow-500 h-5 w-5" />;
      case 'cleansheet':
        return <Shield className="text-purple-500 h-5 w-5" />;
      default:
        return <Zap className="text-amber-500 h-5 w-5" />;
    }
  };

  const getValueByTab = (player: Player) => {
    switch (activeTab) {
      case 'power':
        return `${player.powerScore ?? 0} pt`;
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'attendance':
        return `${player.attendance}%`;
      case 'cleansheet':
        return `${player.cleansheet || 0}경기`;
      default:
        return `${player.powerScore ?? 0} pt`;
    }
  };

  // pt 비교 시 부동소수 오차 방지 (소수 둘째자리로 반올림)
  const powerScoreForTie = (score: number | undefined): number =>
    Math.round((score ?? 0) * 100) / 100;

  // 실제 순위를 계산하는 함수
  const calculateRank = (playerIndex: number): number => {
    const currentPlayer = displayPlayers[playerIndex];
    const currentValue = (() => {
      switch (activeTab) {
        case 'power':
          return powerScoreForTie(currentPlayer.powerScore);
        case 'goals':
          return currentPlayer.goals;
        case 'assists':
          return currentPlayer.assists;
        case 'attendance':
          return currentPlayer.attendance;
        case 'cleansheet':
          return currentPlayer.cleansheet || 0;
        default:
          return currentPlayer.powerScore ?? 0;
      }
    })();

    // 현재 플레이어와 같은 수치를 가진 첫 번째 플레이어의 인덱스를 찾기
    let firstSameValueIndex = playerIndex;
    for (let i = 0; i < playerIndex; i++) {
      const comparePlayer = displayPlayers[i];
      const compareValue = (() => {
        switch (activeTab) {
          case 'power':
            return powerScoreForTie(comparePlayer.powerScore);
          case 'goals':
            return comparePlayer.goals;
          case 'assists':
            return comparePlayer.assists;
          case 'attendance':
            return comparePlayer.attendance;
          case 'cleansheet':
            return comparePlayer.cleansheet || 0;
          default:
            return comparePlayer.powerScore ?? 0;
        }
      })();

      if (compareValue === currentValue) {
        firstSameValueIndex = i;
        break;
      }
    }

    return firstSameValueIndex + 1;
  };

  // 전달 랭킹에서 동점이면 같은 순위로 부여 (현재 랭킹과 동일한 규칙)
  const getPrevRankWithTie = (prevIndex: number): number => {
    if (!prevRanking?.length || activeTab !== 'power') return prevIndex + 1;
    const currentScore = powerScoreForTie(prevRanking[prevIndex].powerScore);
    let firstSameIndex = prevIndex;
    for (let i = 0; i < prevIndex; i++) {
      if (powerScoreForTie(prevRanking[i].powerScore) === currentScore) {
        firstSameIndex = i;
        break;
      }
    }
    return firstSameIndex + 1;
  };

  // 전달 순위 → 전달 대비 변동 (양수: 순위 상승, 음수: 하락, null: 신규)
  const getRankChange = (playerId: string, currentRank: number): number | null => {
    if (!prevRanking?.length) return null;
    const prevIndex = prevRanking.findIndex((p) => p.id === playerId);
    if (prevIndex < 0) return null; // 신규
    const prevRank = getPrevRankWithTie(prevIndex);
    return prevRank - currentRank; // 올랐으면 양수
  };

  // 동점이면 같은 순위 부여 (calculateRank 사용)
  const getDisplayRank = (playerIndex: number): number => calculateRank(playerIndex);

  // 순위에 따른 배경색 결정
  const getRankBackground = (rank: number): string => {
    if (rank <= 3) {
      return 'bg-gray-50';
    }
    return '';
  };

  // 메달 표시 컴포넌트
  const MedalBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full shadow-lg border-2 border-yellow-300">
          <span className="font-bold text-lg">🥇</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-full shadow-lg border-2 border-gray-200">
          <span className="font-bold text-lg">🥈</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-full shadow-lg border-2 border-amber-400">
          <span className="font-bold text-lg">🥉</span>
        </div>
      );
    }
    return (
      <span className="text-gray-600 font-semibold">{rank}</span>
    );
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
              {prevRanking && prevRanking.length > 0 && (
                <TableHead className="w-[90px] text-center">전달 대비</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPlayers.map((player, index) => {
              const rank = getDisplayRank(index);
              const change = getRankChange(player.id, rank);
              return (
                <TableRow key={player.id} className={getRankBackground(rank)}>
                  <TableCell className="text-center">
                    <MedalBadge rank={rank} />
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.games}경기</TableCell>
                  <TableCell className="text-center font-bold">
                    {getValueByTab(player)}
                  </TableCell>
                  {prevRanking && prevRanking.length > 0 && (
                    <TableCell className="text-center">
                      {change === null ? (
                        <span className="text-muted-foreground text-sm">신규</span>
                      ) : change > 0 ? (
                        <span className="text-green-600 font-medium">↑{change}</span>
                      ) : change < 0 ? (
                        <span className="text-red-600 font-medium">↓{Math.abs(change)}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  )}
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
