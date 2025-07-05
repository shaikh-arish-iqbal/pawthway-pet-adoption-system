import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";

const faqs = [
  {
    question: "What is Pawthway?",
    answer:
      "Pawthway is a pet adoption platform that connects loving families with adoptable pets from trusted shelters and NGOs across India.",
  },
  {
    question: "How do I adopt a pet through Pawthway?",
    answer:
      "Browse available pets, select the one you're interested in, fill out an adoption form, and the shelter will reach out to you to proceed further.",
  },
  {
    question: "Is there an adoption fee?",
    answer:
      "Adoption fees vary depending on the shelter and pet. Fees typically cover vaccinations, microchipping, and other basic care needs.",
  },
  {
    question: "Can I meet the pet before adopting?",
    answer:
      "Yes! Shelters encourage you to meet the pet before making a final decision. You can schedule a visit with the respective shelter through the platform.",
  },
  {
    question: "What if I have other pets at home?",
    answer:
      "Many shelters conduct compatibility checks or meet-and-greets with your existing pets to ensure a smooth transition for everyone.",
  },
  {
    question: "Can I adopt pets from another city?",
    answer:
      "Some shelters allow intercity adoptions and can assist with transportation. It's best to check with the specific shelter listed on Pawthway.",
  },
  {
    question: "How can I help if I can't adopt?",
    answer:
      "You can foster pets, donate to shelters, volunteer, or share pet listings on social media to help them find homes.",
  },
  {
    question: "How are shelters verified on Pawthway?",
    answer:
      "All shelters are manually verified through registration and document checks to ensure legitimacy and proper animal care standards.",
  },
];

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-[#FFFFFC] min-h-screen flex flex-col">
      {/* <Navbar /> */}

      <div className="flex-grow px-6 py-20 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-[#000000] mb-10"
        >
          Frequently Asked Questions
        </motion.h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-[#BEB7A4] rounded-2xl overflow-hidden bg-white shadow-sm"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-6 py-4 focus:outline-none hover:bg-[#FF7F11] hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-lg font-semibold text-[#000000]">
                  {faq.question}
                </span>
              </button>
              {activeIndex === index && (
                <div className="px-6 pb-4 text-[#000000]">
                  <p>{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <MyFooter />
    </div>
  );
};

export default FAQPage;
