
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set default user info and redirect to dashboard
    localStorage.setItem('userRole', 'member');
    localStorage.setItem('userName', '방문자');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', 'visitor');
    navigate('/dashboard');
  }, [navigate]);

  // This component will not render anything as it will immediately redirect
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>축구회 로그인</h1>
          <p>리다이렉트 중...</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
