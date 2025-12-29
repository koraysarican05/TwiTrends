import React from "react";
import ReportHeader from "./ReportHeader";
import ReportTable from "./ReportTable";

const ReportsPage = () => {
  return (
    <div className="p-8 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-2">Reports</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You can view or download your analysis reports from here
      </p>

      <ReportHeader />
      <ReportTable />
    </div>
  );
};

export default ReportsPage;
