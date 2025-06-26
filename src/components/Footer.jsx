import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";


export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-[#000000] text-[#FFFFFC] py-10 px-6 md:px-16 mt-auto"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* About Section */}
        <div>
          <h2 className="text-xl font-bold text-[#FF7F11] mb-4">Pawthway 🐾</h2>
          <p className="text-[#BEB7A4]">
            Connecting loving homes with pets in need. Adopt, foster, or support — every paw matters.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-[#FF1B1C] mb-4">Quick Links</h3>
          <ul className="space-y-2 text-[#FFFFFC]">
            <li><Link to="/adopt" className="hover:text-[#FF7F11] transition">Adopt</Link></li>
            <li><Link to="/about" className="hover:text-[#FF7F11] transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-[#FF7F11] transition">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-[#FF7F11] transition text-[#FFFFFC]">FAQ</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-lg font-semibold text-[#FF1B1C] mb-4">Stay Connected</h3>
          <div className="flex space-x-4 mb-4">
            <a href="#" className="text-[#FFFFFC] hover:text-[#FF7F11]"><FaFacebookF /></a>
            <a href="#" className="text-[#FFFFFC] hover:text-[#FF7F11]"><FaInstagram /></a>
            <a href="#" className="text-[#FFFFFC] hover:text-[#FF7F11]"><FaTwitter /></a>
            <a href="#" className="text-[#FFFFFC] hover:text-[#FF7F11]"><FaEnvelope /></a>
          </div>
          <p className="text-[#BEB7A4] text-sm">Email: pawthwaysupport@gmail.com</p>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-[#BEB7A4] border-t border-[#BEB7A4] pt-4">
        © {new Date().getFullYear()} PawPal. All rights reserved.
      </div>
    </motion.footer>
  );
}