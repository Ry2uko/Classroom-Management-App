import { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import Display from '../../components/Display/Display';
import './Courses.css';

const Courses = ({ user, fetchUserSessionData }) => {
  const [dataLoaded, setDataLoaded] = useState(true);
  const { loginType } = useContext(LoginContext);

  useEffect(() => {
    fetchUserSessionData();
  }, []);

  const testContent = [{}];

  return (
    <div className="Courses">
      { dataLoaded ? (
        <div className="main-container">
          <div className="display-block">
            <div className="display-wrapper">
              <Display displayType='course' displayData={testContent} />
            </div>
          </div>
        </div>
      ) : (
        <span className={`loader ${loginType !== 'student' && 'admin'}`}></span>
      )}
    </div>
  );
};

export default Courses;