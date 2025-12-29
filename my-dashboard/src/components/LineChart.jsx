import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
} from "recharts";


const generateFullDateRange = (start, end) => {
  const dateList = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    dateList.push(new Date(current).toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dateList;
};


const fillMissingDates = (data) => {
  if (!data || data.length === 0) return [];

  const dates = generateFullDateRange(data[0].day, data[data.length - 1].day);

  const dataMap = Object.fromEntries(data.map(d => [d.day, d.tweetCount]));

  return dates.map(date => ({
    day: date,
    tweetCount: dataMap[date] || 0,
  }));
};

const LineChartComponent = ({ data }) => {
  
  const normalizedData = data.map(d => ({
    day: d.day.slice(0, 10), 
    tweetCount: d.tweetCount
  }));

  const completeData = fillMissingDates(normalizedData);

  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={completeData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />

          <XAxis
            dataKey="day"
            tick={{ fill: "#E5E7EB", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            tick={{ fill: "#E5E7EB", fontSize: 12 }}
            tickMargin={8}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#1f2937",
              color: "#ffffff",
              boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#c084fc" }}
            itemStyle={{ color: "#ffffff" }}
          />

          <Area
            type="monotone"
            dataKey="tweetCount"
            stroke="#4F46E5"
            fill="url(#colorGradient)"
            strokeWidth={3}
            activeDot={{ r: 6, fill: "#4F46E5", strokeWidth: 2 }}
          />

          <Line
            type="monotone"
            dataKey="tweetCount"
            stroke="#4F46E5"
            strokeWidth={3}
            dot={{ r: 4, fill: "#4F46E5", strokeWidth: 1 }}
            activeDot={{ r: 8, fill: "#4F46E5", strokeWidth: 2 }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ color: "#E5E7EB" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;

