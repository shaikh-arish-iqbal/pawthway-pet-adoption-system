import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig"; // make sure firebase is initialized
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";

export default function Adopt() {

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
    <div>
      {/* <div>
        <Navbar />
      </div> */}
      

      
      <h2 className="text-3xl font-bold mb-6 text-[#FF7F11]">Available Pets</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {pets.map(pet => (
          <div key={pet.id} className="bg-white p-5 rounded-lg shadow-lg">
            <img src={pet.imageURL} alt={pet.name} className="h-48 w-full object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-bold text-[#FF7F11]">{pet.name}</h3>
            <p><strong>Type:</strong> {pet.type}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <p><strong>Location:</strong> {pet.location}</p>
          </div>
        ))}
      </div>
    


      <div>
        <MyFooter />
      </div>
    </div>
  );
}
