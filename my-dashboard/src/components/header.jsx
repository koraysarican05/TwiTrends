import { useState } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex justify-between items-center bg-white p-4 shadow-md relative">
      {/* Hamburger Menü */}
      <button className="text-2xl p-2 focus:outline-none">
        &#9776;
      </button>

      {/* Arama Çubuğu */}
      <div className="relative flex-1 mx-4">
        <input
          type="text"
          placeholder="Search for insights..."
          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none text-gray-700 font-semibold"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-500" />
      </div>

      {/* Profil */}
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="text-3xl focus:outline-none">
          <FaUserCircle />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
            <ul>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
