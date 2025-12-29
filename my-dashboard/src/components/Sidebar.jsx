import { Home, FileText, Users, Menu, Shield } from "lucide-react";
import { useSidebar } from "../context/Sidebarcontext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

 
  useEffect(() => {
    const storedRole = localStorage.getItem("role") || sessionStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home size={28} />,
      path: "/",
    },
    {
      name: "Reports",
      icon: <FileText size={28} />,
      path: "/reports",
    },
    {
      name: "Account Management",
      icon: <Users size={28} />,
      path: "/account",
    },
  ];

 
  if (role === "admin") {
    menuItems.push({
      name: "Admin Panel",
      icon: <Shield size={28} />,
      path: "/admin-panel",
    });
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-50 bg-gray-900 text-white 
        ${isSidebarOpen ? "w-64" : "w-20"} 
        h-full p-4 flex-shrink-0 
        transition-all duration-300 ease-in-out`}
    >
      {/* Menu Open/Close Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="mb-6 focus:outline-none"
      >
        <Menu size={28} className="transition-all duration-300" />
      </button>

      {/* Header */}
      <h2
        className={`text-xl font-bold mb-6 transition-all duration-300 ease-in-out transform
          ${isSidebarOpen ? "block opacity-100 translate-x-0" : "hidden opacity-0 -translate-x-3"}`}
      >
        TwiTrends
      </h2>

      {/* Menu Objects */}
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-md transition-all duration-300
                hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-600
                ${location.pathname === item.path ? "bg-gradient-to-r from-purple-700 to-indigo-600" : ""}
                ${isSidebarOpen ? "text-base" : "text-xl"}`}
            >
              {item.icon}
              {isSidebarOpen && (
                <span className="transition-all duration-500">{item.name}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

