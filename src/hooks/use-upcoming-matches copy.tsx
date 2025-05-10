
import { useState } from 'react';
import { UpcomingMatch } from '@/types/dashboard';
import { getMockUpcomingMatches } from '@/utils/mock-data';

export function useUpcomingMatches() {
  const [upcomingMatches] = useState<UpcomingMatch[]>(getMockUpcomingMatches());
  
  return { upcomingMatches };
}
