import { createContext, useState, useEffect } from "react";

const LoginContext = createContext();

const LoginProvider = ({ children }) => {
  const [loginType, setLoginType] = useState(localStorage.getItem('_loginType') || 'student');

  useEffect(() => {
    localStorage.setItem('_loginType', loginType);
  }, [loginType]); 

  return (
    <LoginContext.Provider value={{ loginType, setLoginType }}>
      { children }
    </LoginContext.Provider>
  );
};

export { LoginContext, LoginProvider };