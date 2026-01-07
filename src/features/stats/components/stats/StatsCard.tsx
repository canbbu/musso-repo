
import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Save, Users, Edit3 } from 'lucide-react';
import PlayerStatsTable from './PlayerStatsTable';
import { PlayerStats, StatsCardProps } from '@/types/dashboard';


const StatsCard = ({ 
  matchDate, 
  opponent, 
  playerStats, 
  onStatChange, 
  onSave, 
  isLoading,
  isFromTactics = false,
  canEditStats = true,
  isEditPeriodExpired = false,
  onToggleStatsEditing,
  isReadOnly = false,
  isPasswordUnlocked = false
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              {isReadOnly ? '선수 기록 확인' : '선수 기록 입력'}
            </CardTitle>
            <CardDescription>
              선택된 이벤트: {matchDate}  {opponent}
              {isFromTactics && !canEditStats && (
                <span className="block text-sm text-orange-600 mt-1">
                  ⚠️ 작전판에서 입력된 득점/어시스트는 수정할 수 없습니다.
                </span>
              )}
              {isFromTactics && (
                <span className="block text-sm text-blue-600 mt-1">
                  📋 작전판에서 온 경우 출석, 득점, 어시스트는 변경할 수 없고 평점만 입력 가능합니다.
                </span>
              )}
              {isEditPeriodExpired && (
                <span className="block text-sm text-red-600 mt-1">
                  ⚠️ 경기 후 3일이 지나 수정이 제한됩니다.
                </span>
              )}
              {isPasswordUnlocked && (
                <span className="block text-sm text-green-600 mt-1">
                  🔓 비밀번호로 수정 권한이 활성화되었습니다.
                </span>
              )}
              {isReadOnly && (
                <span className="block text-sm text-blue-600 mt-1">
                  📖 읽기 전용 모드입니다.
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PlayerStatsTable
          playerStats={playerStats}
          onStatChange={onStatChange}
          isLoading={isLoading}
          isFromTactics={isFromTactics}
          canEditStats={canEditStats}
          isEditPeriodExpired={isEditPeriodExpired}
          isReadOnly={isReadOnly}
          isPasswordUnlocked={isPasswordUnlocked}
        />
        
        {!isLoading && !isReadOnly && (
          <div className="flex justify-end mt-6">
            <Button onClick={onSave} className="flex items-center" disabled={isEditPeriodExpired}>
              <Save className="mr-2 h-4 w-4" />
              기록 저장
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
