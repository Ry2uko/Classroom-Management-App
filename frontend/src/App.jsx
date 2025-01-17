import { Routes, Route } from 'react-router';
import Navigation from './components/Navigation/Navigation';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import './App.css';

const App = () => {
  const handleLogin = () => {
    alert("Logged In!");
  }

  const handleLogout = () => {
    alert("Logged Out!");
  }

  return (
    <div className="App">
      <Navigation 
        handleLogin={handleLogin}
      />

      <Routes>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<h1>Error 404 Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
