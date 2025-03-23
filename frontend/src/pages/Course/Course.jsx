import { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import Display from '../../components/Display/Display';
import './Course.css';

const Course = ({ user, fetchUserSessionData }) => {
  const [dataLoaded, setDataLoaded] = useState(true);
  const [kebabOpen, setKebabOpen] = useState(false);
  const { loginType } = useContext(LoginContext);

  useEffect(() => {
    fetchUserSessionData();
  }, []);

  const testContent = [{}];

  return (
    <div className="Course">
      {dataLoaded ? (
        <div className="main-container">
          <div className="course-banner">
            <div className="course-bg">
              <img src="/images/course-bg.png" />
            </div>
            <button type="button" className="kebab" onClick={() => setKebabOpen(!kebabOpen)}>
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            {kebabOpen && (
              <div className="kebab-container">
                <ul>
                  <li>Copy Link</li>
                  {loginType !== 'student' && (
                    <li>Edit Content</li>
                  )}
                </ul>
              </div>
            )}
            <div className="title-group">
              <span className="course-title">Contemporary Philippine Art from the Regions</span>
              <span className="course-strand">CORE</span>
            </div>
          </div>
          <div className="display-block">
            <div className="display-wrapper">
              <Display displayType='content' displayData={testContent} displayContext='course' />
            </div>
          </div>
        </div>
      ) : (
        <span className={`loader ${loginType !== 'student' && 'admin'}`}></span>
      )}
    </div>
  );
};

export default Course;