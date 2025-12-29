import { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import StatsCardWrapper from "../components/StatsCardWrapper";
import LineChartComponent from "../components/LineChart";
import PieChart from "../components/PieChart";
import WordCloudComponent from "../components/WordCloud";
import TrendingTopics from "../components/TrendingTopics";
import GPTSummaries from "../components/GPTSummaries";
import LiveTweets from "../components/LiveTweets";
import { motion } from "framer-motion";
import { SearchContext } from "../context/SearchContext";
import { useUser } from "../context/UserContext";  

const Dashboard = () => {
  const { searchKeyword } = useContext(SearchContext);
  const { user } = useUser();  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [tweetStats, setTweetStats] = useState({ total: 0, positive: 0, negative: 0, neutral: 0 });
  const [lineData, setLineData] = useState([]);
  const [refreshToken, setRefreshToken] = useState(Date.now());

  // Tweet istatistiklerini getir
  const fetchStats = () => {
    if (!searchKeyword || !user?.user_id) {
      setTweetStats({ total: 0, positive: 0, negative: 0, neutral: 0 });
      return;
    }

    axios
      .get("http://localhost:3001/api/tweets/statistics", {
        params: {
          user_id: user.user_id,
          search_keyword: searchKeyword,
        },
      })
      .then((res) => setTweetStats(res.data))
      .catch((err) =>
        console.error("Tweet statistics API çağrısı başarısız:", err)
      );
  };

  
  const fetchLineChartData = (start, end, keyword) => {
    if (!start || !end || !keyword) {
      setLineData([]); 
      return;
    }

    axios
      .get("http://localhost:3001/api/tweets/count-by-date", {
        params: { startDate: start, endDate: end, keyword: keyword }, 
      })
      .then((res) => {
        const formatted = res.data.map((item) => ({
          day: item.tweet_date.split("T")[0],
          tweetCount: item.tweet_count,
        }));
        setLineData(formatted);
      })
      .catch((err) =>
        console.error("Line chart verisi alınamadı:", err.message)
      );
  };

  
  useEffect(() => {
    fetchStats();
  }, [refreshToken]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchLineChartData(dateRange.start, dateRange.end, searchKeyword); 
    }
  }, [dateRange, refreshToken, searchKeyword]);

  
  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
  }, []);

 
  const handleSearchComplete = useCallback(() => {
    fetchStats();
    if (dateRange.start && dateRange.end) {
      fetchLineChartData(dateRange.start, dateRange.end, searchKeyword); 
    }
    setRefreshToken(Date.now());
  }, [dateRange.start, dateRange.end, searchKeyword]); 

 
  const statTitles = [
    "Total Tweets",
    "Positive Tweets",
    "Negative Tweets",
    "Neutral Tweets",
  ];

  return (
    <div className="min-h-screen flex flex-col p-6 animate-gradient bg-[length:300%_300%] bg-transparent transition-all duration-300">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <SearchBar
          className="w-full sm:w-auto"
          onDateRangeChange={handleDateRangeChange}
          onSearchComplete={handleSearchComplete}
        />
      </div>

      <motion.h1
        className="text-4xl font-bold text-center my-6 text-white tracking-wide relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Dashboard Overview
        <span className="block w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-2 rounded-full"></span>
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statTitles.map((title, index) => {
          const value = {
            "Total Tweets": tweetStats.total,
            "Positive Tweets": tweetStats.positive,
            "Negative Tweets": tweetStats.negative,
            "Neutral Tweets": tweetStats.neutral,
          }[title];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <StatsCardWrapper title={title} value={value} index={index} />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[350px]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Tweet Count Graph
          </h2>
          <LineChartComponent data={lineData} />
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[350px]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Sentiment Distribution
          </h2>
          <PieChart summary={tweetStats} refreshTrigger={refreshToken} />
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[350px]">
          <h2 className="text-xl font-semibold text-white mb-4">Word Cloud</h2>
          <WordCloudComponent refreshTrigger={refreshToken} dateRange={dateRange} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[350px]">
          <GPTSummaries refreshTrigger={refreshToken} />
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[350px]">
          <LiveTweets refreshTrigger={refreshToken} />
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[350px]">
          <TrendingTopics refreshTrigger={refreshToken} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
