import { useState, useEffect } from "react";
import ReportHeader from "./ReportHeader";
import ReportTable from "./ReportTable";
import axios from "axios";

const ReportsPage = () => {
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // Backend'den raporları almak
  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/reports");
      const parsedReports = res.data.map((report) => ({
        name: report.name, // report.name burada direkt keyword ve timestamp ile gelir
        date: report.date,
        format: report.format.toUpperCase(),
        url: report.url, // Indirme linki (CSV ya da PDF)
        filename: report.filename, // Dosya adı
      }));
      setAllReports(parsedReports);
      setFilteredReports(parsedReports);
    } catch (err) {
      console.error("Raporlar alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchReports();

    const handleFocus = () => {
      fetchReports();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Filtreleme işlemi
  const handleFilter = ({ date, search }) => {
    let filtered = allReports;
    if (date) {
      filtered = filtered.filter((report) => report.date.includes(date));
    }
    if (search) {
      filtered = filtered.filter((report) =>
        report.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredReports(filtered);
  };

  // Rapor silme işlemi
  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://localhost:3001/reports/${filename}`);
      fetchReports();
    } catch (error) {
      console.error("Rapor silinemedi:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-16 px-4 sm:px-6 md:px-8 bg-transparent transition-all duration-300">
      <div className="w-full max-w-7xl bg-white/10 backdrop-blur-md border border-white/20 px-4 sm:px-10 py-6 sm:py-10 rounded-2xl shadow-xl">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1 text-white">Reports</h1>
          <p className="text-white/70 text-sm sm:text-base">
            You can view or download your analysis reports from here
          </p>
        </div>

        <ReportHeader onFilter={handleFilter} />

        <div className="overflow-x-auto mt-6">
          <ReportTable reports={filteredReports} handleDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
