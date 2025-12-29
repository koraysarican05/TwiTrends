// src/components/LiveTweets.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { SearchContext } from "../context/SearchContext";
import { useUser } from "../context/UserContext";    // ✅ UserContext eklendi

const LiveTweets = ({ refreshTrigger }) => {
  const { searchKeyword } = useContext(SearchContext);
  const { user } = useUser();                         // ✅ User verisi alındı
  const [searchTerm, setSearchTerm] = useState("");
  const [tweets, setTweets] = useState([]);
  const [filteredTweets, setFilteredTweets] = useState([]);

  const fetchTweets = () => {
    if (!user.user_id || !searchKeyword) return;
  
    axios
      .get(`http://localhost:3001/api/tweets/live`, {
        params: {
          user_id: user.user_id,
          search_keyword: searchKeyword,
        },
      })
      .then((res) => {
        const sorted = res.data
          .sort((a, b) => new Date(b.tweet_date) - new Date(a.tweet_date))
          .slice(0, 10); // ilk 10 tweet
  
        setTweets(sorted);          // tüm tweet'leri sakla
        setFilteredTweets(sorted);  // arama kutusuna göre gösterilecekler
      })
      .catch((err) => {
        console.error("Tweet verisi alınamadı:", err);
      });
  };

  useEffect(() => {
    if (!user.user_id || !searchKeyword) {
      setTweets([]);
      setFilteredTweets([]);
      return;
    }

    fetchTweets();
  }, [refreshTrigger, searchKeyword, user.user_id]);  //user.user_id takibi eklendi

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  
    const filtered = tweets.filter((tweet) =>
      tweet.content.toLowerCase().includes(term.toLowerCase())
    );
  
    setFilteredTweets(filtered);
  };
  

  return (
    <>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-300 mb-3 sm:mb-4">
        Live Tweets
      </h2>

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search tweets..."
        className="w-full p-2 sm:p-2.5 mb-3 sm:mb-4 rounded-md bg-white/20 text-sm sm:text-base text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
      />

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar max-h-[400px] sm:max-h-[500px]">
        {filteredTweets.length > 0 ? (
          filteredTweets.map((tweet) => (
            <div
              key={tweet.tweet_id}
              className="p-3 sm:p-4 rounded-lg bg-white/20 backdrop-blur-md border border-white/10 text-gray-800 dark:text-gray-300 hover:bg-white/30 hover:shadow-inner transition text-sm sm:text-base"
            >
              <p className="mb-1 break-words">{tweet.content}</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tweet.tweet_date
                  ? new Date(tweet.tweet_date).toLocaleString("tr-TR", {
                      hour12: false,
                      timeZone: "Europe/Istanbul",
                    })
                  : "Tarih bulunamadı"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            {searchKeyword
              ? "Uygun tweet bulunamadı."
              : "Tweet verisi için arama yapmalısınız."}
          </p>
        )}
      </div>
    </>
  );
};

export default LiveTweets;
