import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import axiosInstance from './services/axiosInstance'; 
import './App.css';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const handleLogout = () => {  
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setUser({});
    navigate('/login', { replace: true })
  }

  const fetchUserSessionData = async () => {
    if (user?.id) return;
    setUser({});
    
    try {
      const response = await axiosInstance.get('/');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  }

  return (
    <div className="App parent-container">
      <Routes>
      <Route path="login" element={<Login />} />
        <Route index element={
          <ProtectedRoute>
            <Navigation handleLogout={handleLogout} />
            <Home user={user} fetchUserSessionData={fetchUserSessionData} />
          </ProtectedRoute>
        } />        
        <Route path="*" element={
          <ProtectedRoute>
            <Navigation handleLogout={handleLogout} />
            <h1>Error 404 Not Found</h1>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
