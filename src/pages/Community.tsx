
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageCircle, Image, Users, Award } from "lucide-react";

interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
  category: 'general' | 'tactics' | 'interview';
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: '지난 주 경기 후기',
      author: '김민수',
      date: '2023-11-20',
      content: '지난 주 경기에서 우리 팀이 보여준 수비 전술은 정말 인상적이었습니다. 특히 후반전에 상대팀의 공격을 효과적으로 차단한 방법에 대해 이야기해보고 싶습니다.',
      likes: 24,
      comments: 8,
      category: 'general'
    },
    {
      id: 2,
      title: '4-3-3 포메이션 분석',
      author: '박지성',
      date: '2023-11-18',
      content: '다음 경기를 위한 4-3-3 포메이션 전술을 분석해보았습니다. 중앙 미드필더의 역할이 특히 중요할 것 같습니다.',
      likes: 32,
      comments: 15,
      category: 'tactics'
    },
    {
      id: 3,
      title: '새로운 팀원 소개 인터뷰',
      author: '이승우',
      date: '2023-11-15',
      content: '이번에 새로 합류한 정우진 선수와의 인터뷰입니다. 그의 축구 경력과 우리 팀에 합류하게 된 계기에 대해 이야기를 나눴습니다.',
      likes: 45,
      comments: 12,
      category: 'interview'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const filterPosts = () => {
    if (activeTab === 'all') return posts;
    return posts.filter(post => post.category === activeTab);
  };

  return (
    <div className="community-container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-gray-600">Connect, share, and engage with your team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-amber-600" />
              Discussion Boards
            </CardTitle>
            <CardDescription>Share thoughts and strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{posts.length}</p>
            <p className="text-sm text-gray-600">Active threads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5 text-pink-600" />
              Gallery
            </CardTitle>
            <CardDescription>Team photos and highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">156</p>
            <p className="text-sm text-gray-600">Photos shared</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-violet-600" />
              Player Recognition
            </CardTitle>
            <CardDescription>MVP votes and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-gray-600">Players recognized</p>
          </CardContent>
        </Card>
      </div>

      <div className="discussion-board mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Discussion Board</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            새 글 작성
          </button>
        </div>

        <div className="tabs mb-6">
          <div className="flex border-b">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('all')}
            >
              전체
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('general')}
            >
              자유게시판
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'tactics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('tactics')}
            >
              전술/전략
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'interview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('interview')}
            >
              인터뷰
            </button>
          </div>
        </div>

        <div className="posts space-y-4">
          {filterPosts().map(post => (
            <Card key={post.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.category === 'general' ? 'bg-blue-100 text-blue-800' :
                    post.category === 'tactics' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {post.category === 'general' ? '자유게시판' :
                     post.category === 'tactics' ? '전술/전략' : '인터뷰'}
                  </span>
                  <span className="ml-3 text-sm text-gray-600">{post.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-4">{post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    By <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="gallery-preview">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Gallery Highlights</h2>
          <button className="text-blue-600 hover:text-blue-800 transition">
            갤러리 전체보기 →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="gallery-item rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Photo {item}</span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <p className="text-sm text-gray-600">2023년 11월 경기</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
