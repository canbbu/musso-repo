
import { Announcement, Player, UpcomingMatch } from '@/types/dashboard';
import { getCurrentDate, getTomorrowDate } from './date-helpers';

/**
 * Generate sample players for mock data
 */
export const getSamplePlayers = (): Player[] => [
  { id: "player1", name: "김선수" },
  { id: "player2", name: "이공격수" },
  { id: "player3", name: "박수비" },
  { id: "player4", name: "정미드필더" },
  { id: "player5", name: "최골키퍼" },
  { id: "player6", name: "강수비수" },
  { id: "player7", name: "장미드필더" },
];

/**
 * Get mock announcement data
 */
export const getMockAnnouncements = (): Announcement[] => [
  { 
    id: 1, 
    type: 'notice',
    title: '이번 주 경기 공지', 
    date: '2023-11-20', 
    content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
    author: '김운영',
    updatedAt: '2023-11-20 14:30'
  },
  { 
    id: 2, 
    type: 'notice',
    title: '연말 모임 안내', 
    date: '2023-11-18', 
    content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
    author: '박감독',
    updatedAt: '2023-11-18 10:15'
  },
  { 
    id: 3, 
    type: 'match',
    title: 'FC 서울과의 경기', 
    date: '2023-11-25', 
    content: '이번 경기는 중요한 라이벌전입니다. 많은 참여 부탁드립니다.',
    author: '박감독'
  },
];

/**
 * Get mock upcoming matches data
 */
export const getMockUpcomingMatches = (): UpcomingMatch[] => {
  const todayFormatted = getCurrentDate();
  const tomorrowFormatted = getTomorrowDate();
  const samplePlayers = getSamplePlayers();
  
  return [
    { 
      id: 1, 
      date: `${todayFormatted} 19:00`, 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울',
      attending: 3,
      notAttending: 2, 
      pending: 2,
      status: 'scheduled',
      attendingPlayers: [
        samplePlayers[0],
        samplePlayers[1],
        samplePlayers[2]
      ],
      notAttendingPlayers: [
        samplePlayers[3],
        samplePlayers[4]
      ],
      pendingPlayers: [
        samplePlayers[5],
        samplePlayers[6]
      ]
    },
    { 
      id: 2, 
      date: `${tomorrowFormatted} 18:00`, 
      location: '강남 체육공원', 
      opponent: '강남 유나이티드',
      attending: 2,
      notAttending: 3,
      pending: 2,
      status: 'cancelled',
      attendingPlayers: [
        samplePlayers[0],
        samplePlayers[5]
      ],
      notAttendingPlayers: [
        samplePlayers[1],
        samplePlayers[2],
        samplePlayers[3]
      ],
      pendingPlayers: [
        samplePlayers[4],
        samplePlayers[6]
      ]
    },
  ];
};
