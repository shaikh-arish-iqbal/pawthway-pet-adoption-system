import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";

export default function About() {
  return (
    <div>
      <div>{/* <Navbar /> */}</div>

      <div className="min-h-screen bg-[#FFFFFC] text-[#FF7F11] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            className="text-5xl font-extrabold mb-8 border-b-4 border-[#FF7F11] inline-block"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Us
          </motion.h1>

          <motion.p
            className="text-lg leading-relaxed mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Welcome to our Pet Adoption Platform! 🐾 We connect animals with
            loving families and help shelters manage pets in a smarter, simpler
            way.
          </motion.p>

          <motion.div
            className="grid md:grid-cols-2 gap-8 mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* For Adopters Card */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#FF7F11] p-6 rounded-xl shadow-lg text-white transition duration-300 cursor-pointer"
            >
              <h2 className="text-2xl font-semibold mb-2">🐶 For Adopters</h2>
              <p>
                Discover pets looking for a new home, learn their stories, and
                apply for adoption—all in one place.
              </p>
            </motion.div>

            {/* For Shelters Card */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#FF1B1C] p-6 rounded-xl shadow-lg text-white transition duration-300 cursor-pointer"
            >
              <h2 className="text-2xl font-semibold mb-2">🏠 For Shelters</h2>
              <p>
                Create listings, update pet info, and manage applications
                through an easy-to-use dashboard.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-[#BEB7A4] p-6 mt-12 rounded-xl shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#000000] mb-4">
              Why Choose Us?
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li>Fast and responsive platform</li>
              <li>Built with love for pets and shelters</li>
              <li>Modern UI and real-time updates</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <div>
        <MyFooter />
      </div>
    </div>
  );
}
