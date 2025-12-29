import { useEffect, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import React from "react";

const UserProfile = () => {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative flex justify-end items-center px-4 py-4 md:px-6 md:py-6 z-50">
      <Menu as="div" className="relative" ref={menuRef}>
        <Menu.Button className="flex items-center space-x-2 focus:outline-none">
          <UserCircleIcon className="w-10 h-10 md:w-12 md:h-12 text-gray-600 dark:text-gray-300" />
          <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform" />
        </Menu.Button>

        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-150"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className="absolute top-full right-0 mt-3 w-64 sm:w-60 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 py-2 z-[1000]"
          >
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate("/account")}
                  className={`${
                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                  } block w-full px-4 py-3 text-gray-700 dark:text-gray-200 text-sm font-medium text-left`}
                >
                  Account Management
                </button>
              )}
            </Menu.Item>
            <hr className="border-gray-200 dark:border-gray-700 my-1" />
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? "bg-red-100 dark:bg-red-700" : ""
                  } block w-full px-4 py-3 text-red-600 dark:text-red-400 text-sm font-medium text-left`}
                >
                  Log Out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default UserProfile;
