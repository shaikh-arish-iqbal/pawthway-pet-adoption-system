import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDownloadURL, ref } from "firebase/storage";
import MyFooter from "../components/Footer";

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const petRef = doc(db, "pets", id);
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          const petData = petSnap.data();

          // Fetch image URLs from storage
          if (petData.imageUrls && petData.imageUrls.length > 0) {
            const urls = await Promise.all(
              petData.imageUrls.map(async (path) => {
                try {
                  const imgRef = ref(storage, path);
                  return await getDownloadURL(imgRef);
                } catch {
                  return null;
                }
              })
            );
            setImageUrls(urls.filter(Boolean));
          }

          setPet(petData);
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

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

  const handleAdoptClick = () => {
    navigate(`/adoption-form/${id}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FF7F11] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#7a7568] text-lg">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
            Pet Not Found
          </h2>
          <p className="text-[#7a7568] mb-6">
            This pet may have already been adopted or doesn't exist.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackClick}
            className="bg-[#FF7F11] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e56e0e] transition-colors"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-[#BEB7A4]/20 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackClick}
            className="flex items-center gap-2 text-[#FF7F11] hover:text-[#FF1B1C] transition-colors font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Pets
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Left Side - Images */}
            <div className="relative bg-gray-100">
              {imageUrls.length > 0 ? (
                <div className="relative h-full">
                  {/* Main Image */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      src={imageUrls[currentImageIndex]}
                      alt={`${pet.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Image Navigation */}
                  {imageUrls.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {imageUrls.map((_, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.2 }}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "bg-white scale-125"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pet Type Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-[#FF1B1C] flex items-center gap-2">
                    <span className="text-lg">{getPetTypeIcon(pet.type)}</span>
                    <span>{pet.type || "Pet"}</span>
                  </div>

                  {/* Location Badge */}
                  {pet.city && (
                    <div className="absolute top-4 right-4 bg-[#FF7F11]/90 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm font-semibold">
                      📍 {pet.city}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#FF7F11]/10 to-[#FF1B1C]/10">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🐾</div>
                    <p className="text-[#7a7568]">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Details */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              <div>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8"
                >
                  <h1 className="text-4xl lg:text-5xl font-black text-[#FF1B1C] mb-4">
                    {pet.name || "Unnamed Pet"}
                  </h1>
                  <div className="flex items-center gap-4 text-[#7a7568] mb-6">
                    <span className="text-lg">
                      {pet.breed || "Mixed Breed"}
                    </span>
                    {pet.age && (
                      <>
                        <span>•</span>
                        <span className="text-lg">{getAgeText(pet.age)}</span>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Key Details */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="grid grid-cols-2 gap-6 mb-8"
                >
                  {pet.gender && (
                    <div className="bg-[#FFFFFC] rounded-xl p-4 border border-[#BEB7A4]/20">
                      <div className="text-sm text-[#7a7568] mb-1">Gender</div>
                      <div className="font-semibold text-[#FF1B1C]">
                        {pet.gender}
                      </div>
                    </div>
                  )}
                  {pet.size && (
                    <div className="bg-[#FFFFFC] rounded-xl p-4 border border-[#BEB7A4]/20">
                      <div className="text-sm text-[#7a7568] mb-1">Size</div>
                      <div className="font-semibold text-[#FF1B1C]">
                        {pet.size}
                      </div>
                    </div>
                  )}
                  {pet.color && (
                    <div className="bg-[#FFFFFC] rounded-xl p-4 border border-[#BEB7A4]/20">
                      <div className="text-sm text-[#7a7568] mb-1">Color</div>
                      <div className="font-semibold text-[#FF1B1C]">
                        {pet.color}
                      </div>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="bg-[#FFFFFC] rounded-xl p-4 border border-[#BEB7A4]/20">
                      <div className="text-sm text-[#7a7568] mb-1">Weight</div>
                      <div className="font-semibold text-[#FF1B1C]">
                        {pet.weight}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Description */}
                {pet.description && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold text-[#FF1B1C] mb-4">
                      About {pet.name}
                    </h3>
                    <p className="text-[#7a7568] leading-relaxed text-lg">
                      {pet.description}
                    </p>
                  </motion.div>
                )}

                {/* Tags */}
                {pet.tags && pet.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold text-[#FF1B1C] mb-4">
                      Characteristics
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {pet.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-[#FF7F11]/20 to-[#FF1B1C]/20 text-[#FF1B1C] px-4 py-2 rounded-full font-semibold border border-[#FF7F11]/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdoptClick}
                  className="w-full bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Adopt {pet.name || "This Pet"}</span>
                  <motion.svg
                    className="w-6 h-6"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
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
                  </motion.svg>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/Contact")}
                  className="w-full bg-white text-[#FF1B1C] border-2 border-[#FF1B1C] py-4 rounded-xl font-bold text-lg hover:bg-[#FF1B1C] hover:text-white transition-all duration-300"
                >
                  Contact About This Pet
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <MyFooter />
    </div>
  );
};

export default PetDetail;
