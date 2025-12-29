import { useState, useEffect } from "react";
import { Search, CalendarDays } from "lucide-react";
import { useSearch } from "../context/SearchContext";
import axios from "axios";

const SearchBar = ({ onDateRangeChange, onSearchComplete }) => {
  const { searchKeyword, setSearchKeyword } = useSearch();
  const [selectedOption, setSelectedOption] = useState("last7days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const getDateRange = () => {
    const today = new Date().toISOString().split("T")[0];
    if (selectedOption === "last7days") {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return { start: lastWeek, end: today };
    } else if (selectedOption === "last30days") {
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return { start: lastMonth, end: today };
    } else if (selectedOption === "custom" && customStart && customEnd) {
      return { start: customStart, end: customEnd };
    }
    return null;
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  useEffect(() => {
    const range = getDateRange();
    if (range) {
      onDateRangeChange(range);
    }
  }, [selectedOption, customStart, customEnd, onDateRangeChange]);

  const handleCustomChange = (start, end) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  const handleSearch = async () => {
  if (!searchKeyword.trim()) return;

  const dateRange = getDateRange();
  if (!dateRange) return;

  const user_id = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");

  try {
    
    const scrapeRes = await axios.post("http://localhost:3001/api/scrape", {
      keyword: searchKeyword,
      startDate: dateRange.start,
      endDate: dateRange.end,
      user_id: user_id,
    });

    console.log("[✅] Scraper tetiklendi:", scrapeRes.data);

    
    const reportRes = await axios.post("http://localhost:3001/generate-report", {
      keyword: searchKeyword, 
    });

    console.log("[✅] Rapor oluşturuldu:", reportRes.data);

    
    if (onSearchComplete) {
      setTimeout(() => {
        onSearchComplete();
      }, 1500);
    }

    
    console.log('Raporlar:', reportRes.data);
    
  } catch (err) {
    console.error("[❌] Arama hatası:", err.response?.data || err.message);
  }
};


  
  

  const handleDateInput = (e, setDate) => {
    if (e.target.value.length <= 10) {
      setDate(e.target.value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between bg-white shadow-lg rounded-xl px-4 py-4 w-full max-w-5xl mx-auto border border-gray-300 gap-4 sm:gap-6">
      <div className="flex items-center w-full sm:flex-1">
        <Search size={20} className="text-gray-600 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search for tweets or insights..."
          className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>

      <div className="flex items-center w-full sm:w-auto sm:ml-4">
        <CalendarDays size={20} className="text-gray-600 mr-2 shrink-0" />
        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className="outline-none cursor-pointer bg-transparent border border-gray-200 text-gray-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {selectedOption === "custom" && (
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={customStart}
            onChange={(e) => handleDateInput(e, (val) => handleCustomChange(val, customEnd))}
            className="outline-none bg-white text-gray-700 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => handleDateInput(e, (val) => handleCustomChange(customStart, val))}
            className="outline-none bg-white text-gray-700 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;

