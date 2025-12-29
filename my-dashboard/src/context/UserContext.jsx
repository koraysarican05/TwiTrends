// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    user_id: null,
    role: null,
    token: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (user_id && role && token) {
      setUser({ user_id, role, token });
    }
    setIsInitialized(true);
  }, []);

  const clearUser = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser({ user_id: null, role: null, token: null });
  };

  if (!isInitialized) return null;

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
