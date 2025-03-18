import { NavLink, Link } from 'react-router';
import { useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import './Navigation.css';

const Navigation = ({ handleLogout }) => {
    const { loginType } = useContext(LoginContext);

    return (
        <>
            <div className={`Navigation desktop-view ${loginType !== 'student' ? 'admin' : ''}`}>
                <div className="logo-container">
                    <div className="logo-title">
                        <Link to="/">
                            <img src="/images/sga_logo.png" alt="SGA Logo" className="logo" />
                            <h1 className="title">
                                CMA
                            </h1>
                        </Link>
                    </div>
                </div>
                <div className="navbar-main navbar-menu">
                    <div className="navbar-item">
                        <NavLink to="/" end>
                            <i className="fa-solid fa-house-user"></i>
                            <span>Home</span>
                        </NavLink>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/courses">
                            <i className="fa-solid fa-book-open"></i>
                            <span>Courses</span>
                        </NavLink>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/classroom">
                            <i className="fa-solid fa-chalkboard-user"></i>
                            <span>Classroom</span>
                        </NavLink>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/school">
                            <i className="fa-solid fa-school-flag"></i>
                            <span>School</span>
                        </NavLink>
                    </div>                    
                </div>
                <div className="navbar-settings navbar-menu">
                    <div className="navbar-item">
                        <button type="button" onClick={handleLogout} id="signout-btn">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Sign Out</span>
                        </button>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/settings">
                            <i className="fa-solid fa-gear"></i>
                            <span>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="Navigation mobile-view">
                
            </div>
        </>
    );
};

export default Navigation;