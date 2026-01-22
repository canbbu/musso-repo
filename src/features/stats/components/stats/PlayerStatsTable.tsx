import React from 'react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { PlayerStats } from '@/types/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";


interface PlayerStatsTableProps {
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
  isLoading: boolean;
  isFromTactics?: boolean;
  canEditStats?: boolean;
  isEditPeriodExpired?: boolean;
  isReadOnly?: boolean;
  isPasswordUnlocked?: boolean;
}

const PlayerStatsTable = ({ 
  playerStats, 
  onStatChange, 
  isLoading,
  isFromTactics = false,
  canEditStats = true,
  isEditPeriodExpired = false,
  isReadOnly = false,
  isPasswordUnlocked = false
}: PlayerStatsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>선수명</TableHead>
          <TableHead>출석</TableHead>
          <TableHead>경기 득점</TableHead>
          <TableHead>경기 어시스트</TableHead>
          <TableHead>철벽지수</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* 참석자 섹션 */}
        {playerStats.some(stat => stat.attended) && (
          <>
            <TableRow>
              <TableCell colSpan={5} className="bg-green-50 font-semibold text-green-700">
                참석자
              </TableCell>
            </TableRow>
            {playerStats
              .filter(stat => stat.attended)
              .map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={stat.attended}
                      onCheckedChange={(checked) => onStatChange(stat.id, 'attended', checked)}
                      disabled={isEditPeriodExpired || isReadOnly || isFromTactics}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      max="99"
                      maxLength={2}
                      value={stat.goals === 0 ? "" : stat.goals} 
                      onChange={(e) => {
                        // 작전판에서 온 경우 득점 입력 불가
                        if (isFromTactics) return;
                        // 수정 기한이 지난 경우 (비밀번호로 해제 가능)
                        if (isEditPeriodExpired && !isPasswordUnlocked) return;
                        // 읽기 전용인 경우
                        if (isReadOnly) return;
                        
                        // 최대 2자리까지만 허용
                        let value = e.target.value;
                        if (value.length > 2) value = value.slice(0, 2);
                        onStatChange(stat.id, 'goals', value === "" ? 0 : Number(value));
                      }}
                      className={`w-16 h-8 ${isFromTactics || (isEditPeriodExpired && !isPasswordUnlocked) || isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={isFromTactics || (isEditPeriodExpired && !isPasswordUnlocked) || isReadOnly}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      max="99"
                      maxLength={2}
                      value={stat.assists === 0 ? "" : stat.assists} 
                      onChange={(e) => {
                        // 작전판에서 온 경우 어시스트 입력 불가
                        if (isFromTactics) return;
                        // 수정 기한이 지난 경우 (비밀번호로 해제 가능)
                        if (isEditPeriodExpired && !isPasswordUnlocked) return;
                        // 읽기 전용인 경우
                        if (isReadOnly) return;
                        
                        let value = e.target.value;
                        if (value.length > 2) value = value.slice(0, 2);
                        onStatChange(stat.id, 'assists', value === "" ? 0 : Number(value));
                      }}
                      className={`w-16 h-8 ${isFromTactics || (isEditPeriodExpired && !isPasswordUnlocked) || isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={isFromTactics || (isEditPeriodExpired && !isPasswordUnlocked) || isReadOnly}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      max="99"
                      maxLength={2}
                      value={stat.cleansheet === 0 ? "" : (stat.cleansheet || "")} 
                      onChange={(e) => {
                        // 작전판에서 온 경우 철벽지수 입력 불가 (작전판에서 별도로 입력)
                        if (isFromTactics) return;
                        // 수정 기한이 지난 경우 (비밀번호로 해제 가능)
                        if (isEditPeriodExpired && !isPasswordUnlocked) return;
                        // 읽기 전용인 경우
                        if (isReadOnly) return;
                        
                        let value = e.target.value;
                        if (value.length > 2) value = value.slice(0, 2);
                        onStatChange(stat.id, 'cleansheet', value === "" ? 0 : Number(value));
                      }}
                      className={`w-16 h-8 ${isFromTactics || (isEditPeriodExpired && !isPasswordUnlocked) || isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={isFromTactics || (isEditPeriodExpired && !isPasswordUnlocked) || isReadOnly}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </>
        )}
        
        {/* 불참자 섹션 */}
        {playerStats.some(stat => !stat.attended && stat.attendanceStatus === 'not_attending') && (
          <>
            <TableRow>
              <TableCell colSpan={5} className="bg-red-50 font-semibold text-red-700">
                불참
              </TableCell>
            </TableRow>
            {playerStats
              .filter(stat => !stat.attended && stat.attendanceStatus === 'not_attending')
              .map((stat) => (
                <TableRow key={stat.id} className="opacity-60">
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={stat.attended}
                      onCheckedChange={(checked) => onStatChange(stat.id, 'attended', checked)}
                      disabled={isEditPeriodExpired || isReadOnly || isFromTactics}
                    />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
          </>
        )}
        
        {/* 미정 섹션 */}
        {playerStats.some(stat => stat.attendanceStatus === 'pending') && (
          <>
            <TableRow>
              <TableCell colSpan={5} className="bg-yellow-50 font-semibold text-yellow-700">
                미정
              </TableCell>
            </TableRow>
            {playerStats
              .filter(stat => stat.attendanceStatus === 'pending')
              .map((stat) => (
                <TableRow key={stat.id} className="opacity-75">
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={stat.attended}
                      onCheckedChange={(checked) => onStatChange(stat.id, 'attended', checked)}
                      disabled={isEditPeriodExpired || isReadOnly || isFromTactics}
                    />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default PlayerStatsTable;
