import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/query-client';
import { AuthProvider } from '@/features/auth/components/AuthContext';
import { SportProvider } from '@/app/sport-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SportProvider>
          {children}
        </SportProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

