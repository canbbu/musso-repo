import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Image, Upload, Tag, Calendar, Home, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface GalleryItem {
  id: number;
  title: string;
  date: string;
  imageUrl: string;
  tags: string[];
  likes: number;
  uploadedBy: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<GalleryItem[]>([
    {
      id: 1,
      title: '10월 친선경기',
      date: '2023-10-15',
      imageUrl: 'placeholder-1.jpg',
      tags: ['경기', '단체사진'],
      likes: 24,
      uploadedBy: '김민수'
    },
    {
      id: 2,
      title: '여름 훈련 캠프',
      date: '2023-08-20',
      imageUrl: 'placeholder-2.jpg',
      tags: ['훈련', '단체사진'],
      likes: 32,
      uploadedBy: '이지훈'
    },
    {
      id: 3,
      title: '축구회 창립기념일',
      date: '2023-07-10',
      imageUrl: 'placeholder-3.jpg',
      tags: ['행사', '단체사진'],
      likes: 45,
      uploadedBy: '박세준'
    },
    {
      id: 4,
      title: '우승 트로피',
      date: '2023-09-05',
      imageUrl: 'placeholder-4.jpg',
      tags: ['트로피', '우승'],
      likes: 56,
      uploadedBy: '정우진'
    },
    {
      id: 5,
      title: '팀 모임',
      date: '2023-11-01',
      imageUrl: 'placeholder-5.jpg',
      tags: ['모임', '친목'],
      likes: 18,
      uploadedBy: '오현우'
    },
    {
      id: 6,
      title: '새 유니폼',
      date: '2023-10-28',
      imageUrl: 'placeholder-6.jpg',
      tags: ['유니폼', '장비'],
      likes: 29,
      uploadedBy: '김영희'
    }
  ]);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const categories = [...new Set(gallery.flatMap(item => item.tags))];
  
  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  };
  
  const months = [...new Set(gallery.map(item => getMonthYear(item.date)))].sort().reverse();
  
  const filteredGallery = gallery.filter(item => {
    const categoryMatch = categoryFilter === 'all' || item.tags.includes(categoryFilter);
    const monthMatch = monthFilter === 'all' || getMonthYear(item.date) === monthFilter;
    return categoryMatch && monthMatch;
  });

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className="gallery-container p-6">
      <a href="/dashboard" className="home-button">
        <Home className="home-icon" size={16} />
        홈으로 돌아가기
      </a>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gallery</h1>
        <p className="text-gray-600">Team photos, videos, and memorable moments</p>
      </div>

      <div className="filters mb-6">
        <div className="filter-section mb-4">
          <h3 className="text-lg font-semibold mb-2">카테고리별 필터</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 rounded ${categoryFilter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCategoryFilter('all')}
            >
              전체
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`px-3 py-1 rounded ${categoryFilter === category ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section mb-4">
          <h3 className="text-lg font-semibold mb-2">월별 필터</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 rounded ${monthFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setMonthFilter('all')}
            >
              전체 기간
            </button>
            {months.map(month => {
              const [year, monthNum] = month.split('-');
              return (
                <button 
                  key={month}
                  className={`px-3 py-1 rounded ${monthFilter === month ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setMonthFilter(month)}
                >
                  {year}년 {monthNum}월
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">총 {filteredGallery.length}개의 항목</p>
          <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            <Upload className="mr-2 h-4 w-4" />
            사진 업로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGallery.length > 0 ? (
          filteredGallery.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition cursor-pointer">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.date}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    By {item.uploadedBy}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {item.likes}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">해당 필터에 맞는 이미지가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">하이라이트 영상</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(item => (
            <Card key={`video-${item}`} className="overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-64 bg-gray-300 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">2023 시즌 하이라이트 - {item}부</h3>
                <p className="text-sm text-gray-600 mt-1">2023년 10월 - 최고의 골 모음</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <button onClick={toggleMobileNav} className="fixed bottom-4 right-4 z-50 bg-green-500 text-white rounded-full p-3 shadow-lg md:hidden">
        <Menu size={24} />
      </button>
      
      <div className={`mobile-sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <h3>축구회</h3>
          <button className="close-sidebar" onClick={toggleMobileNav}>
            <X size={20} />
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li><a href="/dashboard">홈</a></li>
          <li><a href="/matches">경기</a></li>
          <li><a href="/stats">기록</a></li>
          <li><a href="/community">커뮤니티</a></li>
          <li><a href="/gallery" className="active">갤러리</a></li>
          <li><a href="/finance">회계</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Gallery;
