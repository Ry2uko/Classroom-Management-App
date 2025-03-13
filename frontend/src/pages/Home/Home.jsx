import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar/TopBar';
import DonutChart from '../../components/DonutChart/DonutChart';
import {  fetchHomeData } from '../../services/homeService';
import { fetchUserData } from '../../utils/apiUtils';
import './Home.css';   

const Home = ({ user, fetchUserSessionData, loginType }) => {
    return (
        <>
            { loginType === 'student' ? (
                <StudentHome user={user} fetchUserSessionData={fetchUserSessionData} />
            ) : (
                <AdminHome user={user} fetchUserSessionData={fetchUserSessionData} />
            )}
        </>
    );
};

const StudentHome = ({ user, fetchUserSessionData }) => {
    const [userClassroomData, setUserClassroomData] = useState({});
    const [coursesData, setCoursesData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchData = async () => {
        try {
            const { 
                userClassroom,
                courses
             } = await fetchHomeData(user.id);

             setUserClassroomData(userClassroom);
             setCoursesData(courses);
             setDataLoaded(true);
        } catch (err) {
            console.error('Failed to fetch home data', err);
        }
    };

    useEffect(() => { 
        // Fetch on home page render
        fetchUserSessionData();
    }, []);

    useEffect(() => {
        // Fetch on home page render and updates with user session
        if (user?.id) fetchData();
        console.log(user);
    }, [user]);

    return (
        <div className="Home student-view">
            { dataLoaded ? (
                <>
                    <div className="main-content-container">
                        <TopBar />
                        <MainContent 
                            user={user}
                            userClassroomData={userClassroomData} 
                            coursesData={coursesData}
                        />
                    </div>
                    <div className="profile-content-container">
                        <ProfileContent user={user}/>
                    </div>
                </>
            ) : (
                <span className="loader"></span>
            )}
        </div>
    );
}

const AdminHome = ({ user, fetchUserSessionData, loginType }) => {
    const [dataLoaded, setDataLoaded] = useState(true);

    const attendanceData = [
        { label: 'Present', value: 28 },
        { label: 'Late', value: 8 },
        { label: 'Absent', value: 2 },
        { label: 'Excused', value: 1 },
        { label: 'Not Marked', value: 5 },
    ];

    return (
        <div className="Home admin-view">
            { dataLoaded ? (
                <>
                    <div className="main-container">
                        <div className="row">
                            {/* <TopBar loginType={loginType} /> */}
                        </div>
                        <div className="row">
                            <div className="dblock semi-full banner">
                                <WelcomeBanner user={user} banner="admin" />
                            </div>
                             <div className="dblock calendar">
                                <Calendar />
                             </div>
                        </div>
                        <div className="row">
                            <div className="dblock full classroom"></div>
                        </div>
                        <div className="row">
                            <div className="dblock students"></div>
                            <div className="dblock attendance">
                                <DonutChart data={attendanceData} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="dblock announcements"></div>
                            <div className="dblock courses"></div>
                        </div>
                        <div className="row">
                            <div className="qlinks-section">
                                <h4>Quick Links</h4>
                                <div className="qlinks-items-container qlinks-grid">
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-lines-leaning"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Courses</h6>
                                                <span>Manage and organize course materials</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-school"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>School</h6>
                                                <span>View and update school-related information</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-bullhorn"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Announcements</h6>
                                                <span>Post and manage announcements</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-clock"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Schedule</h6>
                                                <span>Access and modify class schedules</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-calendar"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Calendar</h6>
                                                <span>View important school events and deadlines</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-bullhorn"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Create Announcement</h6>
                                                <span>Publish an announcement</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-lines-leaning"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Create Course</h6>
                                                <span>Add a new course</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="qlinks-card">
                                        <Link to="/" className="qlinks-text">
                                            <div className="icon-container">
                                                <i className="fa-solid fa-user-plus"></i>
                                            </div>
                                            <div className="text-container">
                                                <h6>Add Student</h6>
                                                <span>Add a new student or teacher</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="loader"></div>
            )}
        </div>
    );
}

/* MainContent */
const MainContent = ({ user, userClassroomData, coursesData }) => {
    const [randCourses, setRandCourses] = useState([]);

    const loadCourses = async () => {
        const shuffledCourses = [...coursesData].sort(() => Math.random() - 0.5);
        const randomCourses = shuffledCourses.slice(0, 3);
        
        const updatedCourses = await Promise.all(randomCourses.map(async (course) => {
            const teacher = await fetchUserData(course.assigned);
            course.assigned_teacher = (teacher.sex === 'M' ? `Sir ${teacher.username}` : `Ms. ${teacher.username}`);

            return course;
        }));

        setRandCourses(updatedCourses);           
    };  

    useEffect(() => {
        loadCourses();
    }, [coursesData]);

    return (
        <div className="MainContent">
            <WelcomeBanner user={user}/>
            <div className="courses-section section-container">
                <div className="section-header">
                    <h4>Courses</h4>
                    <Link to="/courses" className="view-all-btn">
                        View All <i className="fa-solid fa-angle-right"></i>
                    </Link>
                </div>
                <div className="courses-items-container">
                    { randCourses.length === 0 ? (
                        <span className="loader"></span>
                    ) : (
                        randCourses.map((course, index) => (
                            <div className="course-card" key={index}>
                                <div className="title-section">
                                    <h5 className="course-title">{course.name}</h5>
                                    <h6 className="course-strand">{
                                        course.is_major ? userClassroomData.strand : 'CORE'
                                    }</h6>
                                </div>
                                <div className="details-section">
                                    <div className="course-items">
                                        <i className="fa-regular fa-folder"></i>
                                        <span>{course.contents_count} Items</span>
                                    </div>  
                                    <div className="course-teacher">
                                        <i className="fa-regular fa-circle-user"></i>
                                        <span>{course.assigned_teacher}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) }
                </div>
            </div>
            <div className="qlinks-section section-container">
                <h4>Quick Links</h4>
                <div className="qlinks-items-container">
                    <div className="qlinks-row">
                        <div className="qlinks-card red">
                            <Link to="/" className="qlinks-text">
                                <i className="fa-solid fa-bullhorn"></i>
                                <span>Announcements</span>
                            </Link>
                        </div>
                        <div className="qlinks-card blue">
                            <Link to="/" className="qlinks-text">
                                <i className="fa-regular fa-clock"></i>
                                <span>Schedule</span>
                            </Link>
                        </div>
                        <div className="qlinks-card orange">
                            <Link to="/calendar" className="qlinks-text">
                                <i className="fa-regular fa-calendar"></i>
                                <span>School Calendar</span>
                            </Link>
                        </div>
                    </div>
                    <div className="qlinks-row">
                        <div className="qlinks-card purple">
                            <Link to="/" className="qlinks-text">
                                <i className="fa-solid fa-lines-leaning"></i>
                                <span>Courses</span>
                            </Link>
                        </div>
                        <div className="qlinks-card yellow">
                            <Link to="/" className="qlinks-text">
                                <i className="fa-solid fa-chalkboard"></i>
                                <span>Classroom</span>
                            </Link>
                        </div>
                        <div className="qlinks-card teal">
                            <Link to="/" className="qlinks-text">
                                <i className="fa-solid fa-school"></i>
                                <span>School</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WelcomeBanner = ({ user, banner='student' }) => {

    const switchView = (view='student') => {
        
    };

    return (
        <div className="WelcomeBanner">
            <div className="banner-section-left">
                <h2 className="greetings">Good morning, {user.username}!</h2>
                <div className="attendance-status-text-container">
                    <p className="attendance-status-text">You are marked as <span className="attendance-highlight">Present</span></p>
                    <div className="row">
                        <Link to="/attendance" className="check-attendance-btn">
                            Check Attendance
                        </Link>
                        <button type="button" className="switch-admin-view" onClick={switchView('admin')}>
                            Switch to admin view <i className="fa-solid fa-angle-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="banner-section-right">
                <div className="banner-hero-container">
                    <img src={`/images/banner-hero${banner === 'admin' ? '-admin' : ''}.png`} alt="banner-hero" className="banner-hero" />
                </div>
            </div>
        </div>
    );
};

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

// Map role value to title format
const roleTitle = {
    'student': 'Student',
    'teacher': 'Teacher',
};

const ProfileContent = ({ user }) => (
    <div className="ProfileContent">
        <div className="profile-section-container">
            <div className="user-icon-container">
                <img src={`${process.env.REACT_APP_API_URL}${user.profile_img}`} alt="user-icon" className="user-icon" />
            </div>
            <div className="user-detail-container">
                <h3 className="user-name">{user.full_name}</h3>
                <h5 className="user-role">{roleTitle[user.role]}</h5>
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
                <div className="reminder-item">
                    <div className="icon-container">
                        <i className="fa-regular fa-bell"></i>
                    </div>
                    <div className="text-container">
                        <span className="reminder-title">Midterm Exam Schedule</span>
                        <span className="reminder-date">20 January 2025, Monday</span>
                    </div>
                </div>
                <div className="reminder-item">
                    <div className="icon-container">
                        <i className="fa-regular fa-bell"></i>
                    </div>
                    <div className="text-container">
                        <span className="reminder-title">Card Giving Date</span>
                        <span className="reminder-date">20 January 2025, Monday</span>
                    </div>
                </div>
                <div className="reminder-item">
                    <div className="icon-container">
                        <i className="fa-regular fa-bell"></i>
                    </div>
                    <div className="text-container">
                        <span className="reminder-title">School Clean-up Drive</span>
                        <span className="reminder-date">19 January 2025, Sunday</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* SearchContent */
const SearchContent = () => (
    <></>
);

export default Home;