import { useState, useEffect } from 'react';
import Display from '../../components/Display/Display';
import { useNavigate } from 'react-router';
import './School.css';

const School = ({ user, fetchUserSessionData }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);

  const navigate = useNavigate();

  const schoolContent = [
    {

    }
  ];

  useEffect(() => {
    fetchUserSessionData();
    setDataLoaded(true);
  }, []);

  const nextNews = () => {
    setNewsIndex((prevIndex) => (prevIndex + 1) % 3);
  }

  const prevNews = () => {
    setNewsIndex((prevIndex) => (prevIndex - 1 + 3) % 3)
  }

  return (
    <div className="School">
      {dataLoaded ? (
        <>
          <div className="main-container">
            <div className="school-header">
              <div className="logo-container">
                <div className="usal-logo">
                  <img src="/images/usal-logo.png" />
                </div>
                <div className="sga-logo">
                  <img src="/images/sga-logo.png" />
                </div>
              </div>
              <div className="title-container">
                <span className="usal">Unified Schools of Archdiocese of Lipa</span>
                <span className="sga">San Guillermo Academy | Talisay, Batangas</span>
              </div>
            </div>
            <div className="school-banner">
              <img src="/images/banner-img.jpg" className="banner-img" />
              <div className="wrapper">
                <img src="/images/sga-logo.png" className="school-logo" />
                <span className="tagline">
                  "Where Gospel-Inspired Leaders are Born"
                </span>
              </div>
            </div>
            <div className="main-wrapper">
              <div className="btn-block-group">
                <div className="wrapper">
                  <div className="btn-wrapper">
                    <button type="button" className="dir-btn" onClick={() => navigate('/school/f/prayers')}>
                      <i className="fa-solid fa-hands-praying"></i>
                    </button>
                    <span className="dir-title">
                      Prayers
                    </span>
                  </div>
                  <div className="btn-wrapper">
                    <button type="button" className="dir-btn" onClick={() => navigate('/school/f/vision-mission')}>
                      <i className="fa-solid fa-bullseye"></i>
                    </button>
                    <span className="dir-title">
                      Vision & Mission
                    </span>
                  </div>
                  <div className="btn-wrapper">
                    <button type="button" className="dir-btn" onClick={() => navigate('/school/f/about')}>
                      <i className="fa-solid fa-star"></i>
                    </button>
                    <span className="dir-title">
                      About SGA
                    </span>
                  </div>
                  <div className="btn-wrapper">
                    <button type="button" className="dir-btn" onClick={() => navigate('/school/f/chart')}>
                      <i className="fa-solid fa-sitemap"></i>
                    </button>
                    <span className="dir-title">
                      Org. Chart
                    </span>
                  </div>
                  <div className="btn-wrapper">
                    <button type="button" className="dir-btn" onClick={() => navigate('/school/f/hymn')}>
                      <i className="fa-solid fa-music"></i>
                    </button>
                    <span className="dir-title">
                      Hymn
                    </span>
                  </div>
                </div>
              </div>
              <div className="core-container">
                <div className="announcements-container">
                  <div className="announcements-header">
                    <h5>Latest Announcements</h5>
                  </div>
                  <div className="announcement-items-container">
                    <div className="announcement-item">
                      <span className="announcement-title">SGA 61st Founding Anniversary</span>
                      <span className="announcement-date">March 18, 2025</span>
                    </div>
                    <div className="announcement-item">
                      <span className="announcement-title">Supreme Student Council Officers S.Y. 2025-2026</span>
                      <span className="announcement-date">March 15, 2025</span>
                    </div>
                    <div className="announcement-item">
                      <span className="announcement-title">Sports Tryout</span>
                      <span className="announcement-date">March 4, 2025</span>
                    </div>
                    <div className="announcement-item">
                      <span className="announcement-title">Prom Night</span>
                      <span className="announcement-date">February 23, 2025</span>
                    </div>
                  </div>
                </div>
                <div className="news-container">
                  <div className="news-header">
                    <h5>Latest News</h5>
                    <div className="btn-group">
                      <button type="button" className="news-btn" onClick={() => prevNews()}>
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button type="button" className="news-btn" onClick={() => nextNews()}>
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                  <div className="news-body">
                    <div className="carousel-wrapper">
                      <div className="news-carousel" style={{ transform: `translateX(-${newsIndex * 105}%)` }}>
                        <div className="news-item">
                          <a target="_blank" href="https://www.facebook.com/share/p/1AhYeEcmG8/" className="news-anchor">
                            <div className="news-img-container">
                              <img src="/images/TEST/n2.jpg" />
                            </div>
                            <div className="news-headline-container">
                              <span className="headline-title">
                                SEE | Gearing Up for Greatness!
                              </span>
                              <span className="headline-date">
                                March 8, 2025
                              </span>
                            </div>
                          </a>
                        </div>
                        <div className="news-item">
                          <a target="_blank" href="https://www.facebook.com/share/p/1BhVFjojdF/" className="news-anchor">
                            <div className="news-img-container">
                              <img src="/images/TEST/n1.jpg" />
                            </div>
                            <div className="news-headline-container">
                              <span className="headline-title">
                                LOOK | Marked by Ashes, Strengthened by Faith
                              </span>
                              <span className="headline-date">
                                March 5, 2025
                              </span>
                            </div>
                          </a>
                        </div>
                        <div className="news-item">
                          <a target="_blank" href="https://www.facebook.com/share/p/19aSACTQyL/" className="news-anchor">
                            <div className="news-img-container">
                              <img src="/images/TEST/n3.jpg" />
                            </div>
                            <div className="news-headline-container">
                              <span className="headline-title">
                                LOOK | Lights, Camera, PROM!
                              </span>
                              <span className="headline-date">
                                February 24, 2025
                              </span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="display-block">
                <div className="display-wrapper">
                  <Display displayType='content' displayData={schoolContent} theme='student' displayContext='school' />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <span className="loader"></span>
      )}
    </div>
  );
};

export default School;