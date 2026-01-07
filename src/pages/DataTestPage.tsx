// src/pages/DataTestPage.tsx
import React from 'react';
import { SupabaseDataTester } from '@/components/SupabaseDataTester';
import Layout from '@/shared/components/layout/Layout';

export default function DataTestPage() {
  return (
    <Layout>
      <SupabaseDataTester />
    </Layout>
  );
}