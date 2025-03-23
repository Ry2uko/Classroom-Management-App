import { useState, useContext } from 'react';
import { Link } from 'react-router';
import { useNavigate, Navigate } from 'react-router-dom';
import { LoginContext } from '../../contexts/LoginContext';
import './Login.css';
import axiosInstance from '../../services/axiosInstance';

const Login = () => {
  const navigate = useNavigate();

  const { setLoginType } = useContext(LoginContext);

  const [inputLoginType, setInputLoginType] = useState('student');
  const [errorMsg, setErrorMsg] = useState('This is a placeholder text');
  const [visibleError, setVisibleError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentSwitch = () => {
    if (inputLoginType !== 'student') {
      setInputLoginType('student');
    }
  };

  const handleAdminSwitch = () => {
    if (inputLoginType !== 'admin') {      
      setInputLoginType('admin');
    }
  };

  const handleFullNameChange = (value) => {
    setFullName(value);
  }

  const handlePasswordChange = (value) => {
    setPassword(value)
  }

  const handleShowPassword = (show) => {
    setShowPassword(show);
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('token/',{
        'full_name': fullName,
        'password': password,
        'type': inputLoginType,
      });

      const { access, refresh } = response.data;

      // Store tokens securely
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      setLoginType(inputLoginType);

      navigate('/', { 
        replace: true, 
       });
    } catch (error) {
      setLoading(false);
      console.error(error);
      setErrorMsg('Invalid username or password');
      setVisibleError(true);
    }
  };

  const isAuthenticated = !!localStorage.getItem('accessToken');
  if (isAuthenticated) {
    return <Navigate to="/" replace/>
  }

  return (
    <div className="Login">
      <div className="banner-section">
        <img src="/images/banner-img.jpg" alt="Banner" className="banner-img" />
        <div className="banner-display">
          <img src="/images/sga-logo.png" alt="School Logo" className="school-logo" />
          <span className="tagline">
            "Where Gospel-Inspired Leaders are Born"
          </span>
        </div>
        <div className="banner-display-mobile">
          <img src="/images/sga-logo.png" alt="School Logo" className="school-logo" />
          <span className="school-name">
            San Guillermo Academy
          </span>
        </div>
        <div className="overlay"></div>
        <span className="footer-text">
          <Link to="/about">
            About
          </Link>
        </span>
      </div>
      <div className="login-form-section">
        {
          loading ? (
            <span className={`loader ${inputLoginType}`}></span>
          ) : (
            <div className="login-form-container">
              <h1>
                <div className={`text-animation ${inputLoginType}`}>
                  <span className="student">Student</span>
                  <span className="admin">Admin</span>
                </div>
                Login
              </h1>
              <div className="type-switch-container">
                <div className="type-switch">
                  <div className={`toggle-indicator ${inputLoginType}`}></div>
                  <button type="button" className={`toggle-switch-btn ${inputLoginType === 'student' ? 'active' : ''}`} id="switch-student"
                  onClick={handleStudentSwitch}>
                    Student
                  </button>
                  <button type="button" className={`toggle-switch-btn ${inputLoginType === 'admin' ? 'active' : ''}`} id="switch-admin"
                  onClick={handleAdminSwitch}>
                    Admin
                  </button>
                </div>
              </div>
              <span className={`error-text ${visibleError ? 'visible-error' : ''}`}>
                {errorMsg}
              </span>
              <div className="login-form">
                <div className="text-input-container">
                  <input type="text" placeholder="FULL NAME" className="form-input" 
                  id="full-name-input" value={fullName} onChange={e => handleFullNameChange(e.target.value)} 
                  onKeyDown={handleInputKeyDown} />

                  <div className="input-group">
                    <input type={showPassword ? "text" : "password"} placeholder="PASSWORD" className="form-input" 
                    id="password-input" value={password} onChange={e => handlePasswordChange(e.target.value)} 
                    onKeyDown={handleInputKeyDown} />

                    { showPassword ? (
                      <button type="button" className="show-password-btn"
                      onClick={() => handleShowPassword(false)}>
                        <i className="fa-solid fa-eye-slash"></i>
                      </button>
                    ) : (
                      <button type="button" className="show-password-btn"
                      onClick={() => handleShowPassword(true)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    )}
                  </div>
                </div>
                <div className="login-btn-container">
                  <button type="button" id="login-btn" onClick={handleLogin}
                  className={ inputLoginType }>LOGIN</button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Login;