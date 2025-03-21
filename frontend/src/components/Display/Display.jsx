import { useEffect, useState, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import './Display.css';

const Display = ({ displayType='content', displayData }) => {
    const [searchVal, setSearchVal] = useState('');
    const [kebabStatus, setKebabStatus] = useState({ 1: true });
    const { loginType } = useContext(LoginContext);

    // Display types: content, student, classroom

    const handleSearch = () => {
        return;
    };

    return (
        <div className="Display">
            <div className="search-bar-container">
                <div className="search-bar-input-group">
                    <div className="search-bar-btn-container">
                        <button type="button" onClick={handleSearch} className={`search-btn ${loginType}`}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div className="input-text-container">
                        <input type="text" placeholder="Search" className="search-input-text" 
                        value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="display-container">
                <div className="display-header">
                    <div className="filters-container">
                        <div className="filter selected">All</div>
                        <div className="filter">Filter A</div>
                        <div className="filter">Filter B</div>
                        <div className="filter">Filter C</div>
                    </div>
                    {
                        loginType !== 'student' && (
                            <button type="button">
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        )
                    }
                </div>
                <div className="display-body">
                    <div className="content-items-container">
                        <div className="content-item" key="1">
                            <div className="content-icon">
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
                            <button type="button" className="kebab">
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            { kebabStatus[1] && (
                                <div className="kebab-container">
                                    <ul>
                                        <li>Copy Link</li>
                                        <li>Edit Content</li>
                                    </ul>
                                </div>
                            ) }
                        </div>
                    </div>
                    <div className="course-items-container">
                        <div className="course-item"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Display;