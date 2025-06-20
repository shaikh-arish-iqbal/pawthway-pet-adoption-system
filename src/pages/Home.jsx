import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";
import ArticlesSection from "../components/ArticlesSection";
import { Link } from "react-router-dom";

const pets = [
  {
    name: "Buddy",
    type: "Dog",
    age: "2 years",
    image: "https://placedog.net/400/300?id=1",
  },
  {
    name: "Whiskers",
    type: "Cat",
    age: "1 year",
    image: "https://placekitten.com/400/300",
  },
  {
    name: "Coco",
    type: "Rabbit",
    age: "6 months",
    image: "https://placebear.com/400/300",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFFFC] text-[#000000] font-sans flex flex-col scroll-smooth">
      {/* <Navbar /> */}

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center px-4 md:px-8 pb-10 pt-10"
      >
        <div
          className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 bg-[#FFFFFC] p-6 sm:p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-xl md:max-w-2xl"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FF1B1C] mb-4">
              Open Your Heart to a New Friend
            </h1>
            <p className="text-[#BEB7A4] text-base sm:text-lg mb-6">
              Give a shelter animal a second chance at life. Be a part of their
              story.
            </p>
            <Link
              to="/Adopt"
              className="inline-block bg-[#FF7F11] text-[#FFFFFC] px-6 py-3 rounded-full font-bold text-base sm:text-lg hover:bg-[#e56e0e] transition duration-300"
            >
              Explore Adoptions
            </Link>
          </motion.div>
        </div>

        <div className="w-full max-w-3xl text-center mt-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FF1B1C] mb-4">
            Find Your New Best Friend
          </h2>
          <p className="text-[#BEB7A4] text-base sm:text-lg mb-8">
            Search from thousands of adoptable pets in your area.
          </p>
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="text"
            placeholder="Search by breed, location..."
            className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-full border-2 border-[#FF7F11] text-black focus:outline-none focus:ring-4 focus:ring-[#FF7F11]"
          />
        </div>
      </motion.section>

      {/* Featured Pets */}
      <motion.section
        id="adopt"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full bg-[#BEB7A4] px-4 sm:px-6 md:px-20 py-14"
      >
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-semibold text-black mb-10 text-center">
            Featured Pets
          </h3>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {pets.map((pet, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-[#FFFFFC] rounded-lg shadow-md w-full sm:w-64 md:w-72 overflow-hidden"
              >
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-[#FF1B1C] font-bold text-xl mb-1">
                    {pet.name}
                  </h4>
                  <p className="text-black mb-4">
                    {pet.type} • {pet.age}
                  </p>
                  <button className="w-full bg-[#FF7F11] text-white py-2 rounded-full font-semibold hover:bg-[#e56e0e] transition">
                    Adopt Me
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Decorative CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-beige py-16 relative overflow-hidden px-4"
      >
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-orange rounded-full opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-red rounded-full opacity-15 transform translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/4 right-1/4 w-10 h-10 sm:w-16 sm:h-16 bg-off-white rounded-md rotate-45 opacity-10"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 sm:w-24 sm:h-24 bg-black rounded-full opacity-5"></div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center bg-off-white rounded-full shadow-md p-6 sm:p-8 mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FF7F11"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#FF7F11"
              className="w-8 h-8 sm:w-10 sm:h-10 mr-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.413 5.34c-1.397-1.125-3.328-1.574-5.322-1.246C3.993 4.417 2.457 6.136 2.054 8.012c-.295 1.341-.01 2.946.887 4.197l2.873 4.103c.524.747 1.053 1.488 1.58 2.228.303.435.617.87.935 1.302.26.357.53.71.815 1.058.423.518.874.98 1.346 1.428.188.17.377.34.567.51a.75.75 0 001.06 0c.19-.17.379-.34.567-.51.472-.448.923-.91 1.346-1.428.285-.348.555-.701.815-1.058.318-.432.632-.867.935-1.302.527-.74 1.056-1.481 1.58-2.228l2.873-4.103c.897-1.251 1.182-2.856.887-4.197-.403-1.876-1.939-3.595-3.937-4.156-1.994-.328-3.925.121-5.322 1.246a3.793 3.793 0 00-2.316-1.895z"
              />
            </svg>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-orange">Adopt Love</h2>
              <p className="text-sm text-beige-dark">
                Find your new best friend!
              </p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6">
            Give a Fur-ever Home Today!
          </h1>
          <p className="text-base sm:text-lg text-beige-dark mb-8 max-w-xl mx-auto">
            Every pet deserves a loving family. Explore our wonderful animals
            waiting for their chance at happiness and make a difference in a
            life.
          </p>

          <button className="bg-red text-off-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-md hover:bg-orange transition-colors duration-300">
            Browse Adoptable Pets
          </button>

          <p className="mt-10 text-lg sm:text-xl font-semibold text-orange">
            #AdoptDontShop
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <div>
        <MyFooter />
      </div>
    </div>
  );
}
