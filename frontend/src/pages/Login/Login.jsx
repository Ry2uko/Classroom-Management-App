import { useState } from 'react';
import { Link } from 'react-router';
import './Login.css';

const Login = () => {
    const [loginText, setLoginText] = useState('Student');
    const [loginType, setLoginType] = useState('student');
    const [errorMsg, setErrorMsg] = useState('This is a placeholder text');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');

    const handleStudentSwitch = () => {
        if (loginType !== 'student') {
            setLoginText('Student');
            setLoginType('student');
        }
    };

    const handleAdminSwitch = () => {
        if (loginType !== 'admin') {            
            setLoginText('Admin');
            setLoginType('admin');
        }
    };

    const handleFullNameChange = (value) => {
        setFullName(value);
    }

    const handlePasswordChange = (value) => {
        setPassword(value)
    }

    const handleLogin = () => {
        const user = { full_name: fullName, password };
    };

    return (
        <div className="Login">
            <div className="banner-section">
                <img src="/images/banner-img.jpg" alt="Banner" className="banner-img" />
                <img src="/images/sga_logo.png" alt="School Logo" className="school-logo" />
                <span className="tagline">
                    "Where Gospel-Inspired Leaders are Born"
                </span>
                <div className="overlay"></div>
                <span className="footer-text">
                    <Link to="/about">
                        About
                    </Link>
                </span>
            </div>
            <div className="login-form-section">
                <div className="login-form-container">
                    <h1>{loginText} Login</h1>
                    <div className="type-switch-container">
                        <div className="type-switch">
                            <div className={`toggle-indicator ${loginType}`}></div>
                            <button type="button" className={`toggle-switch-btn ${loginType === 'student' ? 'active' : ''}`} id="switch-student"
                            onClick={handleStudentSwitch}>
                                Student
                            </button>
                            <button type="button" className={`toggle-switch-btn ${loginType === 'admin' ? 'active' : ''}`} id="switch-admin"
                            onClick={handleAdminSwitch}>
                                Admin
                            </button>
                        </div>
                    </div>
                    <span className="error-text">{errorMsg}</span>
                    <div className="login-form">
                        <div className="text-input-container">
                            <input type="text" placeholder="FULL NAME" className="form-input" 
                            id="full-name-input" value={fullName} onChange={e => handleFullNameChange(e.target.value)} />
                            <input type="password" placeholder="PASSWORD" className="form-input" 
                            id="password-input" value={password} onChange={e => handlePasswordChange(e.target.value)} />
                        </div>
                        <div className="login-btn-container">
                            <button type="button" id="login-btn" onClick={handleLogin}>LOGIN</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;