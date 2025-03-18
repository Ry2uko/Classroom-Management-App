import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { fetchUserData } from '../../utils/apiUtils';
import './Attendance.css';

const Attendance = ({ user, fetchUserSessionData }) => {
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        fetchUserSessionData();
    }, []);

    return (
        <div className="Attendance">
            { dataLoaded ? (
                <h1>Attendance</h1>
            )   : (
                <span className="loader"></span>
            )}
        </div>
    );
};

export default Attendance;