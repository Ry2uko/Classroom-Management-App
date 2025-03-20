import { useEffect, useState, useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContext';
import './Display.css';

const Display = ({ displayType='content', displayData }) => {
    const [searchVal, setSearchVal] = useState('');
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
                        <div clasSname="filter">Filter A</div>
                        <div clasSname="filter">Filter B</div>
                        <div clasSname="filter">Filter C</div>
                    </div>
                    <button type="button">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="display-body">

                </div>
            </div>
        </div>
    );
};

export default Display;