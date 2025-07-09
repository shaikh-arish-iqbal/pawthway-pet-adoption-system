import React, { useEffect, useState } from "react";
import MyFooter from "../components/Footer";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeartOff, Trash2 } from "lucide-react";

const Favourites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const favsRef = collection(db, "users", user.uid, "favorites");
      const favsSnap = await getDocs(favsRef);
      const favsData = favsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favsData);
      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const handleRemove = async (petId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "favorites", petId));
      setFavorites((prev) => prev.filter((fav) => fav.petId !== petId));
    } catch (error) {
      console.error("Error removing favourite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#FF7F11] border-t-transparent rounded-full mb-4"
        />
        <p className="text-[#7a7568] text-lg font-medium">
          Loading your favourites...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefcf6] text-center">
        <p className="text-[#7a7568] text-lg">
          Please log in to view your favourite pets.
        </p>
      </div>
    );
  }

  return (
    <div>
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] py-10 px-6">
      <h2 className="my-10 text-3xl font-bold text-[#FF1B1C] text-center mb-10">
        Your Favourite Pets
      </h2>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center text-[#7a7568] text-center">
          <HeartOff className="w-12 h-12 mb-3 text-[#FF1B1C]" />
          <p className="text-lg">You haven’t added any favourites yet.</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {favorites.map((pet) => (
            <motion.div
              key={pet.petId}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#BEB7A4]/30 transition flex flex-col"
            >
              <img
                src={pet.petImage}
                alt={pet.petName}
                className="w-full h-56 object-cover"
              />
              <div className="p-5 flex flex-col justify-between flex-1">
                <h3 className="text-2xl font-bold text-[#FF1B1C] mb-4">
                  {pet.petName}
                </h3>
                <div className="flex gap-2 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/pet/${pet.petId}`)}
                    className="cursor-pointer flex-1 bg-[#FF7F11] hover:bg-[#e56e0e] text-white px-4 py-2 rounded-full font-semibold transition-all"
                  >
                    View Pet
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemove(pet.petId)}
                    className="cursor-pointer bg-white border border-[#FF1B1C] hover:bg-[#FF1B1C] hover:text-white text-[#FF1B1C] px-4 py-2 rounded-full font-semibold flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
      <MyFooter/>
    </div>
  );
};

export default Favourites;
