import { useState } from "react";
import { CalendarDays, Search } from "lucide-react";

const ReportHeader = ({ onFilter }) => {
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");

  const handleFilter = () => {
    onFilter({ date, search });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 w-full">
      {/* Tarih seçimi */}
      <div className="flex items-center w-full sm:w-1/2 gap-2">
        <CalendarDays size={20} className="text-white" />
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            handleFilter();
          }}
          className="w-full bg-white/20 dark:bg-gray-800 text-sm text-white placeholder-white/80 border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      {/* Arama alanı */}
      <div className="flex items-center w-full sm:w-1/2 gap-2 border border-white/20 rounded-md px-3 py-2 bg-white/20 dark:bg-gray-800">
        <Search size={18} className="text-white/80" />
        <input
          type="text"
          placeholder="Search Report..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilter();
          }}
          className="bg-transparent text-sm text-white placeholder-white/70 outline-none w-full"
        />
      </div>
    </div>
  );
};

export default ReportHeader;
