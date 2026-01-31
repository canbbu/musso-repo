import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Circle } from 'lucide-react';

/** 풋살 전용 페이지 (현재 빈 페이지) */
export default function FutsalPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">풋살 전용 페이지입니다.</p>
        <Button
          variant="outline"
          className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
          onClick={() => navigate('/')}
        >
          <Circle className="h-4 w-4 mr-2" />
          축구 페이지로 이동
        </Button>
      </div>
    </Layout>
  );
}
