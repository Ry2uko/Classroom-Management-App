import { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import DOMPurify from 'dompurify';
import './Content.css'

const Content = ({ }) => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const { loginType } = useContext(LoginContext);
    const [isKebabOpen, setIsKebabOpen] = useState(false);

    const TEST_CONTENT = DOMPurify.sanitize(`<p><strong> "Y'all" is a brilliant use of the English language and i refuse to be told otherwise</strong></p><p><br></p><p>I'm British, from a small town in the middle of England, nobody EVER says "Y'all" here and i don't get why.</p><p><br></p><p>When i first heard the word i thought it was stupid, but the older i get the more and more i realise how much i would easily use "Y'all" in every day life.</p><p><br></p><p>I'm a manager in my office so i often have to refer to multiple people at a time, "You all" or "You lot" or "All of you" is fine for now but can come off quite harsh, i've now rotated "Y'all" into the mix and it just FITS so well. Its soft, comes out friendly. Everyone knows what i mean, it rolls off the tongue nicely and i get to put that sweet southern accent on when i say it.</p><p><br></p><p>I think we should all adapt to it because honestly, it works.</p><p><br></p><p><u>EDIT</u>: <s>Jesus christ, this was a quick 5 minute post... how on earth did it boom this big?!</s></p><p><br></p><p><strong>I always eat dessert before dinner at a restaurant</strong></p><p><br></p><p>When at a restaurant, waiting staff always find it weird when I order the dessert before the appetizer and the main course. They ask “oh, is that all that you’re having?”. I’m like “no… I just want my cheesecake first, please”. I have to convince them that I’m just a dessert first kinda guy. I feel like the main course is much more enjoyable when your dopamine levels are boosted.</p><p><br></p><p>THAT'S ALL FOLKS</p><p><br></p>`);

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
                                <button type="button" className="kebab" onClick={() => setIsKebabOpen(!isKebabOpen)}>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>

                                { isKebabOpen && (
                                    <div className="kebab-container">
                                        <ul>
                                            <li>Copy Link</li>
                                            <li>Edit Content</li>
                                        </ul>
                                    </div>
                                )}
                                
                            </div>
                            <div className="content-body">
                                <div className="content-markdown">
                                    {/* RENDER WITH QUILL | Test String */}
                                    <div dangerouslySetInnerHTML={{ __html: TEST_CONTENT }} />
                                </div>
                                <div className="attachments-container">
                                    <div className="attachment-items-container">
                                        <div className="attachment">
                                            <div className="attachment-icon">
                                                <i className="fa-solid fa-file-lines"></i>
                                            </div>
                                            <div className="attachment-main">
                                                <div className="row">
                                                    <span className="attachment-title">Creative Portfolio</span>
                                                    <span className="divider">•</span>
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
                                            <div className="attachment-icon">
                                                <i className="fa-solid fa-link"></i>
                                            </div>
                                            <div className="attachment-main">
                                                <div className="row">
                                                    <span className="attachment-title">Youtube</span>
                                                </div>
                                                <div className="row">
                                                    <span className="attachment-content">
                                                        <small className="file-url">https://www.youtube.com/watch?v=Bd_xKxJuzUA&t=1025s</small>
                                                    </span>
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