import React from "react";
import { Link } from "react-router-dom";

export default function PetCard({ pet }) {
  return (
    <div className="bg-[#FFFFFC] border border-[#BEB7A4] rounded-lg shadow-lg p-4 hover:shadow-xl transition">
      <img
        src={pet.imageURL}
        alt={pet.name}
        className="w-full h-48 object-cover rounded mb-3"
      />
      <h3 className="text-xl font-bold text-[#FF1B1C]">{pet.name}</h3>
      <p className="text-[#000000]">{pet.type} • {pet.age}</p>
      <p className="text-[#BEB7A4]">{pet.breed}</p>
      <p className="text-sm text-[#000000] mb-2">{pet.location}</p>
      <Link
        to={`/pet/${pet.id}`}
        className="inline-block bg-[#FF7F11] text-[#FFFFFC] px-4 py-2 rounded hover:bg-[#FF1B1C] transition"
      >
        View Details
      </Link>
    </div>
  );
}
