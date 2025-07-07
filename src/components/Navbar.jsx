import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, UserCircle } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Sidebar from "./Sidebar"; // 👈 Make sure this component exists

export default function Navbar({ onTabChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Sidebar toggle

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          setIsAdmin(role === "admin");
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      if (isDarkTheme) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    }
  }, [isDarkTheme, location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const navItems = [
    { to: "/Adopt", label: "Adopt" },
    { to: "/About", label: "About" },
    { to: "/Contact", label: "Contact" },
  ];

  return (
    <>
      <AnimatePresence>
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed z-50 w-full px-4 sm:px-8 pt-4.5 pb-4.5 transition-all duration-500 ${
            location.pathname === "/" && isDarkTheme
              ? scrolled
                ? "bg-black/80 backdrop-blur-xl border-b border-yellow-400/30 shadow-2xl shadow-yellow-400/10"
                : "bg-black/40 backdrop-blur-md border-b border-yellow-400/20"
              : scrolled
              ? "bg-white/80 backdrop-blur-xl border-b border-[#FF7F11]/30 shadow-2xl shadow-[#FF7F11]/10"
              : "bg-white/40 backdrop-blur-md border-b border-[#FF7F11]/20"
          }`}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className={`font-extrabold text-xl sm:text-2xl transition-all duration-300 ${
                  location.pathname === "/" && isDarkTheme
                    ? "text-yellow-400 drop-shadow-lg"
                    : "text-[#FF7F11] drop-shadow-lg"
                }`}
              >
                PAWTHWAY🐾
              </Link>
            </motion.div>

            {location.pathname === "/" && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
                  location.pathname === "/" && isDarkTheme
                    ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/30"
                    : "bg-[#FF7F11]/20 text-[#FF7F11] hover:bg-[#FF7F11]/30 border border-[#FF7F11]/30"
                }`}
              >
                {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="sm:hidden focus:outline-none p-1.5 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X
                  size={20}
                  className={
                    location.pathname === "/" && isDarkTheme
                      ? "text-yellow-400"
                      : "text-[#FF7F11]"
                  }
                />
              ) : (
                <Menu
                  size={20}
                  className={
                    location.pathname === "/" && isDarkTheme
                      ? "text-yellow-400"
                      : "text-[#FF7F11]"
                  }
                />
              )}
            </motion.button>

            <nav className="hidden sm:flex space-x-6 items-center">
              {navItems.map((item) => (
                <motion.div
                  key={item.to}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.to}
                    className={`font-semibold text-base transition-all duration-300 relative group px-2.5 py-1.5 rounded-lg backdrop-blur-sm ${
                      location.pathname === "/" && isDarkTheme
                        ? "text-white hover:text-yellow-400 hover:bg-yellow-400/10"
                        : "text-[#7a7568] hover:text-[#FF7F11] hover:bg-[#FF7F11]/10"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                        location.pathname === "/" && isDarkTheme
                          ? "bg-yellow-400"
                          : "bg-[#FF7F11]"
                      }`}
                    />
                  </Link>
                </motion.div>
              ))}

              {/* Admin Dashboard */}
              {user && isAdmin && (
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/admin-dashboard"
                    className={`font-semibold text-base transition-all duration-300 relative group px-2.5 py-1.5 rounded-lg backdrop-blur-sm ${
                      location.pathname === "/" && isDarkTheme
                        ? "text-white hover:text-yellow-400 hover:bg-yellow-400/10"
                        : "text-[#7a7568] hover:text-[#FF7F11] hover:bg-[#FF7F11]/10"
                    }`}
                  >
                    Dashboard
                    <span
                      className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                        location.pathname === "/" && isDarkTheme
                          ? "bg-yellow-400"
                          : "bg-[#FF7F11]"
                      }`}
                    />
                  </Link>
                </motion.div>
              )}

              {/* User Dashboard Icon + Sidebar Trigger */}
              {user && !isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center"
                >
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`flex items-center justify-center ml-1 transition-all duration-300 ${
                      location.pathname === "/" && isDarkTheme
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-[#FF7F11] hover:text-[#FF4F11]"
                    }`}
                    title="User Menu"
                  >
                    <UserCircle size={22} strokeWidth={2} />
                  </button>
                </motion.div>
              )}

              {/* Logout/Login */}
              {user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`ml-4 px-4 py-2 font-semibold rounded-full transition-all duration-300 backdrop-blur-sm border text-sm ${
                    location.pathname === "/" && isDarkTheme
                      ? "bg-yellow-400/90 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-400/25 border-yellow-400/30"
                      : "bg-[#FF1B1C]/90 text-white hover:bg-[#FF1B1C] shadow-lg shadow-[#FF1B1C]/25 border-[#FF1B1C]/30"
                  }`}
                >
                  Logout
                </motion.button>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/Login"
                    className={`ml-4 px-4 py-2 font-semibold rounded-full transition-all duration-300 backdrop-blur-sm border text-sm ${
                      location.pathname === "/" && isDarkTheme
                        ? "bg-yellow-400/90 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-400/25 border-yellow-400/30"
                        : "bg-[#FF7F11]/90 text-white hover:bg-[#FF7F11] shadow-lg shadow-[#FF7F11]/25 border-[#FF7F11]/30"
                    }`}
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
            </nav>
          </div>
        </motion.header>
      </AnimatePresence>

      {/* 👉 Sidebar Component Mounted */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTabChange={onTabChange}
      />
    </>
  );
}
