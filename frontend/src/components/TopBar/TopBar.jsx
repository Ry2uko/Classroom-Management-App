import { useEffect, useState } from 'react';
import './TopBar.css';

const TopBar = () => {
    const handleSearch = () => {
        return;
    };

    const [dateText, setDateText] = useState('');
    useEffect(() => {
        const currDate = new Date();
        let formattedDate = currDate.toLocaleDateString('en-us', {
            day: '2-digit',
            month: 'long',
            weekday: 'long',
            year: 'numeric',
        });
        
        const parts = formattedDate.split(', ')
        setDateText(`${parts[1].split(' ')[1]} ${parts[1].split(' ')[0]} ${parts[2]}, ${parts[0]}`);
    }, []);

    return (
        <div className="TopBar">
            <div className="search-bar-container">
                <div className="search-bar-input-group">
                    <div className="search-bar-btn-container">
                        <button type="button" onClick={handleSearch} className="search-btn">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div className="input-text-container">
                        <input type="text" placeholder="Search" className="search-input-text" />
                    </div>
                </div>
            </div>
            <div className="date-container">
                <span className="date-text">{dateText}</span>
            </div>
        </div>
    )
};

export default TopBar;