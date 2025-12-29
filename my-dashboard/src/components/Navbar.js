import React from "react";
import { FaUserCircle } from "react-icons/fa";
import UserProfile from "./UserProfile";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <h1 className="text-2xl font-semibold tracking-wide">Dashboard</h1>

      <div className="flex items-center space-x-4">
        <UserProfile />
      </div>
    </nav>
  );
};

export default Navbar;
