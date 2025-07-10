import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        createdAt: Timestamp.now(),
      });
      setSuccessMsg("Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      setErrorMsg("Failed to send message. Try again.");
      console.error("Error adding contact: ", error);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  return (
    <div className="bg-[#FFFFFC] min-h-screen flex flex-col justify-between">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center px-6 pt-20"
      >
        <h1 className="text-4xl font-bold text-[#FF7F11] mb-2">Contact Us</h1>
        <p className="text-[#BEB7A4] max-w-xl">
          We'd love to hear from you! Whether you're looking to adopt or have a
          question, drop us a message.
        </p>

        <motion.form
          onSubmit={handleSubmit}
          whileHover={{ scale: 1.01 }}
          className="bg-white shadow-lg rounded-2xl p-8 mt-8 w-full max-w-xl border border-[#BEB7A4]"
        >
          <div className="flex flex-col gap-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
              placeholder="Your Name"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:ring-2 focus:ring-[#FF7F11]"
              required
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Your Email"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:ring-2 focus:ring-[#FF7F11]"
              required
            />

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              placeholder="+91 9876543210"
              pattern="^\+?[0-9\s\-]{10,15}$"
              title="Enter a valid phone number starting with + and country code"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:ring-2 focus:ring-[#FF7F11]"
              required
            />

            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="p-3 border border-[#BEB7A4] rounded-lg text-[#000000] focus:ring-2 focus:ring-[#FF7F11]"
              required
            >
              <option value="">Choose Subject</option>
              <option>Adoption Inquiry</option>
              <option>Shelter Partnership</option>
              <option>Feedback</option>
              <option>Other</option>
            </select>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Your Message"
              className="p-3 border border-[#BEB7A4] rounded-lg placeholder-[#BEB7A4] text-[#000000] focus:ring-2 focus:ring-[#FF7F11]"
              required
            ></textarea>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#FF7F11] text-white font-bold py-3 rounded-lg hover:bg-[#FF1B1C] transition-all duration-200 cursor-pointer"
            >
              Send Message
            </motion.button>

            {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
            {errorMsg && <p className="text-red-600 mt-2">{errorMsg}</p>}
          </div>
        </motion.form>

        <div className="mt-10 mb-10 text-[#000000]">
          <p className="mb-2">Are you a shelter or NGO?</p>
          <Link
            to="/register-shelter"
            className="text-[#FF1B1C] hover:underline hover:text-[#FF7F11] transition-colors"
          >
            Register your shelter with us
          </Link>
        </div>
      </motion.div>

      <MyFooter />
    </div>
  );
}
