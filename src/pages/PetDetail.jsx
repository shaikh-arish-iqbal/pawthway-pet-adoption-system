import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import MyFooter from "../components/Footer";

const PetDetail = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      const petRef = doc(db, "pets", id);
      const petSnap = await getDoc(petRef);
      if (petSnap.exists()) {
        setPet(petSnap.data());
      }
    };
    fetchPet();
  }, [id]);

  if (!pet) return <p className="p-4 text-[#000000]">Loading...</p>;

  return (
    <div>
      <div className="p-30 bg-[#FFFFFC] text-[#000000]">
        <div className="w-[100%] mx-auto bg-white rounded-lg shadow-md border border-[#BEB7A4] p-6">
          <img
            src={pet.imageUrls?.[0]}
            alt={pet.name}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
          <p className="text-lg mb-1">
            <strong>Breed:</strong> {pet.breed}
          </p>
          <p className="text-lg mb-1">
            <strong>Age:</strong> {pet.age}
          </p>
          <p className="text-md text-gray-700 mb-4">{pet.description}</p>

          <button className="bg-[#FF7F11] hover:bg-[#FF1B1C] text-white px-6 py-2 rounded-md text-sm font-semibold transition cursor-pointer">
            Adopt Now
          </button>
        </div>
      </div>
      <div>
        <MyFooter />
      </div>
    </div>
  );
};

export default PetDetail;
