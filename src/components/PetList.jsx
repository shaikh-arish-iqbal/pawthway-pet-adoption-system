import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import PetCard from "./PetCard";

export default function PetList() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const fetchPets = async () => {
      const querySnapshot = await getDocs(collection(db, "pets"));
      const petList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPets(petList);
    };
    fetchPets();
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
