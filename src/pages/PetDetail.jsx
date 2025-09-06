import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDownloadURL, ref } from "firebase/storage";
import MyFooter from "../components/Footer";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Heart } from "lucide-react";
import ChatButton from "../components/ChatButton"; // Import ChatButton component

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [user, setUser] = useState(null);
  const [shelterInfo, setShelterInfo] = useState(null); // Add shelter info state

  const auth = getAuth();

  // ✅ Set current user and check favourite status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const favRef = doc(db, "users", firebaseUser.uid, "favorites", id);
        const favSnap = await getDoc(favRef);
        setIsFavourite(favSnap.exists());
        console.log("isFavourite:", favSnap.exists());
      }
    });

    return () => unsubscribe();
  }, [id]);

  // ✅ Toggle favourite
  const handleToggleFavourite = async () => {
    if (!user || !pet) return;

    const favRef = doc(db, "users", user.uid, "favorites", id);

    if (isFavourite) {
      await deleteDoc(favRef);
      console.log("Removed from favourites:", user.uid, id);
      setIsFavourite(false);
    } else {
      await setDoc(favRef, {
        petId: id,
        petName: pet.name,
        petImage: imageUrls[0] || "",
        timestamp: Date.now(),
      });
      console.log("Added to favourites:", user.uid, id);
      setIsFavourite(true);
    }
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const petRef = doc(db, "pets", id);
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          const petData = petSnap.data();

          // Fetch shelter information
          if (petData.shelterId) {
            try {
              const shelterRef = doc(db, "shelters", petData.shelterId);
              const shelterSnap = await getDoc(shelterRef);
              if (shelterSnap.exists()) {
                setShelterInfo(shelterSnap.data());
              }
            } catch (error) {
              console.error("Error fetching shelter info:", error);
            }
          }

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
      <div className="h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex items-center justify-center">
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
      <div className="h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-[#BEB7A4]/20 flex-shrink-0"
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
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

      {/* Main Content - Single Page Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-6xl h-[85vh] flex flex-col lg:flex-row"
        >
          {/* Left Side - Image Section */}
          <div className="lg:w-1/2 h-64 lg:h-full relative bg-gray-100">
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

                {/* Left/Right Arrows */}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(
                          (currentImageIndex - 1 + imageUrls.length) %
                            imageUrls.length
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#FF1B1C] rounded-full p-2 shadow transition z-10"
                      aria-label="Previous image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(
                          (currentImageIndex + 1) % imageUrls.length
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#FF1B1C] rounded-full p-2 shadow transition z-10"
                      aria-label="Next image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

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
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold text-[#FF1B1C] flex items-center gap-2">
                  <span className="text-base">{getPetTypeIcon(pet.type)}</span>
                  <span>{pet.type || "Pet"}</span>
                </div>

                {/* Location Badge */}
                {pet.city && (
                  <div className="absolute top-4 right-4 bg-[#FF7F11]/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 text-sm font-semibold">
                    📍 {pet.city}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#FF7F11]/10 to-[#FF1B1C]/10">
                <div className="text-center">
                  <div className="text-6xl mb-3">🐾</div>
                  <p className="text-[#7a7568] text-sm">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Details Section */}
          <div className="lg:w-1/2 flex flex-col h-96 lg:h-full overflow-hidden relative">
            <div className="absolute top-4 right-4 z-20">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavourite}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition"
              >
                {isFavourite ? (
                  <Heart className="text-[#FF1B1C] fill-[#FF1B1C]" />
                ) : (
                  <Heart className="text-[#FF1B1C]" />
                )}
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <h1 className="text-3xl lg:text-4xl font-black text-[#FF1B1C] mb-3">
                  {pet.name || "Unnamed Pet"}
                </h1>
                <div className="flex items-center gap-4 text-[#7a7568] mb-4">
                  <span className="text-base">
                    {pet.breed || "Mixed Breed"}
                  </span>
                  {pet.age && (
                    <>
                      <span>•</span>
                      <span className="text-base">{getAgeText(pet.age)}</span>
                    </>
                  )}
                </div>
                {/* Add Shelter Info */}
                {shelterInfo && (
                  <div className="bg-[#FFFFFC] rounded-lg p-3 border border-[#BEB7A4]/20 mb-4">
                    <div className="text-xs text-[#7a7568] mb-1">
                      From Shelter
                    </div>
                    <div className="font-semibold text-[#FF1B1C] text-sm">
                      {shelterInfo.shelterName}
                    </div>
                    <div className="font-semibold text-[#FF1B1C] text-sm">
                      {shelterInfo.contactPhone || "No number provided"}
                    </div>
                    {shelterInfo.location && (
                      <div className="text-xs text-[#7a7568]">
                        📍 {shelterInfo.location}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Key Details Grid */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <div className="bg-[#FFFFFC] rounded-xl p-3 border border-[#BEB7A4]/20">
                  <div className="text-xs text-[#7a7568] mb-1">Gender</div>
                  <div className="font-semibold text-[#FF1B1C] text-sm">
                    {pet.gender || "Not specified"}
                  </div>
                </div>
                <div className="bg-[#FFFFFC] rounded-xl p-3 border border-[#BEB7A4]/20">
                  <div className="text-xs text-[#7a7568] mb-1">Size</div>
                  <div className="font-semibold text-[#FF1B1C] text-sm">
                    {pet.size || "Not specified"}
                  </div>
                </div>
                <div className="bg-[#FFFFFC] rounded-xl p-3 border border-[#BEB7A4]/20">
                  <div className="text-xs text-[#7a7568] mb-1">Color</div>
                  <div className="font-semibold text-[#FF1B1C] text-sm">
                    {pet.color || "Not specified"}
                  </div>
                </div>
                <div className="bg-[#FFFFFC] rounded-xl p-3 border border-[#BEB7A4]/20">
                  <div className="text-xs text-[#7a7568] mb-1">Weight</div>
                  <div className="font-semibold text-[#FF1B1C] text-sm">
                    {pet.weight || "Not specified"}
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-6"
              >
                <h3 className="text-lg font-bold text-[#FF1B1C] mb-3">
                  About {pet.name || "This Pet"}
                </h3>
                <p className="text-[#7a7568] leading-relaxed text-sm">
                  {pet.description ||
                    "This adorable pet is looking for a loving home. They are friendly, well-behaved, and ready to become part of your family. Contact us to learn more about their personality and needs."}
                </p>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mb-6"
              >
                <h3 className="text-lg font-bold text-[#FF1B1C] mb-3">
                  Characteristics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pet.tags && pet.tags.length > 0 ? (
                    pet.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-[#FF7F11]/20 to-[#FF1B1C]/20 text-[#FF1B1C] px-3 py-1.5 rounded-full font-semibold border border-[#FF7F11]/30 text-xs"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-[#FF7F11]/20 to-[#FF1B1C]/20 text-[#FF1B1C] px-3 py-1.5 rounded-full font-semibold border border-[#FF7F11]/30 text-xs">
                        Friendly
                      </span>
                      <span className="bg-gradient-to-r from-[#FF7F11]/20 to-[#FF1B1C]/20 text-[#FF1B1C] px-3 py-1.5 rounded-full font-semibold border border-[#FF7F11]/30 text-xs">
                        Playful
                      </span>
                      <span className="bg-gradient-to-r from-[#FF7F11]/20 to-[#FF1B1C]/20 text-[#FF1B1C] px-3 py-1.5 rounded-full font-semibold border border-[#FF7F11]/30 text-xs">
                        Loving
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="p-6 lg:p-8 border-t border-[#BEB7A4]/20 bg-white flex-shrink-0"
            >
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdoptClick}
                  className="w-full bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-3 rounded-xl font-bold text-base hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Adopt {pet.name || "This Pet"}</span>
                  <motion.svg
                    className="w-5 h-5"
                    animate={{ x: [0, 3, 0] }}
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

                {/* Updated Action Buttons with Chat Integration */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/Contact")}
                    className="flex-1 bg-white text-[#FF1B1C] border-2 border-[#FF1B1C] py-3 rounded-xl font-bold text-sm hover:bg-[#FF1B1C] hover:text-white transition-all duration-300"
                  >
                    Contact
                  </motion.button>

                  {/* Chat Button Integration */}
                  {pet.shelterId && (
                    <div className="flex-1">
                      <ChatButton
                        shelterId={pet.shelterId}
                        petId={id}
                        shelterName={shelterInfo?.shelterName || "Shelter"}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <MyFooter />
    </div>
  );
};

export default PetDetail;
