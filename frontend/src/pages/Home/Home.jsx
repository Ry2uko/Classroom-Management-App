import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar/TopBar';
import axios from 'axios';
import './Home.css'

/* TEST DATA */
const TEST_USER_ID = 11

const Home = () => {
    const [userData, setUserData] = useState({});
    const [userClassroomData, setUserClassroomData] = useState({});
    const [coursesData, setCoursesData] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchData = async (path) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000${path}`);
            return res.data;
        } catch (err) {
            console.error('Error fetching items: ', err);
            throw err;
        }
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const user = await fetchData(`/users/${TEST_USER_ID}`);
                const userClassroom = await fetchData(`/classrooms?user=${TEST_USER_ID}`);
                const courses = await fetchData(`/courses?strand=${userClassroom[0].strand}`);

                setUserData(user);
                setUserClassroomData(userClassroom[0]);
                setCoursesData(courses);
                setDataLoaded(true);
            } catch (err) {
                console.error('Failed to fetch user data: ', err);
                throw err;
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="Home">
            { dataLoaded ? (
                <>
                    <div className="main-content-container">
                        <TopBar />
                        <MainContent 
                            fetchData={fetchData}
                            userClassroomData={userClassroomData} 
                            coursesData={coursesData}
                        />
                    </div>
                    <div className="profile-content-container">
                        <ProfileContent userData={userData}/>
                    </div>
                </>
            ) : (
                <span className="loader"></span>
            )}
        </div>
    );
};

/* MainContent */
const MainContent = ({ fetchData, userClassroomData, coursesData }) => {
    const [randCourses, setRandCourses] = useState([]);
    useEffect(() => {
        const loadCourses = async () => {
            const shuffledCourses = [...coursesData].sort(() => Math.random() - 0.5);
            const randomCourses = shuffledCourses.slice(0, 3);
            
            const updatedCourses = await Promise.all(randomCourses.map(async (course) => {
                const teacher = await fetchData(`/users/${course.assigned}`);
                course.assigned_teacher = (teacher.sex === 'M' ? `Sir ${teacher.username}` : `Ms. ${teacher.username}`);

                return course;
            }));

            setRandCourses(updatedCourses);           
        };  

        loadCourses();
    }, [coursesData]);

    return (
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
                    <div className="qlinks-card orange">
                        <div className="qlinks-text">
                            <i className="fa-solid fa-clipboard-user"></i>
                            <span>Attendance</span>
                        </div>
                    </div>
                    <div className="qlinks-card red">
                        <div className="qlinks-text">
                            <i className="fa-solid fa-bullhorn"></i>
                            <span>Announcements</span>
                        </div>
                    </div>
                    <div className="qlinks-card blue">
                        <div className="qlinks-text">
                            <i className="fa-regular fa-clock"></i>
                            <span>Schedule</span>
                        </div>
                    </div>
                    <div className="qlinks-card purple">
                        <div className="qlinks-text">
                            <i className="fa-regular fa-calendar"></i>
                            <span>School Calendar</span>
                        </div>
                    </div>
                    <div className="qlinks-card yellow">
                        <div className="qlinks-text">
                            <i className="fa-solid fa-chalkboard"></i>
                            <span>Classroom</span>
                        </div>
                    </div>
                    <div className="qlinks-card teal">
                        <div className="qlinks-text">
                            <i className="fa-solid fa-school"></i>
                            <span>School</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                    <button type="button" className="check-attendance-btn" onClick={handleCheckAttendance}>
                        Check Attendance
                    </button>
                </div>
            </div>
            <div className="banner-section-right">
                <div className="banner-hero-container">
                    <img src="/images/banner-hero.png" alt="banner-hero" className="banner-hero" />
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