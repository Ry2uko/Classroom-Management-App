import { NavLink } from 'react-router';
import './Navigation.css';

const Navigation = ({ handleLogout }) => {
    return (
        <>
            <div className="Navigation desktop-view">
                <div className="logo-container"></div>
                <div className="navbar-main">
                    <div className="navbar-item">
                        <NavLink to="/" end>
                            <i class="fa-solid fa-house-user"></i>
                            <span>Home</span>
                        </NavLink>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/courses">
                            <i class="fa-solid fa-book-open"></i>
                            <span>Courses</span>
                        </NavLink>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/classroom">
                            <i class="fa-solid fa-chalkboard-user"></i>
                            <span>Classroom</span>
                        </NavLink>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/school">
                            <i class="fa-solid fa-school-flag"></i>
                            <span>School</span>
                        </NavLink>
                    </div>                    
                </div>
                <div classname="navbar-settings">
                    <div className="navbar-item">
                        <button type="button" onClick={handleLogout}>
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Sign Out</span>
                        </button>
                    </div>
                    <div className="navbar-item">
                        <NavLink to="/settings">
                            <i class="fa-solid fa-gear"></i>
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