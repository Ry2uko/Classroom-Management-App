import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './ContentForm.css';
import Modal from '../../components/Modal/Modal';

const ContentForm = ({ user, fetchUserSessionData, mode }) => {
    const [ searchParams ] = useSearchParams();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [link, setLink] = useState('');
    const [linkTitle, setLinkTitle] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAnimating, setIsModalAnimating] = useState(false);

    const fetchData = async () => {
        try {
            setDataLoaded(true);
        } catch (err) {
            console.error('Failed to fetch content form data', err);
        }
    }

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
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
    
    const openModal = () => {
        setIsModalOpen(true);
        setTimeout(() => setIsModalAnimating(true), 10); // reflow
    }

    const closeModal = () => {
        setIsModalAnimating(false);
        setTimeout(() => {
            setIsModalOpen(false);
            setLink('');
            setLinkTitle('');
        }, 225); // wait for animation
    };

    const handleAddLink = async () => {
        if (!link.trim()) return;

        try {   
            new URL(link);

            setAttachments((prevAttachments) => [...prevAttachments, {
                title: linkTitle,
                type: 'link',
                url: link,
            }]);
            
            closeModal();
        } catch (err) { 
            alert("Invalid LINK!!!"); // TODO: UPDATE LATER W/ ERROR MSG
        }
    };

    return (
        <div className="ContentForm">
            { dataLoaded ? ( 
                <>
                    { isModalOpen && (
                        <Modal isModalOpen={isModalOpen} isModalAnimating={isModalAnimating} closeModal={closeModal} >
                            <div className="wrapper">
                                <div className="input-group">
                                    <input className={`input-text ${linkTitle ? 'active' : ''}`} type="text" id="content-link-title"
                                    value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} required />
                                    <div className="input-label">Title</div>
                                </div>
                                <div className="input-group">
                                    <input className={`input-text ${link ? 'active' : ''}`} type="text" id="content-link"
                                    value={link} onChange={(e) => setLink(e.target.value)} required />
                                    <div className="input-label">Link</div>
                                </div>
                                <div className="btn-group">
                                    <button type="button" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="button" className={ `${(!link || !linkTitle) && 'disabled'}` } onClick={handleAddLink}>
                                        Add Link
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    <div className="main-container">
                        <div className="form-container">
                            <div className="header">
                                <h1 className="header-title" onClick={() => console.log(content)}>
                                    <span className="title-icon">
                                        <i className={categoriesMap[contentCategory][0]}></i>
                                    </span>
                                    { mode === 'edit' && 'Edit' } {categoriesMap[contentCategory][1]}
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
                                <Attachments openModal={openModal} attachments={attachments}
                                setAttachments={setAttachments} />
                            </div>
                        </div>
                        <Sidebar category={contentCategory} mode={mode}/>
                    </div>
                </>
            ) : (
                <span className="loader admin"></span>
            )}
        </div>
    );
}

const Attachments = ({ openModal, attachments, setAttachments }) => {
    const fileInputRef = useRef(null);

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

    const handleUploadFile = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setAttachments((prevAttachments) => [...prevAttachments, ...selectedFiles]);
    };

    const handleRemoveAttachment = (index) => {
        setAttachments((prevAttachments) => prevAttachments.filter((_, i) => i !== index));
    };

    return (
        <div className="Attachments">
            <div className="btn-group">
                <input className="file-browse-input" type="file" 
                ref={fileInputRef} onChange={handleFileChange} multiple hidden />
                <button type="button" className="form-btn" 
                id="upload-file" onClick={handleUploadFile}>
                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    Upload
                </button>
                <button type="button" className="form-btn" id="upload-url"
                onClick={openModal}>
                    <i className="fa-solid fa-link"></i>
                    Link
                </button>
            </div>
            <div className="attachments-container">
                { attachments.map((attachment, index) => (
                    <div className="attachment" key={index}>
                        {
                            attachment?.type == 'link' ? (
                                <>
                                    <button type="button" className="cancel-attachment">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                    <div className="attachment-icon">
                                        <i className="fa-solid fa-link"></i>
                                    </div>
                                    <div className="attachment-main">
                                        <div className="row">
                                            <span className="attachment-title">{attachment.title}</span>
                                        </div>
                                        <div className="row">
                                            <span className="attachment-content">{attachment.url}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="cancel-attachment" onClick={() => handleRemoveAttachment(index)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                    <div className="attachment-icon">
                                        <i className="fa-solid fa-file-lines"></i>
                                    </div>
                                    <div className="attachment-main">
                                        <div className="row">
                                            <span className="attachment-title">{ attachment.name }</span>
                                            •
                                            <span className="attachment-mimetype">{ getShortMimeType(attachment.type) || '' }</span>
                                        </div>
                                        <div className="row">
                                            <span className="attachment-content">
                                                <small className="file-size">{(attachment.size / (1024 * 1024)).toFixed(2)} MB</small>
                                            </span>
                                        </div>
                                    </div>
                                </>    
                            )
                        }
                    </div>
                )) }
            </div>
        </div>
    );
}

const Sidebar = ({ category, mode }) => {
    switch (category) {
        case 'classroom':
            return <ClassroomMaterialSidebar mode={mode}/>;

        case 'school':
            return <SchoolMaterialSidebar mode={mode}/>;

        case 'announcement':
            return <AnnouncementSidebar mode={mode}/>;

        default:
            return <CourseMaterialSidebar mode={mode}/>;
    }
}

const CourseMaterialSidebar = ({ mode }) => {
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

            { mode === 'edit' && (
                <div className="btn-group block">
                    <button type="button" id="archive-content">
                        <i className="fa-solid fa-box-archive"></i>
                        Archive
                    </button>
                    <button type="button" id="delete-content">
                        <i className="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            )}

            <div className="btn-group">
                {
                    mode === 'edit' ? (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="save-content">
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="create-content">
                                Create
                            </button>
                        </>
                    )
                }
            </div>
            
        </div>
    );
}

const SchoolMaterialSidebar = ({ mode }) => {
    return (
        <div className="CourseMaterialSidebar sidebar">
            { mode === 'edit' && (
                <div className="btn-group block">
                    <button type="button" id="archive-content">
                        <i className="fa-solid fa-box-archive"></i>
                        Archive
                    </button>
                    <button type="button" id="delete-content">
                        <i className="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            )}
            <div className="btn-group">
                {
                    mode === 'edit' ? (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="save-content">
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="create-content">
                                Create
                            </button>
                        </>
                    )
                }
            </div>
        </div>
    );
}

const ClassroomMaterialSidebar = ({ mode }) => {
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

            { mode === 'edit' && (
                <div className="btn-group block">
                    <button type="button" id="archive-content">
                        <i className="fa-solid fa-box-archive"></i>
                        Archive
                    </button>
                    <button type="button" id="delete-content">
                        <i className="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            )}

            <div className="btn-group">
                {
                    mode === 'edit' ? (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="save-content">
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="create-content">
                                Create
                            </button>
                        </>
                    )
                }
            </div>
        </div>
    );
}

const AnnouncementSidebar = ({ mode }) => {
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

            { mode === 'edit' && (
                <div className="btn-group block">
                    <button type="button" id="archive-content">
                        <i className="fa-solid fa-box-archive"></i>
                        Archive
                    </button>
                    <button type="button" id="delete-content">
                        <i className="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            )}

            <div className="btn-group">
                {
                    mode === 'edit' ? (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="save-content">
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" id="cancel-edit">
                                Cancel
                            </button>
                            <button type="button" id="create-content">
                                Create
                            </button>
                        </>
                    )
                }
            </div>
        </div>
    );
}

export default ContentForm;