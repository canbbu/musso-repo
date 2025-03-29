
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Index.css';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <nav className="navbar">
            <a href="/" className="navbar-brand">축구회</a>
            <div className="nav-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
            </div>
          </nav>
        </div>
      </header>
      
      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>우리 축구회에 오신 것을 환영합니다</h1>
              <p>함께 성장하고 즐기는 축구 커뮤니티</p>
              <button 
                className="btn btn-primary hero-button"
                onClick={() => navigate('/login')}
              >
                시작하기
              </button>
            </div>
          </div>
        </section>
        
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">우리 시스템 소개</h2>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚽</div>
                <h3>경기 관리</h3>
                <p>경기 일정 관리, 출석 체크, 경기 기록을 손쉽게 관리하세요.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>통계 분석</h3>
                <p>개인 및 팀 기록을 다양한 통계로 분석하고 성장을 확인하세요.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>리더보드</h3>
                <p>득점, 어시스트, 출석률 등 다양한 분야의 리더보드를 확인하세요.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>커뮤니티</h3>
                <p>게시판, 갤러리를 통해 서로 소통하고 팀 문화를 만들어가세요.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2023 축구회 관리 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
