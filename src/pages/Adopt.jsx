import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import MyFooter from "../components/Footer";
import PetCard from "../components/PetCard";
import PetFilter from "../components/PetFilter";
import { useLocation } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";

export default function Adopt() {
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { isDarkMode } = useDarkMode();

  // Set initial searchQuery from URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    setSearchQuery(search);
  }, [location.search]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "pets"));
        const petList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petList);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      !searchQuery ||
      pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type?.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesSearch &&
      (!filters.city || pet.location === filters.city) &&
      (!filters.type || pet.type === filters.type) &&
      (!filters.breed || pet.breed === filters.breed)
    );
  });

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#2d2d2d] text-white"
          : "bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]"
      }`}
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-6 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute top-20 left-20 w-32 h-32 opacity-10 rounded-full ${
              isDarkMode ? "bg-yellow-400" : "bg-[#FF7F11]"
            }`}
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute bottom-20 right-20 w-24 h-24 opacity-10 rounded-full ${
              isDarkMode ? "bg-yellow-400" : "bg-[#FF1B1C]"
            }`}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-4xl md:text-6xl font-black mb-6 ${
              isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
            }`}
          >
            Find Your Perfect
            <br />
            <span className="text-[#FF7F11]">Furry Friend</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`text-xl mb-8 max-w-2xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-[#7a7568]"
            }`}
          >
            Browse through our wonderful pets looking for their forever homes.
            Every adoption saves two lives - the one you adopt and the one you
            make room for.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, breed, or type..."
                className={`w-full px-6 py-4 text-lg rounded-full border-2 backdrop-blur-sm focus:outline-none focus:ring-4 shadow-lg ${
                  isDarkMode
                    ? "border-yellow-400 bg-black/90 text-white focus:ring-yellow-400/30 focus:border-yellow-400"
                    : "border-[#FF7F11] bg-white/90 text-black focus:ring-[#FF7F11]/30 focus:border-[#FF7F11]"
                }`}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className={`w-6 h-6 ${
                    isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center space-x-8 text-center"
          >
            <div>
              <div
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
                }`}
              >
                {pets.length}
              </div>
              <div className={isDarkMode ? "text-gray-300" : "text-[#7a7568]"}>
                Total Pets
              </div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
                }`}
              >
                {filteredPets.length}
              </div>
              <div className={isDarkMode ? "text-gray-300" : "text-[#7a7568]"}>
                Available
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Filter Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`py-8 backdrop-blur-sm ${
          isDarkMode ? "bg-black/50" : "bg-white/50"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <PetFilter pets={pets} onFilterChange={setFilters} />
        </div>
      </motion.section>

      {/* Pets Grid Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-20"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className={`w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4 ${
                    isDarkMode ? "border-yellow-400" : "border-[#FF7F11]"
                  }`}
                />
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-[#7a7568]"
                  } text-lg`}
                >
                  Loading adorable pets...
                </p>
              </div>
            </motion.div>
          ) : filteredPets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-6">🐾</div>
              <h3
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
                }`}
              >
                No pets found
              </h3>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-[#7a7568]"
                }`}
              >
                Try adjusting your search criteria or filters
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery("");
                  setFilters({});
                }}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  isDarkMode
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-[#FF7F11] text-white hover:bg-[#e56e0e]"
                }`}
              >
                Clear Filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <PetCard pets={filteredPets} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`py-20 relative overflow-hidden ${
          isDarkMode
            ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
            : "bg-gradient-to-r from-[#FF1B1C] to-[#FF7F11]"
        }`}
      >
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Can't Find Your Perfect Match?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Don't worry! New pets are added regularly. Check back often or
            contact us to be notified when new pets arrive.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href="/Contact"
              className={`inline-block px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 ${
                isDarkMode
                  ? "bg-black text-yellow-400 hover:bg-gray-900"
                  : "bg-white text-[#FF1B1C]"
              }`}
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </motion.section>

      <MyFooter />
    </div>
  );
}
