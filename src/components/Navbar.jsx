import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, UserCircle } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Sidebar from "./Sidebar"; // 👈 Make sure this component exists
import { useDarkMode } from "../contexts/DarkModeContext";

export default function Navbar({ onTabChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Sidebar toggle
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const navigate = useNavigate();

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

  // Dark mode is now handled by the context, so we don't need this effect

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // toggleTheme is now handled by the context

  const navItems = [
    { to: "/Adopt", label: "Adopt" },
    { to: "/Blog", label: "Community" },
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
            isDarkMode
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
                  isDarkMode
                    ? "text-yellow-400 drop-shadow-lg"
                    : "text-[#FF7F11] drop-shadow-lg"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                PAWTHWAY🐾
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
                isDarkMode
                  ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/30"
                  : "bg-[#FF7F11]/20 text-[#FF7F11] hover:bg-[#FF7F11]/30 border border-[#FF7F11]/30"
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="sm:hidden focus:outline-none p-1.5 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X
                  size={20}
                  className={isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}
                />
              ) : (
                <Menu
                  size={20}
                  className={isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}
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
                      isDarkMode
                        ? "text-white hover:text-yellow-400 hover:bg-yellow-400/10"
                        : "text-[#7a7568] hover:text-[#FF7F11] hover:bg-[#FF7F11]/10"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                        isDarkMode ? "bg-yellow-400" : "bg-[#FF7F11]"
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
                      isDarkMode
                        ? "text-white hover:text-yellow-400 hover:bg-yellow-400/10"
                        : "text-[#7a7568] hover:text-[#FF7F11] hover:bg-[#FF7F11]/10"
                    }`}
                  >
                    Dashboard
                    <span
                      className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                        isDarkMode ? "bg-yellow-400" : "bg-[#FF7F11]"
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
                      isDarkMode
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
                    isDarkMode
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
                      isDarkMode
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden fixed top-[64px] left-0 w-full bg-white border-b border-[#FF7F11]/20 z-40 shadow-lg"
          >
            <ul className="flex flex-col py-4 px-6 gap-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block w-full py-2 px-2 rounded text-[#FF7F11] font-semibold text-lg hover:bg-[#FF7F11]/10 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {user && isAdmin && (
                <li>
                  <Link
                    to="/admin-dashboard"
                    className="block w-full py-2 px-2 rounded text-[#FF1B1C] font-semibold text-lg hover:bg-[#FF1B1C]/10 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {user && !isAdmin && (
                <li>
                  <button
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full py-2 px-2 rounded text-[#FF7F11] font-semibold text-lg hover:bg-[#FF7F11]/10 transition"
                  >
                    <UserCircle size={20} /> User Menu
                  </button>
                </li>
              )}
              <li>
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full py-2 px-2 rounded bg-[#FF1B1C] text-white font-semibold text-lg hover:bg-[#FF7F11] hover:text-white transition"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/Login"
                    className="w-full block py-2 px-2 rounded bg-[#FF7F11] text-white font-semibold text-lg hover:bg-[#FF1B1C] transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </li>
            </ul>
          </motion.nav>
        )}
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
