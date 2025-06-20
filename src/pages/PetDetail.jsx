import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";
import AdoptionForm from "../components/AdoptionForm";

export default function PetDetail() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      const petRef = doc(db, "pets", id);
      const petSnap = await getDoc(petRef);
      if (petSnap.exists()) {
        setPet({ id: petSnap.id, ...petSnap.data() });
      }
    };
    fetchPet();
  }, [id]);

  if (!pet) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FFFFFC] text-[#000000]">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-28">
        <div className="grid md:grid-cols-2 gap-10">
          <img
            src={pet.imageURL}
            alt={pet.name}
            className="w-full h-80 object-cover rounded-xl shadow"
          />

          <div>
            <h1 className="text-4xl font-bold text-[#FF1B1C] mb-4">{pet.name}</h1>
            <p className="mb-2"><strong>Type:</strong> {pet.type}</p>
            <p className="mb-2"><strong>Breed:</strong> {pet.breed}</p>
            <p className="mb-2"><strong>Age:</strong> {pet.age}</p>
            <p className="mb-2"><strong>Location:</strong> {pet.location}</p>
          </div>
        </div>

        <AdoptionForm pet={pet} />
      </div>

      <MyFooter />
    </div>
  );
}
