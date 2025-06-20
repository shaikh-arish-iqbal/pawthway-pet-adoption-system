import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed z-20 w-full bg-black px-6 sm:px-10 py-4 sm:py-5 shadow-lg"
    >
      <div className="flex justify-between items-center">
        <Link
          to="/"
          className="text-[#FF7F11] font-extrabold text-2xl sm:text-3xl"
        >
          PAWTHWAY🐾
        </Link>

        {/* Hamburger menu (mobile) */}
        <button
          className="sm:hidden text-[#FF7F11] focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden sm:flex space-x-6 items-center">
          <Link
            to="/Adopt"
            className="text-[#FF7F11] font-semibold text-lg hover:underline transition transform hover:scale-110"
          >
            Adopt
          </Link>
          <Link
            to="/About"
            className="text-[#FF7F11] font-semibold text-lg hover:underline transition transform hover:scale-110"
          >
            About
          </Link>
          <Link
            to="/Contact"
            className="text-[#FF7F11] font-semibold text-lg hover:underline transition transform hover:scale-110"
          >
            Contact
          </Link>

          {/* ✅ Dashboard link for admin */}
          {user && isAdmin && (
            <Link
              to="/AdminDashboard"
              className="text-[#FF7F11] font-semibold text-lg hover:underline transition transform hover:scale-110"
            >
              Dashboard
            </Link>
          )}

          {/* ✅ Logout/Login buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-[#FF1B1C] text-white text-base font-semibold rounded-full hover:bg-[#e60000] transition transform hover:scale-105 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/Login"
              className="ml-4 px-4 py-2 bg-[#FF7F11] text-black font-semibold rounded-full hover:bg-[#FF1B1C] hover:text-white transition transform hover:scale-105"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="sm:hidden mt-4 flex flex-col space-y-4 text-center">
          <Link
            to="/Adopt"
            onClick={() => setMenuOpen(false)}
            className="text-[#FF7F11] font-semibold text-lg hover:underline"
          >
            Adopt
          </Link>
          <Link
            to="/About"
            onClick={() => setMenuOpen(false)}
            className="text-[#FF7F11] font-semibold text-lg hover:underline"
          >
            About
          </Link>
          <Link
            to="/Contact"
            onClick={() => setMenuOpen(false)}
            className="text-[#FF7F11] font-semibold text-lg hover:underline"
          >
            Contact
          </Link>

          {/* ✅ Dashboard link (mobile) */}
          {user && isAdmin && (
            <Link
              to="/admin-dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-[#FF7F11] font-semibold text-lg hover:underline"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="inline-block mx-auto px-4 py-2 bg-[#FF1B1C] text-white font-semibold rounded-full hover:bg-[#e60000] transition cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/Login"
              onClick={() => setMenuOpen(false)}
              className="inline-block mx-auto px-4 py-2 bg-[#FF7F11] text-black font-semibold rounded-full hover:bg-[#FF1B1C] hover:text-white transition"
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </motion.header>
  );
}
