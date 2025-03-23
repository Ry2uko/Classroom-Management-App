import { createContext, useState, useEffect } from "react";

const ClassroomContext = createContext();

const ClassroomProvider = ({ children }) => {
  const [userClassroom, setUserClassroom] = useState(localStorage.getItem('_userClassroom') || '');

  // Sync local storage and local state
  useEffect(() => {
    localStorage.setItem('_userClassroom', userClassroom);
  }, [userClassroom]); 

  return (
  <ClassroomContext.Provider value={{ userClassroom, setUserClassroom }}>
    { children }
  </ClassroomContext.Provider>
  );
};

export { ClassroomContext, ClassroomProvider };