import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, storage } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const PetCard = ({ pets: propPets, cityFilter }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPet, setHoveredPet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        let petList = [];

        if (propPets) {
          // Use props if provided
          petList = propPets;
        } else {
          // Fetch from Firebase if no props
          const petCollection = collection(db, "pets");
          const petSnapshot = await getDocs(petCollection);
          petList = await Promise.all(
            petSnapshot.docs.map(async (doc) => {
              const petData = doc.data();

              const imageUrls = await Promise.all(
                (petData.imageUrls || []).map(async (path) => {
                  try {
                    const imgRef = ref(storage, path);
                    return await getDownloadURL(imgRef);
                  } catch {
                    return null;
                  }
                })
              );

              return {
                id: doc.id,
                ...petData,
                imageUrls: imageUrls.filter(Boolean),
              };
            })
          );
        }

        setPets(petList);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [propPets]);

  const handleAdoptClick = (petId) => {
    navigate(`/pet/${petId}`);
  };

  const getPetTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "dog":
        return "🐕";
      case "cat":
        return "🐱";
      case "rabbit":
        return "🐰";
      case "bird":
        return "🐦";
      case "hamster":
        return "🐹";
      default:
        return "🐾";
    }
  };

  const getAgeText = (age) => {
    if (!age) return "Unknown";
    if (age.includes("month")) return age;
    if (age.includes("year")) return age;
    return `${age} old`;
  };

  const filteredPets = cityFilter
    ? pets.filter((pet) => pet.city?.toLowerCase() === cityFilter.toLowerCase())
    : pets;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FF7F11] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <AnimatePresence>
        {filteredPets.map((pet, index) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -10,
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            onHoverStart={() => setHoveredPet(pet.id)}
            onHoverEnd={() => setHoveredPet(null)}
            className="group cursor-pointer"
            onClick={() => handleAdoptClick(pet.id)}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 group-hover:shadow-2xl border border-gray-100 flex flex-col h-full">
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-[4/3] min-h-[200px] max-h-[220px] flex items-center justify-center bg-gray-100">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src={
                    pet.imageUrls?.[0] ||
                    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop"
                  }
                  alt={pet.name}
                  className="w-full h-full object-cover object-center"
                />
                {/* Overlay with pet info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPet === pet.id ? 1 : 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                />
                {/* Pet type badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-[#FF1B1C] flex items-center gap-1">
                  <span>{getPetTypeIcon(pet.type)}</span>
                  <span>{pet.type || "Pet"}</span>
                </div>
                {/* Location badge */}
                {pet.city && (
                  <div className="absolute top-4 right-4 bg-[#FF7F11]/90 backdrop-blur-sm text-white rounded-full px-3 py-1 text-sm font-semibold">
                    📍 {pet.city}
                  </div>
                )}
                {/* Hover overlay content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: hoveredPet === pet.id ? 1 : 0,
                    y: hoveredPet === pet.id ? 0 : 20,
                  }}
                  className="absolute bottom-4 left-4 right-4 text-white"
                >
                  <div className="space-y-2">
                    {pet.age && (
                      <div className="text-sm font-medium">
                        Age: {getAgeText(pet.age)}
                      </div>
                    )}
                    {pet.gender && (
                      <div className="text-sm font-medium">
                        Gender: {pet.gender}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
              {/* Content */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-[#FF1B1C] mb-1 group-hover:text-[#FF7F11] transition-colors">
                    {pet.name || "Unnamed Pet"}
                  </h3>
                  {pet.breed && (
                    <p className="text-[#7a7568] text-sm mb-1">{pet.breed}</p>
                  )}
                  {pet.age && (
                    <p className="text-[#7a7568] text-sm">
                      Age: {getAgeText(pet.age)}
                    </p>
                  )}
                  {pet.gender && (
                    <p className="text-[#7a7568] text-sm">
                      Gender: {pet.gender}
                    </p>
                  )}
                </div>
                {/* Tags/Characteristics */}
                {pet.tags && pet.tags.length > 0 && (
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#FF1B1C] mb-1">
                      Characteristics
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pet.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#BEB7A4]/20 text-[#7a7568] text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PetCard;
