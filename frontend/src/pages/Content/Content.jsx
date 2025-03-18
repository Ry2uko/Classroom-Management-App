import { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import './Content.css'

const Content = ({ }) => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const { loginType } = useContext(LoginContext);

    const categoriesMap = {
        'course': ['fa-solid fa-book-bookmark', 'Course Material'],  
        'classroom': ['fa-solid fa-chalkboard', 'Classroom Material'],
        'school': ['fa-solid fa-school', 'School Material'],
        'announcement': ['fa-solid fa-bullhorn', 'Announcement'],
    };

    const getShortMimeType = (mimeType) => {
        const mimeMap = {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
            "application/pdf": "pdf",
            "text/plain": "txt",
            "image/jpeg": "jpg",
            "image/png": "png"
        };
        return mimeMap[mimeType] || mimeType.split("/").pop()
    }

    useEffect(() => {
        setDataLoaded(true);
    }, []);

    return (
        <div className="Content">
            { dataLoaded ? (
                <div className="main-container">
                    <div className="content">
                        <div className="content-icon">
                            <i className="fa-solid fa-book-bookmark"></i>
                        </div>
                        <div className="content-main">
                            <div className="content-header">
                                <h2 className="content-title">
                                    Creative Portfolio
                                </h2>
                                <div className="header-group">
                                    <small className="content-uploader">Gabriel Fradz</small>
                                    <small className="divider">•</small>
                                    <small className="content-date">March 18, 2025 (7:35 AM)</small>
                                </div>
                                <button type="button" className="kebab">
                                    <i class="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <div className="kebab-container">
                                    <ul>
                                        <li>Copy Link</li>
                                        <li>Edit Content</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="content-body">
                                <div className="content-markdown">
                                    {/* RENDER LATER WITH QUILL */}
                                </div>
                                <div className="attachments-container">
                                    <div className="attachment-items-container">
                                        <div className="attachment">
                                            <button type="button" className="cancel-attachment">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                            <div className="attachment-icon">
                                                <i className="fa-solid fa-file-lines"></i>
                                            </div>
                                            <div className="attachment-main">
                                                <div className="row">
                                                    <span className="attachment-title">Creative Portfolio</span>
                                                    •
                                                    <span className="attachment-mimetype">pptx</span>
                                                </div>
                                                <div className="row">
                                                    <span className="attachment-content">
                                                        <small className="file-size">0.05 MB</small>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="attachment">
                                            <button type="button" className="cancel-attachment">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                            <div className="attachment-icon">
                                                <i className="fa-solid fa-link"></i>
                                            </div>
                                            <div className="attachment-main">
                                                <div className="row">
                                                    <span className="attachment-title">Youtube</span>
                                                </div>
                                                <div className="row">
                                                    <span className="attachment-content">https://www.youtube.com/watch?v=Bd_xKxJuzUA&t=1025s</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <span className={`loader ${loginType !== 'student' && 'admin'}`}></span>
            )}
        </div>
    );
};

export default Content;