// src/context/DataContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useUser();
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem("cachedTweets");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const fetchData = async () => {
    if (!user.user_id) return;
    try {
      const response = await axios.get(
        `http://localhost:3001/api/tweets/live?user_id=${user.user_id}`
      );
      setData(response.data);
      localStorage.setItem("cachedTweets", JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setError("Veri alınırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
    localStorage.removeItem("cachedTweets");

    if (!user.user_id) return;
    fetchData();

    
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user.user_id]);

  return (
    <DataContext.Provider value={{ data, loading, error, fetchData }}>
      {children}
    </DataContext.Provider>
  );
};
