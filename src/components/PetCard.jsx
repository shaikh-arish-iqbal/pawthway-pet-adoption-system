import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const PetCard = ({ cityFilter }) => {
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      const petCollection = collection(db, "pets");
      const petSnapshot = await getDocs(petCollection);
      const petList = await Promise.all(
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

      setPets(petList);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    fetchPets();
    return () => unsubscribe();
  }, []);

  const handleAdoptClick = (petId) => {
    navigate(`/pet/${petId}`);
  };

  const filteredPets = cityFilter
    ? pets.filter(
        (pet) => pet.city?.toLowerCase() === cityFilter.toLowerCase()
      )
    : pets;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-[#FFFFFC]">
      {filteredPets.map((pet) => (
        <div
          key={pet.id}
          className="max-w-xs w-full h-[23rem] bg-white border border-[#BEB7A4] rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col"
        >
          {/* Image */}
          <div className="w-full h-48 bg-[#F1F1F1]">
            <img
              src={pet.imageUrls?.[0] || "https://via.placeholder.com/150"}
              alt={pet.name}
              className="object-cover w-full h-full rounded-t-xl"
            />
          </div>

          {/* Details */}
          <div className="px-4 py-3 flex-1">
            <h3 className="text-[#000000] text-lg font-bold truncate">{pet.name}</h3>
            <p className="text-[#000000] text-sm">
              Breed: {pet.breed || "Unknown"}
            </p>
            <p className="text-[#000000] text-sm">
              📍 {pet.city || "Unknown City"}
            </p>
          </div>

          {/* Button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => handleAdoptClick(pet.id)}
              className="w-full px-4 py-2 rounded bg-[#FF7F11] hover:bg-[#FF1B1C] text-white font-semibold transition-all duration-200 cursor-pointer"
            >
              Adopt
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PetCard;
