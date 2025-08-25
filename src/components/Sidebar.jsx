import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Home, Heart, User, LogOut, PawPrint, MessageSquare } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, onClose, onTabChange }) {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserName(data.name || "User");
        }
      }
    };
    if (isOpen) fetchUserName();
  }, [isOpen]);

  const handleTabClick = async (value) => {
    if (value === "logout") {
      await auth.signOut();
      navigate("/");
    } else if (value === "dashboard") {
      navigate("/user-dashboard");
    } else if (value === "favourites") {
      navigate("/favourites")
    } else if (value === "profile") {
      navigate("/user-profile");
    } else if (value === "blog") {
      navigate("/blog");
    } else {
      onTabChange(value);
    }
    onClose();
  };

  const tabs = [
    { label: "Dashboard", value: "dashboard", icon: <Home size={20} /> },
    { label: "My Adoptions", value: "myAdoptions", icon: <PawPrint size={20} /> },
    { label: "Favourites", value: "favourites", icon: <Heart size={20} /> },
    { label: "Community", value: "blog", icon: <MessageSquare size={20} /> },
    { label: "Profile", value: "profile", icon: <User size={20} /> },
    { label: "Logout", value: "logout", icon: <LogOut size={20} /> },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={onClose}
        ></div>
      )}

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-80 bg-[#FFFFFC] z-50 shadow-xl p-6 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Welcome back</p>
            <h2 className="text-xl font-bold text-[#FF7F11]">Hello, {userName}</h2>
          </div>
          <button onClick={onClose} className="text-[#FF1B1C] hover:scale-110 transition">
            <X size={24} />
          </button>
        </div>

        {/* Tab Items */}
        <ul className="space-y-3 mt-4">
          {tabs.map((tab) => (
            <li
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.05] active:scale-95"
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </li>
          ))}
        </ul>

        {/* Footer Gradient Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] rounded-t-xl mt-6"></div>
      </motion.div>
    </>
  );
}
