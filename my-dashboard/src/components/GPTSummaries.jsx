import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { SearchContext } from "../context/SearchContext";

const GPTSummaries = ({ refreshTrigger }) => {
  const { searchKeyword } = useContext(SearchContext);
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Eğer searchKeyword boşsa veriyi çekme
    if (!searchKeyword) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8003/api/summary?keyword=${searchKeyword}`);
        setSummaries(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("GPT özeti alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    // Sadece scraping sonrası veri çek
    fetchSummaries();
  }, [refreshTrigger, searchKeyword]); // refreshTrigger ve searchKeyword'a bağlı olarak veri çekilir

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        AI-Generated Summaries
      </h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading summaries...
        </p>
      ) : summaries.length === 0 ? (
        <p className="text-sm text-white/70 italic">
          Henüz özet verisi yok. Lütfen arama yapın.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {summaries.map((summary, index) => (
            <motion.div
              key={index}
              className="bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 text-gray-800 dark:text-gray-200 p-6 shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105 w-full flex flex-col justify-between"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedSummary(summary)}
            >
              <h3 className="text-lg font-bold mb-3 truncate">
                {summary.title || "AI Summary"}
              </h3>
              <p className="text-sm flex-grow">
                {summary.summary && summary.summary.length > 100
                  ? summary.summary.substring(0, 100) + "..."
                  : summary.summary || "Özet bulunamadı"}
              </p>
              <button
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSummary(summary);
                }}
              >
                Read More →
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {selectedSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 rounded-lg shadow-xl max-w-lg w-full relative">
            <h3 className="text-lg font-semibold mb-2">
              {selectedSummary.title || "AI Summary"}
            </h3>
            <div className="overflow-y-auto max-h-96 space-y-3 text-sm leading-relaxed">
              <p><strong>Tweet:</strong> {selectedSummary.tweet}</p>
              <p><strong>Özet:</strong> {selectedSummary.summary}</p>
              <p><strong>Madde Madde:</strong> {selectedSummary.bullet}</p>
              <p><strong>Tematik Özet:</strong> {selectedSummary.theme}</p>
              <p><strong>Anahtar Kelimeler:</strong> {selectedSummary.keywords}</p>
              <p className="font-semibold text-sm mt-2">
                Sentiment Analysis: {selectedSummary.sentiment}
              </p>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setSelectedSummary(null)}
            >
              ✕
            </button>
            <button
              className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              onClick={() => setSelectedSummary(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPTSummaries;
