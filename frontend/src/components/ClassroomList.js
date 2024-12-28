import { useEffect, useState } from 'react';
import { getClassrooms } from '../services/api';

const ClassroomList = () => {
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getClassrooms();
        if (isMounted) setClassrooms(data);
      } catch (err) {
        if (isMounted) console.error(err);
      }
    };
    
    fetchData();
    return () => {
      isMounted = false;
    }
  }, []);
  console.log(classrooms)
  return (
    <div className="container">
        <h1>Classrooms</h1>
        { classrooms.map(classroom => (
          <div className="classroom-container">
            <h2>Grade {classroom.grade} {classroom.strand}: {classroom.name}</h2>
            <table className="students-table">
              <thead>
                  <tr>
                    <th scope="col">Full Name</th>
                    <th scope="col">Username</th>
                    <th scope="col">Account Type</th>
                   </tr>
              </thead>
              <tbody>
                {classroom.students.map(student => { 
                return (
                  <tr key={student.id}>
                    <td>{student.first_name}{student.middle_initial ? ` ${student.middle_initial}. ` : ' '}{student.last_name}</td>
                    <td>{student.username}</td>
                    <td>{student.type.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</td>
                  </tr>
                );

                })}
              </tbody>
            </table>
          </div>
        )) }
    </div>
  )
};

export default ClassroomList;