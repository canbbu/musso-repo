import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface PlayerCardProps {
  name: string;
  position: string;
  rating: number;
  pacStat: number;
  shoStat: number;
  pasStat: number;
  driStat: number;
  defStat: number;
  phyStat: number;
  playerImageUrl?: string;
  year?: string;
  nationality?: string;
  teamLogo?: string;
  bootsBrand?: string;
  favoriteTeam?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  position = 'MF',
  rating = 0,
  playerImageUrl,
  year = '2025 MUSSO',
  nationality = '🇰🇷',
  teamLogo,
  bootsBrand,
  favoriteTeam,
}) => {
  
  return (
    <div className="w-64 h-96 relative rounded-xl overflow-hidden shadow-xl">
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black"></div>
      
      {/* 왼쪽 세로 배너 */}
      <div className="absolute left-0 top-0 h-full w-20 bg-red-600 flex flex-col items-center">
        {/* 등급 */}
        <span className="text-5xl font-bold text-white mt-4">{rating * 10}</span>
        
        {/* 포지션 */}
        <span className="text-xl font-bold text-white mt-1">{position}</span>
        
        {/* 국가 */}
        <div className="mt-2 text-2xl">{nationality}</div>
        
        {/* 팀 로고 */}
        {teamLogo ? (
          <img src={teamLogo} alt="Team" className="w-12 h-12 mt-2" />
        ) : (
          <div className="w-12 h-12 mt-2 rounded-full bg-white/30 flex items-center justify-center">
            <span className="text-white text-xs">MUSSO</span>
          </div>
        )}
        {favoriteTeam ? (
          <img src={favoriteTeam} alt="Team" className="w-12 h-12 mt-2" />
        ) : (
          <div className="w-12 h-12 mt-2 rounded-full bg-white/30 flex items-center justify-center">
            <span className="text-white text-xs">MUSSO</span>
          </div>
        )}
        {bootsBrand ? (
          <img src={bootsBrand} alt="Team" className="w-12 h-12 mt-2" />
        ) : (
          <div className="w-12 h-12 mt-2 rounded-full bg-white/30 flex items-center justify-center">
            <span className="text-white text-xs">MUSSO</span>
          </div>
        )}
      </div>
      
      {/* 상단 정보 - 연도 */}
      <div className="absolute top-3 left-24 text-xs text-white">
        {year}
      </div>
      
      {/* 선수 이미지 영역 */}
      <div className="absolute left-24 top-10 right-3 h-56 flex justify-center">
        {playerImageUrl ? (
          <img 
            src={playerImageUrl} 
            alt={name} 
            className="h-full object-contain drop-shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-16 h-16 text-white" />
          </div>
        )}
      </div>
      
      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white h-16 mx-3 rounded-t-md px-3 pt-1 pb-2 flex items-center">
          {/* 선수 이름 */}
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-xs text-gray-500">KOR</span>
              <span className="ml-1 text-lg font-bold text-gray-800">{name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard; 