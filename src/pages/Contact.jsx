import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MyFooter from "../components/Footer";

export default function Contact() {
  return (
    <div className="bg-[#FFFFFC] min-h-screen flex flex-col justify-between">
      {/* Navbar */}

      {/* Main Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center px-6 pt-35"
      >
        <h1 className="text-4xl font-bold text-[#000000] mb-2">Contact Us</h1>
        <p className="text-[#BEB7A4] max-w-xl">
          We’d love to hear from you! Whether you have a question about
          adoption, partnership, or just want to say hello, fill out the form
          below.
        </p>

        {/* Contact Form */}
        <motion.form
          whileHover={{ scale: 1.01 }}
          className="bg-white shadow-lg rounded-2xl p-8 mt-8 w-full max-w-xl border border-[#BEB7A4]"
        >
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]"
            />
            <select
              className="p-3 border border-[#BEB7A4] rounded-lg text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]"
            >
              <option>Choose Subject</option>
              <option>Adoption Inquiry</option>
              <option>Shelter Partnership</option>
              <option>Feedback</option>
              <option>Other</option>
            </select>
            <textarea
              rows="4"
              placeholder="Your Message"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]"
            ></textarea>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#FF7F11] text-white font-bold py-3 rounded-lg transition-all duration-200 hover:bg-[#FF1B1C] cursor-pointer"
              type="submit"
            >
              Send Message
            </motion.button>
          </div>
        </motion.form>

        {/* Call-to-action for shelters */}
        <div className="mt-10 text-[#000000] mb-10">
          <p className="mb-2">Are you a shelter or NGO?</p>
          <Link
            to="/register-shelter"
            className="text-[#FF1B1C] hover:underline hover:text-[#FF7F11] transition-colors"
          >
            Register your shelter with us
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <MyFooter />
    </div>
  );
}
