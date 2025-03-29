
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('사용자');
  const navigate = useNavigate();
  
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([
    { id: 1, date: '2023-11-25 19:00', location: '서울 마포구 풋살장', opponent: 'FC 서울' },
    { id: 2, date: '2023-12-02 18:00', location: '강남 체육공원', opponent: '강남 유나이티드' },
  ]);
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([
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
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!isAuthenticated || !role) {
      navigate('/login');
      return;
    }
    
    setUserRole(role);
    
    if (name) {
      setUserName(name);
    }
  }, [navigate]);

  // Function to check if user has permission for a specific feature
  const hasPermission = (feature: string): boolean => {
    if (!userRole) return false;
    
    switch (feature) {
      case 'finance':
        return ['executive', 'accountant'].includes(userRole);
      case 'matchManagement':
        return ['executive', 'coach'].includes(userRole);
      case 'stats':
        return ['executive', 'coach'].includes(userRole);
      case 'community':
      case 'gallery':
        return true; // All roles can access community and gallery
      default:
        return userRole === 'executive'; // Default to executive only
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <nav className="navbar">
            <a href="/" className="navbar-brand">축구회</a>
            <ul className="navbar-nav">
              <li><a href="/dashboard" className="nav-link active">홈</a></li>
              <li><a href="/matches" className="nav-link">경기</a></li>
              <li><a href="/stats" className="nav-link">기록</a></li>
              <li><a href="/community" className="nav-link">커뮤니티</a></li>
              <li><a href="/gallery" className="nav-link">갤러리</a></li>
              {hasPermission('finance') && (
                <li><a href="/finance" className="nav-link">회계</a></li>
              )}
              <li>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userId');
                    navigate('/login');
                  }}
                >
                  로그아웃
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="dashboard-main container">
        <div className="welcome-section">
          <h1>안녕하세요, {userName}님!</h1>
          <p className="welcome-subtitle">축구회 관리 시스템에 오신 것을 환영합니다.</p>
          <div className="user-role-badge">
            {userRole === 'executive' && <span className="role executive">운영진</span>}
            {userRole === 'coach' && <span className="role coach">감독</span>}
            {userRole === 'accountant' && <span className="role accountant">회계</span>}
            {userRole === 'member' && <span className="role member">회원</span>}
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card upcoming-matches">
            <h2>다가오는 경기</h2>
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
            <h2>공지사항</h2>
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
            <a href="/community" className="view-all">모든 공지 보기</a>
          </div>
          
          <div className="dashboard-card quick-actions">
            <h2>바로가기</h2>
            <div className="action-buttons">
              {hasPermission('stats') && (
                <a href="/stats" className="action-button stats-button">
                  <span className="action-icon">📊</span>
                  <span className="action-text">통계 확인</span>
                </a>
              )}
              <a href="/community" className="action-button community-button">
                <span className="action-icon">💬</span>
                <span className="action-text">게시판</span>
              </a>
              <a href="/gallery" className="action-button gallery-button">
                <span className="action-icon">🖼️</span>
                <span className="action-text">갤러리</span>
              </a>
              {hasPermission('matchManagement') && (
                <a href="/matches/new" className="action-button new-match-button">
                  <span className="action-icon">🏆</span>
                  <span className="action-text">경기 등록</span>
                </a>
              )}
              {hasPermission('finance') && (
                <a href="/finance" className="action-button finance-button">
                  <span className="action-icon">💰</span>
                  <span className="action-text">회계 관리</span>
                </a>
              )}
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
