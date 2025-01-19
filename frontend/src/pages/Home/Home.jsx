import { Link } from 'react-router';
import { useEffect, useState } from 'react';
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
                    View All <i className="fa-solid fa-angle-right"></i>
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
                    <p className="attendance-status-text">You are marked as <span className="attendance-highlight">Present</span></p>
                    <button type="button" classame="check-attendance-btn" onClick={handleCheckAttendance}>
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
const Calendar = () => {
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ]

    const [currDate, setCurrDate] = useState(new Date());
    const [days, setDays] = useState([]);
    const [monthYearText, setMonthYearText] = useState('');

    const renderCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const nextMonthFirstDay = 7 - new Date(year, month + 1, 0).getDay() - 1;

        setMonthYearText(`${months[month]} ${year}`);

        const newDays = [];

        // Previous month days
        for (let i = firstDay; i > 0; i--) {
            newDays.push({
                day: prevMonthLastDay - i + 1,
                currMonth: false,
                today: false,
            });
        }

        // Current month days
        for (let i = 1; i <= lastDay; i++) {
            newDays.push({
                day: i,
                currMonth: true,
                today: i === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear(),
            });
        }

        // Next month days
        for (let i = 1; i <= nextMonthFirstDay; i++) {
            newDays.push({
                day: i,
                currMonth: false,
                today: false,
            })
        }

        setDays(newDays);
    }

    useEffect(() => {
        renderCalendar(currDate);
    }, [currDate]);

    const handlePrevMonth = () => {
        setCurrDate(new Date(currDate.getFullYear(), currDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrDate(new Date(currDate.getFullYear(), currDate.getMonth() + 1, 1));
    }

    return (
        <div className="Calendar" id="calendar">
            <div className="calendar-header">
                <button type="button" id="calendar-prev-btn" onClick={handlePrevMonth}>
                    <i className="fa-solid fa-angle-left"></i>
                </button>
                <div id="calendar-month-year">{monthYearText}</div>
                <button type="button" id="calendar-next-btn" onClick={handleNextMonth}>
                    <i className="fa-solid fa-angle-right"></i>
                </button>
            </div>
            <div className="calendar-body">
                <div className="calendar-weekdays">
                    <div className="weekday">Sun</div>
                    <div className="weekday">Mon</div>
                    <div className="weekday">Tue</div>
                    <div className="weekday">Wed</div>
                    <div className="weekday">Thu</div>
                    <div className="weekday">Fri</div>
                    <div className="weekday">Sat</div>
                </div>
                <div id="calendar-days" className="calendar-days">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${day.currMonth ? '' : 'dimmed'} ${day.today ? 'today' : ''}`}
                            >
                                {day.day}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

const ProfileContent = () => (
    <div className="ProfileContent">
        <div className="profile-section-container">
            <div className="user-icon-container">
                <img src="https://scontent.fmnl13-1.fna.fbcdn.net/v/t39.30808-6/473190674_28325036933778915_7586882973598117196_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEGJ0_LxzR6B7bs1dERydsxt4kriRD8e1a3iSuJEPx7Vqsea81XdgisO-nvS9NYNsrxcLCi-oYCSSVybxj6tot-&_nc_ohc=xTxOibda9YgQ7kNvgFlq_Gl&_nc_zt=23&_nc_ht=scontent.fmnl13-1.fna&_nc_gid=AxZ96xtkAWMVTKREtjw478m&oh=00_AYBiTkvuUovtkDx-AN0j5CQzXsWiTv29iS7yUaoplP2Y7g&oe=678ED8CB" alt="user-icon" className="user-icon" />
            </div>
            <div className="user-detail-container">
                <h3 className="user-name">Gabriel M. Fradejas</h3>
                <h5 className="user-role">Student</h5>
            </div>
            <div className="user-profile-btn-container">
                <Link to="/profile" className="user-profile-btn">
                    Profile
                </Link>
            </div>
        </div>
        <div className="calendar-section-container">
            <Calendar />
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