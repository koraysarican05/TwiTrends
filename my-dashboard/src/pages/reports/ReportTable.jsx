import { Download, FileText, FileType2, Trash2 } from "lucide-react";

const ReportTable = ({ reports, handleDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-white/10">
      <table className="min-w-[600px] w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-700 uppercase text-gray-600 dark:text-gray-300 text-sm">
          <tr>
            <th className="px-6 py-3">Report Name</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Format</th>
            <th className="px-6 py-3">Download</th>
            <th className="px-6 py-3">Delete</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((report, index) => {
              const { name, date, format, url, filename } = report;

              const downloadUrl = url
                ? `http://localhost:3001${url}`
                : "http://localhost:3001/default-report-url";

              const formattedDate =
                date && date !== "Invalid Date"
                  ? new Date(date).toLocaleString("tr-TR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Unknown";

              const FormatIcon =
                format.toLowerCase() === "pdf" ? FileText : FileType2;

              return (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <td className="px-6 py-4 font-semibold">{name}</td>
                  <td className="px-6 py-4">{formattedDate}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <FormatIcon size={16} />
                    {format}
                  </td>
                  <td className="px-6 py-4">
                    {downloadUrl ? (
                      <button
                        onClick={() => window.open(downloadUrl, "_blank")}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Download size={18} />
                      </button>
                    ) : (
                      <span className="text-red-500 italic text-sm">URL yok</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(filename)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={5}
                className="text-center px-6 py-6 italic text-gray-400"
              >
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
