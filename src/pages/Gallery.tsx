import React from 'react';
import Layout from '@/components/Layout';

// This is a placeholder for the actual Gallery page content
const Gallery = () => {
  return (
    <Layout>
      <div className="gallery-container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">갤러리</h1>
          <p className="text-gray-600">팀의 사진과 동영상을 확인합니다.</p>
        </div>
        
        {/* Gallery content will go here */}
        <div className="text-center py-8">
          <p className="text-gray-400">갤러리 내용이 준비중입니다.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
