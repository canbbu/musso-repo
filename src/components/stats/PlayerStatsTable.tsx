import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
  attendanceStatus: string;
}

interface PlayerStatsTableProps {
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
  isLoading: boolean;
}

const PlayerStatsTable = ({ playerStats, onStatChange, isLoading }: PlayerStatsTableProps) => {
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
          <TableHead>득점</TableHead>
          <TableHead>어시스트</TableHead>
          <TableHead>평점</TableHead>
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
                        // 최대 2자리까지만 허용
                        let value = e.target.value;
                        if (value.length > 2) value = value.slice(0, 2);
                        onStatChange(stat.id, 'goals', value === "" ? 0 : Number(value));
                      }}
                      className="w-16 h-8"
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
                        let value = e.target.value;
                        if (value.length > 2) value = value.slice(0, 2);
                        onStatChange(stat.id, 'assists', value === "" ? 0 : Number(value));
                      }}
                      className="w-16 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0" 
                      max="10" 
                      step="0.1"
                      maxLength={3}
                      value={stat.rating === 0 ? "" : stat.rating} 
                      onChange={(e) => {
                        // 입력값 제한 적용
                        let value = parseFloat(e.target.value);
                        
                        // 값이 10보다 크면 10으로 고정
                        if (value > 10) value = 10;
                        
                        // 빈 문자열은 0으로 처리
                        if (e.target.value === "") value = 0;
                        
                        // 소수점 첫째 자리까지만 유지 (예: 9.87 -> 9.8)
                        value = Math.round(value * 10) / 10;
                        
                        onStatChange(stat.id, 'rating', value);
                      }}
                      className="w-20 h-8"
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
