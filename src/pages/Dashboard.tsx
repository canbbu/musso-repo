import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { Menu, X, Home, Calendar, Trophy, Users, Image, DollarSign } from 'lucide-react';

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
}

const Dashboard = () => {
  const [userRole] = useState<string>('member');
  const [userName] = useState('방문자');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  
  const [upcomingMatches] = useState<UpcomingMatch[]>([
    { id: 1, date: '2023-11-25 19:00', location: '서울 마포구 풋살장', opponent: 'FC 서울' },
    { id: 2, date: '2023-12-02 18:00', location: '강남 체육공원', opponent: '강남 유나이티드' },
  ]);
  
  const [announcements] = useState<Announcement[]>([
    { 
      id: 1, 
      title: '이번 주 경기 공지', 
      date: '2023-11-20', 
      content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
      author: '김운영',
      updatedAt: '2023-11-20 14:30'
    },
    { 
      id: 2, 
      title: '연말 모임 안내', 
      date: '2023-11-18', 
      content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
      author: '박감독',
      updatedAt: '2023-11-18 10:15'
    },
  ]);

  const hasPermission = (feature: string): boolean => {
    return true;
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header sticky">
        <div className="container">
          <nav className="navbar">
            <a href="/" className="navbar-brand">축구회</a>
            <button className="mobile-nav-toggle" onClick={toggleMobileNav}>
              <Menu size={24} />
            </button>
            <ul className="navbar-nav">
              <li><a href="/dashboard" className="nav-link active">홈</a></li>
              <li><a href="/matches" className="nav-link">경기</a></li>
              <li><a href="/stats" className="nav-link">기록</a></li>
              <li><a href="/gallery" className="nav-link">갤러리</a></li>
              <li><a href="/finance" className="nav-link">회계</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <div className={`mobile-sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <h3>축구회</h3>
          <button className="close-sidebar" onClick={toggleMobileNav}>
            <X size={20} />
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li><a href="/dashboard" className="active">홈</a></li>
          <li><a href="/matches">경기</a></li>
          <li><a href="/stats">기록</a></li>
          <li><a href="/gallery">갤러리</a></li>
          <li><a href="/finance">회계</a></li>
        </ul>
      </div>
      
      <main className="dashboard-main container">
        <div className="welcome-section">
          <h1>안녕하세요, {userName}님!</h1>
          <p className="welcome-subtitle">축구회 관리 시스템에 오신 것을 환영합니다.</p>
          <div className="user-role-badge">
            <span className="role member">방문자</span>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card upcoming-matches">
            <h2><Calendar size={20} /> 다가오는 경기</h2>
            {upcomingMatches.length > 0 ? (
              <ul className="match-list">
                {upcomingMatches.map(match => (
                  <li key={match.id} className="match-item">
                    <div className="match-date">
                      <span className="day">{new Date(match.date).toLocaleDateString('ko-KR', { day: '2-digit' })}</span>
                      <span className="month">{new Date(match.date).toLocaleDateString('ko-KR', { month: 'short' })}</span>
                    </div>
                    <div className="match-details">
                      <h3>{match.opponent || '내부 경기'}</h3>
                      <p className="match-location">{match.location}</p>
                      <p className="match-time">{new Date(match.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button className="btn btn-primary">참석</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">예정된 경기가 없습니다.</p>
            )}
            <a href="/matches" className="view-all">모든 경기 보기</a>
          </div>
          
          <div className="dashboard-card announcements">
            <h2><Users size={20} /> 공지사항</h2>
            {announcements.length > 0 ? (
              <ul className="announcement-list">
                {announcements.map(announcement => (
                  <li key={announcement.id} className="announcement-item">
                    <h3>{announcement.title}</h3>
                    <div className="announcement-meta">
                      <p className="announcement-date">{announcement.date}</p>
                      <p className="announcement-author">작성자: {announcement.author}</p>
                    </div>
                    <p className="announcement-content">{announcement.content}</p>
                    {announcement.updatedAt && (
                      <p className="announcement-updated">최종 수정: {announcement.updatedAt}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">공지사항이 없습니다.</p>
            )}
            <a href="/gallery" className="view-all">모든 공지 보기</a>
          </div>
          
          <div className="dashboard-card quick-actions">
            <h2><Trophy size={20} /> 바로가기</h2>
            <div className="action-buttons">
              <a href="/stats" className="action-button stats-button">
                <span className="action-icon">📊</span>
                <span className="action-text">통계 확인</span>
              </a>
              <a href="/gallery" className="action-button gallery-button">
                <span className="action-icon">🖼️</span>
                <span className="action-text">갤러리</span>
              </a>
              <a href="/matches" className="action-button new-match-button">
                <span className="action-icon">🏆</span>
                <span className="action-text">경기 관리</span>
              </a>
              <a href="/finance" className="action-button finance-button">
                <span className="action-icon">💰</span>
                <span className="action-text">회계 관리</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <div className="container">
          <p>&copy; 2023 축구회 관리 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
