import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import MyFooter from "../components/Footer";

const backgroundImages = [
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1920&h=1080&fit=crop",
];

const quickLinks = [
  {
    title: "Browse Pets",
    description:
      "Find your perfect companion from our database of adoptable pets",
    icon: "🐕",
    link: "/Adopt",
    color: "from-[#FF7F11] to-[#FF1B1C]",
  },
  {
    title: "About Us",
    description: "Learn about our mission to help pets find loving homes",
    icon: "🏠",
    link: "/About",
    color: "from-[#FF1B1C] to-[#FF7F11]",
  },
  {
    title: "Contact",
    description: "Get in touch with us for questions or support",
    icon: "📞",
    link: "/Contact",
    color: "from-[#FF7F11] to-[#BEB7A4]",
  },
  {
    title: "FAQ",
    description: "Find answers to common questions about pet adoption",
    icon: "❓",
    link: "/FAQ",
    color: "from-[#BEB7A4] to-[#FF1B1C]",
  },
  {
    title: "Upload Pet",
    description: "Help a pet find a home by adding them to our database",
    icon: "📸",
    link: "/UploadPet",
    color: "from-[#FF1B1C] to-[#BEB7A4]",
  },
  {
    title: "Shelter Info",
    description: "Register your shelter or update information",
    icon: "🏥",
    link: "/ShelterInfoForm",
    color: "from-[#BEB7A4] to-[#FF7F11]",
  },
];

const stats = [
  { number: "500+", label: "Happy Adoptions" },
  { number: "50+", label: "Partner Shelters" },
  { number: "1000+", label: "Lives Saved" },
  { number: "24/7", label: "Support Available" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add handler for search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/Adopt?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] text-[#000000] font-sans overflow-x-hidden">
      {/* Hero Section with Slideshow */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4 md:px-8 overflow-hidden"
      >
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
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
            className="absolute top-20 left-20 w-32 h-32 bg-[#FF7F11] opacity-20 rounded-full"
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
            className="absolute bottom-20 right-20 w-24 h-24 bg-[#FF1B1C] opacity-20 rounded-full"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#BEB7A4] opacity-30 rounded-lg"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background: "linear-gradient(45deg, #FFFFFF, #FF7F11, #FFFFFF)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Find Your <br />
              Fur-ever Friend
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Give a shelter animal a second chance at life. Every adoption
              saves two lives - the one you adopt and the one you make room for.
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by breed, location, or pet type..."
                className="w-full px-6 py-4 text-lg rounded-full border-2 border-[#FF7F11] bg-white/95 backdrop-blur-sm text-black focus:outline-none focus:ring-4 focus:ring-[#FF7F11]/30 focus:border-[#FF7F11] shadow-lg"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="absolute right-2 top-2 bg-[#FF7F11] text-white p-3 rounded-full hover:bg-[#e56e0e] transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              </motion.button>
            </form>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/Adopt"
                className="inline-block bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Browse Pets
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/About"
                className="inline-block bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#FF1B1C] transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {backgroundImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-[#FF7F11] scale-125"
                  : "bg-white/50"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-black text-[#FF1B1C] mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-[#BEB7A4] font-semibold text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quick Links Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-br from-[#BEB7A4] to-[#a8a194]"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#FF1B1C] mb-4">
              Quick Navigation
            </h2>
            <p className="text-xl text-[#7a7568] max-w-2xl mx-auto">
              Explore our platform and find everything you need for your pet
              adoption journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickLinks.map((link, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Link to={link.link}>
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 group-hover:shadow-2xl h-full">
                    <div
                      className={`h-32 bg-gradient-to-r ${link.color} flex items-center justify-center`}
                    >
                      <div className="text-6xl">{link.icon}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-[#FF1B1C] mb-3">
                        {link.title}
                      </h3>
                      <p className="text-[#7a7568] leading-relaxed mb-4">
                        {link.description}
                      </p>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="inline-flex items-center text-[#FF7F11] font-semibold group-hover:text-[#FF1B1C] transition-colors"
                      >
                        Learn More
                        <svg
                          className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#FF1B1C] mb-4">
              How Adoption Works
            </h2>
            <p className="text-xl text-[#7a7568] max-w-2xl mx-auto">
              Our simple 3-step process makes finding your perfect companion
              easy and stress-free.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Browse & Connect",
                description:
                  "Search through our database of adoptable pets and find your perfect match.",
              },
              {
                icon: "📞",
                title: "Meet & Greet",
                description:
                  "Schedule a meeting with your potential pet and their current caregivers.",
              },
              {
                icon: "🏠",
                title: "Welcome Home",
                description:
                  "Complete the adoption process and welcome your new family member home.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 bg-gradient-to-br from-[#FF7F11] to-[#FF1B1C] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg"
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-[#FF1B1C] mb-4">
                  {step.title}
                </h3>
                <p className="text-[#7a7568] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-[#FF1B1C] to-[#FF7F11] relative overflow-hidden"
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
            className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            Ready to Change a Life?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Every adoption saves two lives - the one you adopt and the one you
            make room for. Start your journey today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/Adopt"
                className="inline-block bg-white text-[#FF1B1C] px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Search
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/Contact"
                className="inline-block bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#FF1B1C] transition-all duration-300"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <MyFooter />
    </div>
  );
}
