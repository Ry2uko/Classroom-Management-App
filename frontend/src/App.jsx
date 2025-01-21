import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import Navigation from './components/Navigation/Navigation';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import './App.css';

const App = () => {
  const [isAuth, setIsAuth] = useState(false);

  const handleLogin = () => {
    alert("Logged In!");
  }

  const handleLogout = () => {
    alert("Logged Out!");
  }

  useEffect(() => {
    if (localStorage.getItem('access_token') !== null) {
      setIsAuth(true);
    }
  }, [isAuth]);

  return (
    <div className="App parent-container">
      <Routes>

        <Route index element={
          <>
            <Navigation handleLogout={handleLogout} />
            <Home />
          </>
        } />        
        <Route path="login" element={<Login />} />
        <Route path="*" element={
          <>
            <Navigation handleLogout={handleLogout} />
            <h1>Error 404 Not Found</h1>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
