import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { SearchContext } from "../context/SearchContext";

const TrendingTopics = ({ refreshTrigger }) => {
  const { searchKeyword } = useContext(SearchContext);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (!searchKeyword) {
      setTopics([]);
      return;
    }

    
    axios
      .get("http://localhost:3001/api/tweets/trending-hashtags", {
        params: { keyword: searchKeyword },
      })
      .then((res) => {
        setTopics(res.data);
      })
      .catch((err) => {
        console.error("Trending hashtag verisi alınamadı:", err);
      });
  }, [searchKeyword, refreshTrigger]); 

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Trending Topics
      </h2>

      {topics.length > 0 ? (
        <ul className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {topics.map((topic, index) => (
            <motion.li
              key={index}
              className={`flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                index === 0
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-bold shadow-md"
                  : index === 1
                  ? "bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold shadow-md"
                  : index === 2
                  ? "bg-gradient-to-r from-pink-600 to-pink-400 text-white font-semibold shadow-md"
                  : "bg-white/20 dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/10 hover:shadow-inner"
              } hover:scale-105`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-medium">#{topic.hashtag}</span>
              <span className="text-sm font-semibold opacity-80">
                {topic.tweet_count} tweets
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic text-sm">
          {searchKeyword
            ? "Uygun trending konu bulunamadı."
            : "Trending konuları görmek için arama yapın."}
        </p>
      )}
    </>
  );
};

export default TrendingTopics;
