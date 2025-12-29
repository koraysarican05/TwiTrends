import { motion } from "framer-motion";
import { FaChartBar, FaSmile, FaFrown, FaMeh } from "react-icons/fa";

const StatsCard = ({ title, value, color, icon, index }) => {
  return (
    <motion.div
      className={`p-4 sm:p-5 md:p-6 min-h-[130px] rounded-2xl ${color} shadow-xl text-white transition-all duration-500 transform hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-white/30 w-full cursor-pointer relative flex flex-col justify-between`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
      }}
    >
      {icon && (
        <div className="absolute top-4 right-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-90 drop-shadow-lg">
          {icon}
        </div>
      )}

      {/* Header */}
      <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-wide uppercase text-left opacity-90 drop-shadow">
        {title}
      </h4>

      {/* Value */}
      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mt-4 drop-shadow-md text-left">
        {value !== undefined ? value : <span className="animate-pulse">...</span>}
      </p>
    </motion.div>
  );
};

const StatsCardWrapper = ({ title, value, index }) => {
  const cardData = {
    "Total Tweets": {
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      icon: <FaChartBar />,
    },
    "Positive Tweets": {
      color: "bg-gradient-to-br from-green-500 to-green-700",
      icon: <FaSmile />,
    },
    "Negative Tweets": {
      color: "bg-gradient-to-br from-red-500 to-red-700",
      icon: <FaFrown />,
    },
    "Neutral Tweets": {
      color: "bg-gradient-to-br from-gray-500 to-gray-700",
      icon: <FaMeh />,
    },
  };

  if (!cardData[title]) {
    console.error(`StatsCardWrapper: Geçersiz başlık "${title}"!`);
    return null;
  }

  return (
    <StatsCard
      title={title}
      value={value}
      color={cardData[title].color}
      icon={cardData[title].icon}
      index={index}
    />
  );
};

export default StatsCardWrapper;

