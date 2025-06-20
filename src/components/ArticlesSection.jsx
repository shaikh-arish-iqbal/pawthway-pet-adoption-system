import React from "react";
import { motion } from "framer-motion";

export default function ArticlesSection() {
  const articles = [
    {
      imageSrc: "/src/assets/dog.avif",
      avatarSrc: "/path/to/your/dog-avatar.jpg",
      title: "Dog Adoption Insights",
      description: "Discover essential tips for welcoming a new dog into your home, from training to daily care.",
      link: "/articles/dog-adoption",
    },
    {
      imageSrc: "/src/assets/cat.jpg",
      avatarSrc: "/path/to/your/cat-avatar.jpg",
      title: "Cat Adoption Essentials",
      description: "Understand what to expect and how to provide a purrfect environment for your adopted cat.",
      link: "/articles/cat-adoption",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="bg-beige py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">
          Helpful Articles & Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {articles.map(
            ({ imageSrc, avatarSrc, title, description, link }, index) => (
              <div
                key={index}
                className="bg-off-white rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-beige-light"
              >
                <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-off-white rounded-full p-1 shadow-md">
                    <img
                      src={avatarSrc}
                      alt="Author Avatar"
                      className="w-16 h-16 rounded-full object-cover border-4 border-beige"
                    />
                  </div>
                </div>
                <div className="p-6 pt-12 flex flex-col justify-between flex-grow">
                  <h3 className="text-xl font-bold text-black mb-2 text-center">
                    {title}
                  </h3>
                  <p className="text-sm text-beige-dark mb-4 text-center flex-grow">
                    {description}
                  </p>
                  <div className="text-center">
                    <a
                      href={link}
                      className="inline-block text-orange font-semibold py-2 px-4 rounded-md hover:text-red transition-colors duration-300"
                    >
                      READ MORE
                    </a>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
