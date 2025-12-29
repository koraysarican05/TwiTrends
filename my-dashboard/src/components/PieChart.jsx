import React, { useEffect, useState, useContext } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { SearchContext } from "../context/SearchContext";

const colorMap = {
  Positive: "#10B981",
  Negative: "#EF4444",
  Neutral: "#6B7280",
};

const SentimentChart = ({ refreshTrigger }) => {
  const { searchKeyword } = useContext(SearchContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!searchKeyword) {
      setData([]);
      return;
    }

    axios
      .get("http://localhost:3001/api/tweets/sentiment-distribution", {
        params: { keyword: searchKeyword },
      })
      .then((res) => {
        const mapped = res.data.map((item) => ({
          name: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
          value: item.count,
        }));
        setData(mapped);
      })
      .catch((err) => {
        console.error("Duygu verisi alınamadı:", err);
      });
  }, [searchKeyword, refreshTrigger]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-x-auto">
      <div className="w-full h-[300px] sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="75%"
              dataKey="value"
              label={({ cx, cy, midAngle, outerRadius, percent }) => {
                if (percent === 0 || total === 0) return null;
                const RADIAN = Math.PI / 180;
                const radius = outerRadius * 0.6;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                    {`${Math.round(percent * 100)}%`}
                  </text>
                );
              }}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorMap[entry.name] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col items-start mt-4 space-y-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
              style={{ backgroundColor: colorMap[entry.name] || "#8884d8" }}
            ></div>
            <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentChart;
