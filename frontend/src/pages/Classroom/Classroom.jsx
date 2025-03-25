import { Link } from 'react-router';
import { useEffect, useState, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import { ClassroomContext } from '../../contexts/ClassroomContext';
import DonutChart from '../../components/DonutChart/DonutChart';
import Modal from '../../components/Modal/Modal';
import Display from '../../components/Display/Display';
import { fetchClassroomData } from '../../utils/apiUtils';
import './Classroom.css';

const Classroom = ({ user, fetchUserSessionData }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const { loginType } = useContext(LoginContext);

  const { userClassroom, setUserClassroom } = useContext(ClassroomContext);
  const [ classroomData, setClassroomData ] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);

  const attendanceData = [
    { label: 'Present', value: 28 },
    { label: 'Late', value: 8 },
    { label: 'Absent', value: 2 },
    { label: 'Excused', value: 1 },
    { label: 'Not Marked', value: 5 },
  ];

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setIsModalAnimating(true), 10); // reflow
  }

  const closeModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 225); // wait for animation
  };

  const fetchData = async () => {
    try {
      const classroomData_ = await fetchClassroomData(userClassroom);

      setClassroomData(classroomData_);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to fetch classroom data: ', err);
    } 
  };

  const testContent = [
    {

    }
  ];

  useEffect(() => {
    // fetch on classroom page render
    fetchUserSessionData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [userClassroom]);

  return (
    <div className="Classroom">
      {dataLoaded ? (
        <>
          {isModalOpen && (
            <Modal isModalOpen={isModalOpen} isModalAnimating={isModalAnimating}
              closeModal={closeModal}>
              <div className="wrapper">
                <button type="button" className="close-modal" onClick={closeModal}>
                  <i className="fa-solid fa-times"></i>
                </button>
                <Display displayType="classroom" displayData={testContent} mode="select" />
              </div>
            </Modal>
          )}

          <div className="main-container">
            <div className="row">
              <div className="dblock full classroom">
                { userClassroom ? (
                  <>
                    <div className={`classroom-icon ${loginType}`}>
                      <i className="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div className="classroom-details">
                      <span className="classroom-name">
                        {classroomData.grade_level}-{classroomData.strand} {classroomData.name}
                      </span>
                      <div className="details-group">
                        <span className="classroom-students">
                          <i className="fa-solid fa-users"></i> {classroomData.total_students} Students
                        </span>
                        <span className="classroom-adviser">
                          <i className="fa-regular fa-circle-user"></i> {classroomData.adviser_name}
                        </span>
                      </div>
                      <div className="btn-group">
                        <Link to="/schedule" className="details-btn">
                          Class Schedule
                        </Link>
                        {loginType === 'student' ? (
                          <button type="button" className="details-btn">
                            12-STABSS <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        ) : (
                          <button type="button" className="details-btn" onClick={openModal}>
                            Switch Classroom
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className={`loader ${loginType}`}></span>
                )}
              </div>
            </div>
            {
              loginType !== 'student' && (
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
                            <span className="student-strand">12-STEM</span>
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
                            <span className="student-strand">12-STEM</span>
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
                            <span className="student-strand">12-STEM</span>
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
                            <span className="student-strand">12-STEM</span>
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
                      <Link to="/attendance" className="header-btn">
                        View Record <i className="fa-solid fa-chevron-right"></i>
                      </Link>
                    </div>
                    <div className="dblock-body">
                      <DonutChart data={attendanceData} />
                    </div>
                  </div>
                </div>
              )
            }
            <div className="row">
              <div className="dblock announcements">
                <div className="dblock-header">
                  <h5>Announcements</h5>
                  <Link to="/announcements" className="header-btn">
                    View all <i className="fa-solid fa-chevron-right"></i>
                  </Link>
                </div>
                <div className="dblock-body">
                  <div className={`announcement-items-container ${loginType}`}>
                    <div className="announcement-item">
                      <Link to="/announcements" className="announcement-title">SGA 61st Founding Anniversary</Link>
                      <span className="announcement-date">March 18, 2025</span>
                    </div>
                    <div className="announcement-item">
                      <Link to="/announcements" className="announcement-title">Supreme Student Council Officers S.Y. 2025-2026</Link>
                      <span className="announcement-date">March 15, 2024</span>
                    </div>
                    <div className="announcement-item">
                      <Link to="/announcements" className="announcement-title">Sports Tryout</Link>
                      <span className="announcement-date">March 4, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dblock courses">
                <div className="dblock-header">
                  <h5>Courses</h5>
                  <Link to="/courses" className="header-btn">
                    View All <i className="fa-solid fa-chevron-right"></i>
                  </Link>
                </div>
                <div className="dblock-body">
                  <div className={`course-items-container ${loginType}`}>
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
            <div className="row display-block">
              <div className="display-wrapper">
                <Display displayType='content' displayData={testContent} displayContext='school' />
              </div>
            </div>
          </div>
        </>
      ) : (
        <span className={`loader ${loginType !== 'student' && 'admin'}`}></span>
      )}
    </div>
  );
};

export default Classroom;