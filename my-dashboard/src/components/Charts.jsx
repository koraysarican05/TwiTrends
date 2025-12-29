import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { day: "10 Mar", tweetCount: 1200 },
  { day: "11 Mar", tweetCount: 1500 },
  { day: "12 Mar", tweetCount: 1700 },
  { day: "13 Mar", tweetCount: 1800 },
  { day: "14 Mar", tweetCount: 2200 },
  { day: "15 Mar", tweetCount: 2600 },
  { day: "16 Mar", tweetCount: 3000 },
];

const Charts = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Last 7 Days Tweet Count</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="day" tick={{ fill: "#374151", fontSize: 14 }} />
          <YAxis tick={{ fill: "#374151", fontSize: 14 }} domain={[0, "auto"]} tickCount={7} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="tweetCount" 
            stroke="#4F46E5" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2, fill: "#4F46E5" }} 
            activeDot={{ r: 6, strokeWidth: 3, fill: "#4F46E5" }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
