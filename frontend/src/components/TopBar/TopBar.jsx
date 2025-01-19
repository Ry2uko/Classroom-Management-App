import './TopBar.css';

const TopBar = () => {
    const handleSearch = () => {
        return;
    };

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
                <span className="date-text">Thursday, 16 January 2025</span>
            </div>
        </div>
    )
};

export default TopBar;