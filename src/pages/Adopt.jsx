import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";
import PetCard from "../components/PetCard";
import PetFilter from "../components/PetFilter";

export default function Adopt() {
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchPets = async () => {
      const querySnapshot = await getDocs(collection(db, "pets"));
      const petList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petList);
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter((pet) => {
    return (
      (!filters.city || pet.location === filters.city) &&
      (!filters.type || pet.type === filters.type) &&
      (!filters.breed || pet.breed === filters.breed)
    );
  });

  return (
    <div>
      {/* Optional Navbar */}
      {/* <Navbar /> */}

      <div className="min-h-screen bg-gray-50 py-30 px-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#FF7F11]">Available Pets</h1>

        {/* Filter Component */}
        <PetFilter pets={pets} onFilterChange={setFilters} />

        {/* Pet Cards with Filtered Data */}
        <PetCard pets={filteredPets} />
      </div>

      <MyFooter />
    </div>
  );
}
