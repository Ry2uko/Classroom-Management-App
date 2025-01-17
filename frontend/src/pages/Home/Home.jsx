import { Link } from 'react-router';
import TopBar from '../../components/TopBar/TopBar';
import './Home.css'

const Home = () => {
    return (
        <div className="Home">
            <div className="main-content-container">
                <TopBar />
                <MainContent />
            </div>
            <div className="profile-content-container">
                <ProfileContent />
            </div>
        </div>
    )
};

/* MainContent */
const MainContent = () => (
    <div className="MainContent">
        <WelcomeBanner />
        <div className="courses-section section-container">
            <div className="section-header">
                <h4>Courses</h4>
                <Link to="/courses" className="view-all-btn">
                    View All <i class="fa-solid fa-angle-right"></i>
                </Link>
            </div>
            <div className="courses-items-container">

            </div>
        </div>
        <div className="qlinks-section section-container">
            <h4>Quick Links</h4>
            <div className="qlinks-items-container">

            </div>
        </div>
    </div>
);

const WelcomeBanner = () => {
    const handleCheckAttendance = () => {
        return;
    };

    return (
        <div className="WelcomeBanner">
            <div className="banner-section-left">
                <h2 className="greetings">Good morning, Gab!</h2>
                <div className="attendance-status-text-container">
                    <p className="attendance-status-text">You are marked as <span class="attendance-highlight">Present</span></p>
                    <button type="button" classname="check-attendance-btn" onClick={handleCheckAttendance}>
                        Check Attendance
                    </button>
                </div>
            </div>
            <div className="banner-section-right">
                <div className="attendance-status-container">
                    <AttendanceStatus />
                </div>
            </div>
        </div>
    );
};

const AttendanceStatus = () => {
    return (
        <div className="AttendanceStatus">
            
        </div>
    )
}


/* ProfileContent */
const ProfileContent = () => (
    <div className="ProfileContent">
        <div className="profile-section-container">
            <div className="user-icon-container">
                <img src="https://scontent.fmnl13-1.fna.fbcdn.net/v/t39.30808-6/473190674_28325036933778915_7586882973598117196_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEGJ0_LxzR6B7bs1dERydsxt4kriRD8e1a3iSuJEPx7Vqsea81XdgisO-nvS9NYNsrxcLCi-oYCSSVybxj6tot-&_nc_ohc=xTxOibda9YgQ7kNvgFlq_Gl&_nc_zt=23&_nc_ht=scontent.fmnl13-1.fna&_nc_gid=AxZ96xtkAWMVTKREtjw478m&oh=00_AYBiTkvuUovtkDx-AN0j5CQzXsWiTv29iS7yUaoplP2Y7g&oe=678ED8CB" alt="user-icon" className="user-icon" />
            </div>
            <div className="user-detail-container">
                <h3 class="user-name">Gabriel M. Fradejas</h3>
                <h5 class="user-role">Student</h5>
            </div>
            <div className="user-profile-btn-container">
                <Link to="/profile" className="user-profile-btn">
                    Profile
                </Link>
            </div>
        </div>
        <div className="calendar-section-container">
            <div className="calendar">

            </div>
        </div>
        <div className="reminders-section-container">
            <h6>Reminders</h6>
            <div className="reminders-items-container">
                
            </div>
        </div>
    </div>
);

/* SearchContent */
const SearchContent = () => (
    <></>
);

export default Home;