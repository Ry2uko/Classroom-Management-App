import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navigation from './components/Navigation/Navigation';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Attendance from './pages/Attendance/Attendance';
import axiosInstance from './services/axiosInstance'; 
import './App.css';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const handleLogout = async () => {  
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await axiosInstance.post('logout/', { refresh: refreshToken });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser({});

      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error during logout on the server: ', err);
    }    
  }

  const fetchUserSessionData = async () => {
    /* Loads user data from session */

    // Already logged in or no token available
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || user?.id) return;
    
    try {
      const response = await axiosInstance.get('/');
      setUser(response.data); 
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  }

  const hasTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      const currTime = Math.floor(Date.now() / 1000);
      return exp < currTime;
    } catch (err) {
      return true;
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || hasTokenExpired(accessToken)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login', { replace: true });
    } else {
      fetchUserSessionData();
    }
  }, []);

  return (
    <div className="App parent-container">
      <Routes>
        <Route path="login" element={<Login fetchUserSessionData={fetchUserSessionData} />} />
        <Route index element={
          <ProtectedRoute>
            <Navigation handleLogout={handleLogout} />
            <Home user={user} fetchUserSessionData={fetchUserSessionData} />
          </ProtectedRoute>
        } />        
        <Route path="attendance" element={
          <ProtectedRoute>
            <Navigation handleLogout={handleLogout} />
            <Attendance user={user} fetchUserSessionData={fetchUserSessionData} />
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
