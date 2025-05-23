import React, { useState, useEffect, useRef } from 'react';
import { User, Zap, Target, Send, Move, Shield, Dumbbell, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import PlayerCard from './PlayerCard';

export interface FlipPlayerCardProps {
  name: string;
  position: string;
  rating: number; // 평균 능력치
  pacStat: number;
  shoStat: number;
  pasStat: number;
  driStat: number;
  defStat: number;
  phyStat: number;
  bootsBrand: string;
  favoriteTeam: string;
  teamLogo?: string;
  playerImageUrl?: string;
}

const FlipPlayerCard: React.FC<FlipPlayerCardProps> = (props) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    // 이벤트 버블링 방지
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  // 인라인 스타일 정의
  const containerStyle: React.CSSProperties = {
    perspective: '1000px',
    width: '256px',
    height: '384px'
  };

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
  };

  const frontStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    cursor: 'pointer'
  };

  const backStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };


  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* 앞면 - 선수 기본 카드 */}
        <div 
          style={frontStyle}
          onClick={handleFlip}
        >
          <PlayerCard {...props} />
        </div>

        {/* 뒷면 - 선수 능력치 상세 */}
        <div 
          style={backStyle}
          onClick={handleFlip}
        >
          {/* 상단 정보 */}
          <div className="pt-4 pb-2 px-4 text-center border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">{props.name}</h3>
            <div className="flex justify-center mt-1">
              <span className="px-3 py-0.5 bg-indigo-600 text-white text-sm font-medium rounded">
                {props.position}
              </span>
            </div>
          </div>
          
          <div className="px-4 space-y-3">
            {/* PAC - 속력 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center text-blue-300">
                  <Zap className="h-4 w-4 mr-1 text-blue-300" />
                  속력 (PAC)
                </span>
                <span className="text-white font-bold">{props.pacStat}</span>
              </div>
              <Progress 
                value={props.pacStat} 
                max={99} 
                className="h-2.5 bg-slate-700" 
                style={{ 
                  '--tw-gradient-from': '#3b82f6', 
                  '--tw-gradient-to': '#60a5fa',
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                } as React.CSSProperties}
              />
            </div>
            
            {/* SHO - 슛 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center text-red-300">
                  <Target className="h-4 w-4 mr-1 text-red-300" />
                  슛 (SHO)
                </span>
                <span className="text-white font-bold">{props.shoStat}</span>
              </div>
              <Progress 
                value={props.shoStat} 
                max={99} 
                className="h-2.5 bg-slate-700" 
                style={{ 
                  '--tw-gradient-from': '#ef4444', 
                  '--tw-gradient-to': '#f87171',
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                } as React.CSSProperties}
              />
            </div>
            
            {/* PAS - 패스 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center text-green-300">
                  <Send className="h-4 w-4 mr-1 text-green-300" />
                  패스 (PAS)
                </span>
                <span className="text-white font-bold">{props.pasStat}</span>
              </div>
              <Progress 
                value={props.pasStat} 
                max={99} 
                className="h-2.5 bg-slate-700" 
                style={{ 
                  '--tw-gradient-from': '#22c55e', 
                  '--tw-gradient-to': '#4ade80',
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                } as React.CSSProperties}
              />
            </div>
            
            {/* DRI - 드리블 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center text-amber-300">
                  <Move className="h-4 w-4 mr-1 text-amber-300" />
                  드리블 (DRI)
                </span>
                <span className="text-white font-bold">{props.driStat}</span>
              </div>
              <Progress 
                value={props.driStat} 
                max={99} 
                className="h-2.5 bg-slate-700" 
                style={{ 
                  '--tw-gradient-from': '#d97706', 
                  '--tw-gradient-to': '#fbbf24',
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                } as React.CSSProperties}
              />
            </div>
            
            {/* DEF - 수비 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center text-purple-300">
                  <Shield className="h-4 w-4 mr-1 text-purple-300" />
                  수비 (DEF)
                </span>
                <span className="text-white font-bold">{props.defStat}</span>
              </div>
              <Progress 
                value={props.defStat} 
                max={99} 
                className="h-2.5 bg-slate-700" 
                style={{ 
                  '--tw-gradient-from': '#a855f7', 
                  '--tw-gradient-to': '#c084fc',
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                } as React.CSSProperties}
              />
            </div>
            
            {/* PHY - 피지컬 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center text-cyan-300">
                  <Dumbbell className="h-4 w-4 mr-1 text-cyan-300" />
                  피지컬 (PHY)
                </span>
                <span className="text-white font-bold">{props.phyStat}</span>
              </div>
              <Progress 
                value={props.phyStat} 
                max={99} 
                className="h-2.5 bg-slate-700" 
                style={{ 
                  '--tw-gradient-from': '#06b6d4', 
                  '--tw-gradient-to': '#22d3ee',
                  background: 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))'
                } as React.CSSProperties}
              />
            </div>
          </div>
          
          <div className="absolute bottom-3 right-3">
            <button
              className="text-white p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 중지
                handleFlip(e);
              }}
              aria-label="카드 뒤집기"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipPlayerCard; 