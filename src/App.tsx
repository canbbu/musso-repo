import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Providers } from '@/app/providers';
import { AppRoutes } from '@/app/routes';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <GoogleAnalytics />
        <Providers>
          <AppRoutes />
          <Toaster />
        </Providers>
      </Router>
    </React.StrictMode>
  );
}

export default App;
