import React, { useState, useEffect } from "react";

const PetFilter = ({ pets, onFilterChange }) => {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [breedOptions, setBreedOptions] = useState([]);

  // 🧠 Watch for filter changes and inform parent
  useEffect(() => {
    onFilterChange({ city, type, breed });
  }, [city, type, breed]);

  // 🎯 Update breed list when type changes
  useEffect(() => {
    const filteredBreeds = pets
      .filter((pet) => (type ? pet.type === type : true))
      .map((pet) => pet.breed);
    const uniqueBreeds = [...new Set(filteredBreeds)];
    setBreedOptions(uniqueBreeds);
  }, [type, pets]);

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center bg-[#FFFFFC] px-4 py-4 mb-6 rounded-xl shadow border border-[#BEB7A4] max-w-4xl mx-auto">
      {/* City Filter */}
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="px-4 py-2 text-[#000000] bg-white border border-[#BEB7A4] rounded-md shadow-sm focus:ring-2 focus:ring-[#FF7F11] focus:outline-none"
      >
        <option value="">All Cities</option>
        {[...new Set(pets.map((pet) => pet.location))].map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {/* Type Filter */}
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setBreed(""); // reset breed when type changes
        }}
        className="px-4 py-2 text-[#000000] bg-white border border-[#BEB7A4] rounded-md shadow-sm focus:ring-2 focus:ring-[#FF7F11] focus:outline-none"
      >
        <option value="">All Types</option>
        {[...new Set(pets.map((pet) => pet.type))].map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Breed Filter */}
      <select
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
        className="px-4 py-2 text-[#000000] bg-white border border-[#BEB7A4] rounded-md shadow-sm focus:ring-2 focus:ring-[#FF7F11] focus:outline-none"
      >
        <option value="">All Breeds</option>
        {breedOptions.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PetFilter;
