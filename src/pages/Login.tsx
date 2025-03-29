
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // For demonstration purposes, using hardcoded login
    // In a real application, you would call an API
    if (username === 'admin' && password === 'password') {
      // Set user role in localStorage (would use cookies or JWT in production)
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else if (username === 'player' && password === 'password') {
      localStorage.setItem('userRole', 'player');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('유효하지 않은 아이디 또는 비밀번호입니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>축구회 로그인</h1>
          <p>계정에 로그인하여 계속하세요</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group remember-me">
            <label>
              <input type="checkbox" /> 로그인 상태 유지
            </label>
            <a href="#" className="forgot-password">비밀번호 찾기</a>
          </div>
          
          <button type="submit" className="btn-login">로그인</button>
        </form>
        
        <div className="login-footer">
          <p>아직 계정이 없으신가요? 팀 관리자에게 문의하세요</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
