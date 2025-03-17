import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './ContentForm.css'

const ContentForm = ({ user, fetchUserSessionData }) => {
    const [ searchParams ] = useSearchParams();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('')

    const fetchData = async () => {
        try {
            setDataLoaded(true);
        } catch (err) {
            console.error('Failed to fetch content form data', err);
        }
    }

    useEffect(() => {
        fetchUserSessionData();
    }, []);

    useEffect(() => {
        if (user?.id) fetchData();
    }, [user]);

    const categoriesMap = {
        'course': ['fa-solid fa-book-bookmark', 'Course Material'],  
        'classroom': ['fa-solid fa-chalkboard', 'Classroom Material'],
        'school': ['fa-solid fa-school', 'School Material'],
        'announcement': ['fa-solid fa-bullhorn', 'Announcement'],
    };

    let contentCategory = 'course';
    if (searchParams.has('t')) contentCategory = searchParams.get('t');
    
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered ' }, { 'list': 'bullet' }],
            ['clean']
        ],
    }

    const handleUploadFile = () => {
        return;
    };

    const handleUploadURL = () => {
        return;
    };

    return (
        <div className="ContentForm">
            { dataLoaded ? ( 
                <div className="main-container">
                    <div className="form-container">
                        <div className="header">
                            <h1 className="header-title">
                                <span className="title-icon">
                                    <i className={categoriesMap[contentCategory][0]}></i>
                                </span>
                                {categoriesMap[contentCategory][1]}
                            </h1>
                        </div>
                        <div className="content-form">
                            <div className="input-group">
                                <input className={`input-text ${title ? 'active' : ''}`} type="text" id="content-title"
                                value={title} onChange={(e) => setTitle(e.target.value)} required />
                                <div className="input-label">Title</div>
                            </div>
                            <ReactQuill
                                value={content}
                                onChange={setContent}
                                placeholder="Content (optional)"
                                theme="snow"
                                modules={modules}
                            />
                            <div className="btn-group">
                                <button type="button" className="form-btn" 
                                id="upload-file" onClick={handleUploadFile}>
                                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                    Upload
                                </button>
                                <button type="button" className="form-btn" id="upload-url"
                                onClick={handleUploadURL}>
                                    <i className="fa-solid fa-link"></i>
                                    Link
                                </button>
                            </div>
                            <div className="attachments-container">
                                <div className="attachment">
                                    <button type="button" className="cancel-attachment">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                    <div className="attachment-icon">
                                        <i className="fa-solid fa-file-lines"></i>
                                    </div>
                                    <div className="attachment-main">
                                        <div className="row">
                                            <span className="attachment-title">Contemporary Philippine Arts from the Regions</span>
                                            •
                                            <span className="attachment-mimetype">docx</span>
                                        </div>
                                        <div className="row">
                                            <span className="attachment-content">384 KB</span>
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
                                            •
                                            <span className="attachment-mimetype">docx</span>
                                        </div>
                                        <div className="row">
                                            <span className="attachment-content">https://www.youtube.com/watch?v=Bd_xKxJuzUA&t=1025s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Sidebar category={contentCategory} />
                </div>
            ) : (
                <span className="loader"></span>
            )}
        </div>
    );
}

const Sidebar = ({ category }) => {
    switch (category) {
        case 'classroom':
            return <ClassroomMaterialSidebar />;

        case 'school':
            return <SchoolMaterialSidebar />;

        case 'announcement':
            return <AnnouncementSidebar />;

        default:
            return <CourseMaterialSidebar />;
    }
}

const CourseMaterialSidebar = () => {
    return (
        <div className="CourseMaterialSidebar sidebar">
            <div className="sidebar-form">
                <div className="input-group">
                    <div className="input-label">Course</div>
                    <select className="input-select" id="content-course">
                        <option value="1">General Physics 2</option>
                        <option value="2">General Chemistry 2</option>
                        <option value="3">Contemporary Philippine Arts from the Regions</option>
                    </select>
                </div>
            </div>

            <button type="button" id="create-content">
                <i className="fa-solid fa-plus"></i>
                Create
            </button>
        </div>
    );
}

const SchoolMaterialSidebar = () => {
    return (
        <div className="CourseMaterialSidebar sidebar">
            <button type="button" id="create-content">
                <i className="fa-solid fa-plus"></i>
                Create
            </button>
        </div>
    );
}

const ClassroomMaterialSidebar = () => {
    return (
        <div className="CourseMaterialSidebar sidebar">
            <div className="sidebar-form">
                <div className="input-group">
                    <div className="input-label">Classroom</div>
                    <select className="input-select" id="content-classroom">
                    <option value="2">Grade 12</option>
                        <option value="1">12-STEM</option>
                        <option value="3">12-ABM</option>
                        <option value="3">12-HUMSS</option>
                    </select>
                </div>
            </div>

            <button type="button" id="create-content">
                <i className="fa-solid fa-plus"></i>
                Create
            </button>
        </div>
    );
}

const AnnouncementSidebar = () => {
    return (
        <div className="CourseMaterialSidebar sidebar">
            <div className="sidebar-form">
                <div className="input-group">
                    <div className="input-label">Visibility</div>
                    <select className="input-select" id="content-visibility">
                        <option value="1">School</option>
                        <option value="2">Classroom</option>
                        <option value="3">Course</option>
                    </select>
                </div>

                <div className="input-group">
                    <div className="input-label">Classroom</div>
                    <select className="input-select" id="content-classroom">
                    <option value="2">Grade 12</option>
                        <option value="1">12-STEM</option>
                        <option value="3">12-ABM</option>
                        <option value="3">12-HUMSS</option>
                    </select>
                </div>

                <div className="input-group">
                    <div className="input-label">Course</div>
                    <select className="input-select" id="content-course">
                        <option value="1">General Physics 2</option>
                        <option value="2">General Chemistry 2</option>
                        <option value="3">Contemporary Philippine Arts from the Regions</option>
                    </select>
                </div>
            </div>

            <button type="button" id="create-content">
                <i className="fa-solid fa-plus"></i>
                Create
            </button>
        </div>
    );
}

export default ContentForm;