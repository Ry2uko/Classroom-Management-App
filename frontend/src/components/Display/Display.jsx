import { useEffect, useState, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import { useNavigate } from 'react-router';
import './Display.css';

const Display = ({ displayType='content', displayData, mode='display', displayContext='course', theme }) => {
  const [searchVal, setSearchVal] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const [kebabStatus, setKebabStatus] = useState({ 1: false, 2: false, 3: false });
  const { loginType } = useContext(LoginContext);

  const navigate = useNavigate();
  const displayTheme = theme || loginType; // override theme

  // Display types: content, student, classroom

  const openKebab = (key) => {
    setKebabStatus((prevStatus) => {
      return Object.fromEntries(
        Object.keys(prevStatus).map(n => {
          return n === key.toString() ? [n, !prevStatus[n]] : [n, false]
        })
      );
    });
  }

  const switchFilter = (key) => {
    setKebabStatus((prevStatus) => {
      return Object.fromEntries(
        Object.keys(prevStatus).map(n => [n, false])
      );
    }); // close all kebab containers
    setActiveFilter(key);
  }

  const handleInputSearch = (e) => {
    setKebabStatus((prevStatus) => {
      return Object.fromEntries(
        Object.keys(prevStatus).map(n => [n, false])
      );
    });

    setSearchVal(e.target.value);
  };

  const handleCreate = () => {
    if (displayType ==='classroom') {
      navigate('/r/create');
    } else if (displayType === 'content') {
      if (displayContext === 'school') {
        navigate('/c/create?t=school');
      } else if (displayContext === 'course') {
        navigate('/c/create?t=course');
      } else if (displayContext === 'classroom') {
        navigate('/c/create?t=classroom');
      }
    }
  }

  return (
    <div className="Display">
      <div className={`search-bar-container ${mode}`}>
        <div className="search-bar-input-group">
          <div className="search-bar-btn-container">
            <button type="button" className={`search-btn ${displayTheme}`}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
          <div className="input-text-container">
            <input type="text" placeholder="Search" className="search-input-text"
              value={searchVal} onChange={(e) => handleInputSearch(e)} />
          </div>
        </div>
      </div>
      <div className="display-container">
        <div className="display-header">
          <div className={`filters-container ${displayTheme}`}>
            {
              ['All', 'Filter A', 'Filter B', 'Filter C'].map((f, i) => (
                <div className={`filter ${activeFilter === i ? 'selected' : ''}`}
                  onClick={() => switchFilter(i)} key={i}>{f}</div>
              ))
            }
          </div>
          {
            ((loginType !== 'student' && mode === 'display') || (loginType !== 'student' && mode !== 'display' && displayType === 'classroom')) && (
              <button type="button" className={`create-btn ${displayTheme}`} onClick={handleCreate}>
                <i className="fa-solid fa-plus"></i>
              </button>
            )
          }
        </div>
        <div className="display-body">
          {/* DISPLAY */}
          { displayType === 'content' && (
            <div className="content-items-container">
              <div className="content-item" key="1">
                <div className={`content-icon ${displayTheme}`}>
                  <i className="fa-solid fa-book"></i>
                </div>
                <div className="content-details">
                  <span className="content-title">
                    Creative Portfolio
                  </span>
                  <span className="details-group">
                    <small className="content-date">
                      March 21, 2025
                    </small>
                  </span>
                </div>
                <button type="button" className="kebab" onClick={() => openKebab(1)}>
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
                {kebabStatus[1] && (
                  <div className="kebab-container">
                    <ul>
                      <li>Copy Link</li>
                      {loginType === 'admin' && (
                        <li>Edit Content</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) }

          { displayType === 'course' && (
            <div className="course-items-container">
              <div className="course-item" key="1">
                <div className="course-header">
                  <div className="course-bg">
                    <img src="/images/course-bg.png" />
                  </div>
                    <button type="button" className="kebab" onClick={() => openKebab(1)}>
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    {kebabStatus[1] && (
                      <div className="kebab-container">
                        <ul>
                          <li>Copy Link</li>
                          {loginType !== 'student' && (
                            <li>Edit Course</li>
                          )}
                        </ul>
                      </div>
                    )}
                  <div className="title-group">
                    <span className="course-title">General Chemistry 2</span>
                    <span className="course-strand">STEM</span>
                  </div>
                </div>
                <div className="course-body">
                  <div className="details-group">
                    <span className="detail-info">
                      <i className="fa-regular fa-folder"></i> 8 Items
                    </span>
                    <span className="detail-info">
                      <i className="fa-regular fa-circle-user"></i> Ms Juvie
                    </span>
                  </div>
                  <button type="button" className={`view-course-btn ${displayTheme}`}>
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
              <div className="course-item" key="1">
                <div className="course-header">
                  <div className="course-bg">
                    <img src="/images/course-bg.png" />
                  </div>
                    <button type="button" className="kebab" onClick={() => openKebab(1)}>
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    {kebabStatus[1] && (
                      <div className="kebab-container">
                        <ul>
                          <li>Copy Link</li>
                          {loginType !== 'student' && (
                            <li>Edit Course</li>
                          )}
                        </ul>
                      </div>
                    )}
                  <div className="title-group">
                    <span className="course-title">General Chemistry 2</span>
                    <span className="course-strand">STEM</span>
                  </div>
                </div>
                <div className="course-body">
                  <div className="details-group">
                    <span className="detail-info">
                      <i className="fa-regular fa-folder"></i> 8 Items
                    </span>
                    <span className="detail-info">
                      <i className="fa-regular fa-circle-user"></i> Ms Juvie
                    </span>
                  </div>
                  <button type="button" className={`view-course-btn ${displayTheme}`}>
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ) }
          
          {/* SELECT */}

          { displayType === 'classroom' && (
            <div className="classroom-items-container">
              <div className="classroom-item" key="1">
                <div className={`content-icon ${loginType}`}>
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div className="content-details">
                  <span className="content-title">
                    12-STEM Our Lady of the Most Holy Rosary
                  </span>
                  <span className="details-group">
                    <small>
                      <i className="fa-solid fa-users"></i> 16 Students
                    </small>
                    <small>
                      <i className="fa-regular fa-circle-user"></i> Sir Joseph
                    </small>
                  </span>
                </div>
                <button type="button" className="select-btn">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div className="classroom-item" key="2">
                <div className={`content-icon ${loginType}`}>
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div className="content-details">
                  <span className="content-title">
                    12-STEM Our Lady of the Most Holy Rosary
                  </span>
                  <span className="details-group">
                    <small>
                      <i className="fa-solid fa-users"></i> 16 Students
                    </small>
                    <small>
                      <i className="fa-regular fa-circle-user"></i> Sir Joseph
                    </small>
                  </span>
                </div>
                <button type="button" className="select-btn">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div className="classroom-item" key="3">
                <div className={`content-icon ${loginType}`}>
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div className="content-details">
                  <span className="content-title">
                    12-STEM Our Lady of the Most Holy Rosary
                  </span>
                  <span className="details-group">
                    <small>
                      <i className="fa-solid fa-users"></i> 16 Students
                    </small>
                    <small>
                      <i className="fa-regular fa-circle-user"></i> Sir Joseph
                    </small>
                  </span>
                </div>
                <button type="button" className="select-btn">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          ) }

          { displayType === 'student' && (
            <div className="student-items-container">
              <div className="student-item">
                <div className="content-icon">
                  <img src="/images/TEST/francine.jpg" />
                </div>
                <div className="content-details">
                  <span className="content-title">Francine Erich B. Cacao</span>
                  <div className="details-group">
                    <small>12-HUMSS</small>
                  </div>
                </div>
                <button type="button" className="select-btn">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div className="student-item">
                <div className="content-icon">
                  <img src="/images/TEST/steven.jpg" />
                </div>
                <div className="content-details">
                  <span className="content-title">Steven Lloyd F. Malabanan</span>
                  <div className="details-group">
                    <small>12-STEM</small>
                  </div>
                </div>
                <button type="button" className="select-btn">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div className="student-item">
                <div className="content-icon">
                  <img src="/images/TEST/cj.jpg" />
                </div>
                <div className="content-details">
                  <span className="content-title">Christian Joseph G. Agustin</span>
                  <div className="details-group">
                    <small>12-STEM</small>
                  </div>
                </div>
                <button type="button" className="select-btn">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          ) }

        </div>
      </div>
    </div>
  );
};


export default Display;