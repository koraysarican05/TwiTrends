import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import { useSidebar } from "../context/Sidebarcontext";

const Layout = () => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="relative">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 
        ${isSidebarOpen ? "ml-64" : "ml-20"} 
        bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 bg-400 animate-gradient`}
      >
        <div className="flex justify-end p-4">
          <UserProfile />
        </div>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
