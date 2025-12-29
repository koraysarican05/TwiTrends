import StatsCard from "./StatsCard";

const StatsCardWrapper = ({ title, value, color }) => {
  return (
    <StatsCard 
      title={title} 
      value={value} 
      color={color}
    />
  );
};

export default StatsCardWrapper;
