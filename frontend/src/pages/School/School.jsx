import { useState, useEffect } from 'react';
import Display from '../../components/Display/Display';
import './School.css';

const School = ({ user, fetchUserSessionData }) => {
    const [dataLoaded, setDataLoaded] = useState(false);

    const schoolContent = [
        {

        }
    ];

    useEffect(() => {
        fetchUserSessionData();
        setDataLoaded(true);
    }, []);

    return (
        <div className="School">
            { dataLoaded ? (
                <>
                    <Display displayType='content' displayData={schoolContent} />
                </>
            ) : (
                <span className="loader"></span>
            )}
        </div>
    );
};

export default School;