import { Link } from 'react-router';
import { useContext, useEffect, useState } from 'react';
import DonutChart from '../../components/DonutChart/DonutChart';
import { fetchHomeData } from '../../services/homeService';
import { fetchUserData } from '../../utils/apiUtils';
import { LoginContext } from '../../contexts/LoginContext';
import './Home.css';   

const Home = ({ user, fetchUserSessionData }) => {
    const { loginType } = useContext(LoginContext);

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

    const { loginType } = useContext(LoginContext);

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
                <span className={`loader ${loginType}`}></span>
            )}
        </div>
    );
}

const AdminHome = ({ user, fetchUserSessionData  }) => {
    const [dataLoaded, setDataLoaded] = useState(true);
    const { loginType } = useContext(LoginContext);
    
    const attendanceData = [
        { label: 'Present', value: 28 },
        { label: 'Late', value: 8 },
        { label: 'Absent', value: 2 },
        { label: 'Excused', value: 1 },
        { label: 'Not Marked', value: 5 },
    ];

    useEffect(() => { 
        // Fetch on home page render
        fetchUserSessionData();
    }, []);

    return (
        <div className="Home admin-view">
            { dataLoaded ? (
                <>
                    <TopBar />
                    <div className="main-container">
                        <div className="row">
                            <div className="dblock semi-full banner">
                                <WelcomeBanner user={user} banner="admin" />
                            </div>
                             <div className="dblock calendar">
                                <Calendar />
                             </div>
                        </div>
                        <div className="row">
                            <div className="dblock full classroom">
                                <div className="classroom-icon">
                                    <i className="fa-solid fa-chalkboard-user"></i>
                                </div>
                                <div className="classroom-details">
                                    <span className="classroom-name">12-STEM Our Lady of the Most Holy Rosary</span>
                                    <div className="details-group">
                                        <span className="classroom-students">
                                            <i className="fa-solid fa-users"></i> 16 Students
                                        </span>
                                        <span className="classroom-adviser">
                                            <i className="fa-regular fa-circle-user"></i> Sir Joseph
                                        </span>
                                    </div>
                                    <div className="btn-group">
                                        <Link to="/" className="details-btn">
                                            View Classroom
                                        </Link>
                                        <Link to="/" className="details-btn">
                                            Switch Classroom
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="dblock students">
                                <div className="dblock-header">
                                    <h5>12-STEM Students</h5>
                                    <Link to="/" className="header-btn">
                                        View All <i className="fa-solid fa-chevron-right"></i>
                                    </Link>
                                </div>
                                <div className="dblock-body">
                                    <div className="student-items-container">
                                        <div className="student-item">
                                            <div className="student-icon">
                                                <img src="https://scontent.fmnl8-4.fna.fbcdn.net/v/t1.15752-9/482587401_1851681942241209_5331386829859509603_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeG18l_-s0Uk49He5-U6_V01wJFVfnK59nDAkVV-crn2cNbSvQDmV1Jh1li3xlhjrhvCdWzjR78ejdbMnjkq0eP1&_nc_ohc=W7yH0EI3JZ0Q7kNvgF_CJUa&_nc_oc=AdhvAxMUmt5jzaWDOvakxRI78UCX25teM6HBNvFLQl5R9CAVbbK6xm-jGbmnMtxNf5dfIxhgolsAtVgw77TGofa4&_nc_zt=23&_nc_ht=scontent.fmnl8-4.fna&oh=03_Q7cD1wFHfxENk2fFIF6FIQgMZSuaTevv9FLwNbSbQ624Gv7sGA&oe=67FFA0D8" />
                                            </div>
                                            <div className="student-details">
                                                <span className="student-name">Gabriel M. Fradejas</span>
                                                <span className="student-strand">STEM</span>
                                            </div>
                                            <div className="student-attendance">
                                                <div className="ping present"></div>        
                                            </div>
                                        </div>
                                        <div className="student-item">
                                            <div className="student-icon">
                                                <img src="https://scontent.fmnl8-3.fna.fbcdn.net/v/t39.30808-6/438109410_1488947362024718_1267391683376872167_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeERcngmRNkrJ7BMdAeupC0bVmctLiQpWM9WZy0uJClYzzSABhLbTA-vkf6AmMCDWAwqYoERDcaECwaMdDp89fCc&_nc_ohc=GdN8tHio62AQ7kNvgGHvPPN&_nc_oc=AdjM-DiYKVtxTQKZH7wKgQanzzVUl5XOiRwk_2cPnyww7FyPSlniuCvoQZQmBSO8EKoKv2LX-paE5gyst-TE8u08&_nc_zt=23&_nc_ht=scontent.fmnl8-3.fna&_nc_gid=0vlungiKb0golU7JlmhlUw&oh=00_AYGdKe41pMgahvM6IKi7ZYgA6TWM50zQOxSoL-hZUYstnQ&oe=67DE991F" />
                                            </div>
                                            <div className="student-details">
                                                <span className="student-name">Andrei V. Petate</span>
                                                <span className="student-strand">STEM</span>
                                            </div>
                                            <div className="student-attendance">
                                                <div className="ping late"></div>        
                                            </div>
                                        </div>
                                        <div className="student-item">
                                            <div className="student-icon">
                                                <img src="https://scontent.fmnl8-4.fna.fbcdn.net/v/t1.15752-9/476503024_1031037669065334_2509993747841053263_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeG8sd-1RU18gA2XRAFwnwfliUFa8OaoTHqJQVrw5qhMej9imcGD2aHqUJ-GAeY6nrULKVHq9lX0zDye_GQEUw6I&_nc_ohc=Dksu4zWoII8Q7kNvgEF0gkj&_nc_oc=AdjkkeIUUQ16pzrcTHxfqAqcAgUO3AHK0wqLeifjS7LDcm0uoOKA_q8S21XfdOsm1kNC4zG3fkswLqmtrP6LeJWV&_nc_zt=23&_nc_ht=scontent.fmnl8-4.fna&oh=03_Q7cD1wHk9D8woO7UB7dxczLzTw5xjm_XpC458JcHEi1OfYlYZQ&oe=680036FC" />
                                            </div>
                                            <div className="student-details">
                                                <span className="student-name">Livana Jenell C. Rivera</span>
                                                <span className="student-strand">STEM</span>
                                            </div>
                                            <div className="student-attendance">
                                                <div className="ping present"></div>        
                                            </div>
                                        </div>
                                        <div className="student-item">
                                            <div className="student-icon">
                                                <img src="https://scontent.fmnl8-3.fna.fbcdn.net/v/t39.30808-1/458186484_1224209655574723_4239453949705046952_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeEHwcOV8Je6P8zf5mF-mZNNwbaBVSrgItbBtoFVKuAi1gkQdT_vEzHESLUoR8ubwH2jYpyohEsdkJa4fY-AOHyw&_nc_ohc=iIuaBDxCZUEQ7kNvgFZ6iC0&_nc_oc=AdgqSBtgWnnJm8IC-4NQ2sRitcPzJWke5146KEt-AMx84VPIjlPx5nX00kvbSeLCzCwsdHw0Yi09TMRAxYIZh79Y&_nc_zt=24&_nc_ht=scontent.fmnl8-3.fna&_nc_gid=pvGV0RZiHHYqpvHctzaiLg&oh=00_AYF8CVyuZZ7TPGSmaHql8jwscah7edqRx9aP3v2Nkz_8Pg&oe=67DEB024" />
                                            </div>
                                            <div className="student-details">
                                                <span className="student-name">Aiden Tyler E. Mendoza</span>
                                                <span className="student-strand">STEM</span>
                                            </div>
                                            <div className="student-attendance">
                                                <div className="ping absent"></div>        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="dblock attendance">
                                <div className="dblock-header">
                                    <h5>Today's Attendance</h5>
                                    <Link to="/" className="header-btn">
                                        View Record <i className="fa-solid fa-chevron-right"></i>
                                    </Link>
                                </div>
                                <div className="dblock-body">
                                    <DonutChart data={attendanceData} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="dblock announcements">
                                <div className="dblock-header">
                                    <h5>Announcements</h5>
                                    <Link to="/" className="header-btn">
                                        View all <i className="fa-solid fa-chevron-right"></i>
                                    </Link>
                                </div>
                                <div className="dblock-body">
                                    <div className="announcement-items-container">
                                        <div className="announcement-item">
                                            <span className="announcement-title">SGA 61st Founding Anniversary</span>
                                            <span className="announcement-date">March 18, 2025</span>
                                        </div>
                                        <div className="announcement-item">
                                            <span className="announcement-title">Supreme Student Council Officers S.Y. 2025-2026</span>
                                            <span className="announcement-date">March 15, 2024</span>
                                        </div>
                                        <div className="announcement-item">
                                            <span className="announcement-title">Sports Tryout</span>
                                            <span className="announcement-date">March 4, 2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="dblock courses">
                                <div className="dblock-header">
                                    <h5>Courses</h5>
                                    <Link to="/" className="header-btn">
                                        View All <i className="fa-solid fa-chevron-right"></i>
                                    </Link>
                                </div>
                                <div className="dblock-body">
                                    <div className="course-items-container">
                                        <div className="course-item">
                                            <div className="course-icon">
                                                <i className="fa-solid fa-book-open"></i>
                                            </div>
                                            <div className="course-details">
                                                <span className="course-title">General Physics 2</span>
                                                <div className="details-group">
                                                    <div className="detail-info">
                                                        <i className="fa-solid fa-folder"></i> 7 Items
                                                    </div>
                                                    <div className="detail-info">
                                                        <i className="fa-regular fa-circle-user"></i> Sir Joven
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to="/" className="course-btn-icon">
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                        <div className="course-item">
                                            <div className="course-icon">
                                                <i className="fa-solid fa-book-open"></i>
                                            </div>
                                            <div className="course-details">
                                                <span className="course-title">Contemporary Philippine Arts from the Regions</span>
                                                <div className="details-group">
                                                    <div className="detail-info">
                                                        <i className="fa-solid fa-folder"></i> 19 Items
                                                    </div>
                                                    <div className="detail-info">
                                                        <i className="fa-regular fa-circle-user"></i> Sir Joseph
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to="/" className="course-btn-icon">
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                        <div className="course-item">
                                            <div className="course-icon">
                                                <i className="fa-solid fa-book-open"></i>
                                            </div>
                                            <div className="course-details">
                                                <span className="course-title">Sacraments</span>
                                                <div className="details-group">
                                                    <div className="detail-info">
                                                        <i className="fa-solid fa-folder"></i> 3 Items
                                                    </div>
                                                    <div className="detail-info">
                                                        <i className="fa-regular fa-circle-user"></i> Ms Glo
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to="/" className="course-btn-icon">
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                                <span>See all announcements</span>
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
                <div className={`loader ${loginType}`}></div>
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
    const { setLoginType } = useContext(LoginContext);

    return (
        <div className="WelcomeBanner">
            <div className="banner-section-left">
                <h2 className="greetings">Good morning, {user.username}!</h2>
                { banner === 'student' ? (
                    <div className="attendance-status-text-container">
                        <p className="attendance-status-text">You are marked as <span className="attendance-highlight">Present</span></p>
                        <div className="row">
                            <Link to="/attendance" className="check-attendance-btn">
                                Check Attendance
                            </Link>
                            {
                                user.type !== 'student' && (
                                    <button type="button" className="switch-view to-admin" onClick={() => setLoginType('admin')}
                                    title="Switch to Admin View">
                                        <i className="fa-solid fa-people-arrows"></i>
                                    </button>
                                )
                            }
                        </div>
                    </div>
                ) : (
                    <div className="schedule-status-text-container">
                        <p className="schedule-status-text">Your next class starts at <span className="schedule-highlight">8:30 AM</span></p>   
                        <div className="row">
                            <Link to="/schedule" className="view-schedule-btn">
                                View Schedule
                            </Link>
                            <button type="button" className="switch-view to-student" onClick={() => setLoginType('student')}
                            title="Switch to Student View">
                                <i className="fa-solid fa-people-arrows"></i>
                            </button>
                        </div>
                    </div>
                )}
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

/* TopBar */
const TopBar = () => { 
    const { loginType } = useContext(LoginContext);

    const handleSearch = () => {
        return;
    };

    const [dateText, setDateText] = useState('');
    useEffect(() => {
        const currDate = new Date();
        let formattedDate = currDate.toLocaleDateString('en-us', {
            day: '2-digit',
            month: 'long',
            weekday: 'long',
            year: 'numeric',
        });
        
        const parts = formattedDate.split(', ')

        setDateText(`${parts[1].split(' ')[1]} ${parts[1].split(' ')[0]} ${parts[2]}, ${parts[0]}`);
    }, []);

    return (
        <div className="TopBar">
            <div className="search-bar-container">
                <div className="search-bar-input-group">
                    <div className="search-bar-btn-container">
                        <button type="button" onClick={handleSearch} className={`search-btn ${loginType}`}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div className="input-text-container">
                        <input type="text" placeholder="Search" className="search-input-text" />
                    </div>
                </div>
            </div>
            <div className="date-container">
                <span className="date-text">{dateText}</span>
                { loginType !== 'student' && (
                    <div className="admin-btn-group">
                        <button type="button" className="topbar-btn">
                            <i className="fa-solid fa-plus"></i>
                        </button>
                        <button type="button" className="topbar-btn">
                            <i className="fa-solid fa-user"></i>
                        </button>
                    </div>    
                )}
            </div>
        </div>
    )
};

/* SearchContent */
const SearchContent = () => (
    <></>
);

export default Home;