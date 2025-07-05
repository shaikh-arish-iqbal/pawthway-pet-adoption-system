import React, { useState, useEffect } from "react";

const PetFilter = ({ pets, onFilterChange }) => {
  // State for each filter
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [breedOptions, setBreedOptions] = useState([]);

  // 🧠 Effect to watch for filter changes (city, type, breed) and inform the parent component
  // This ensures that whenever a filter value changes, the parent (e.g., Adopt page)
  // gets the updated filter criteria to re-filter the displayed pets.
  useEffect(() => {
    onFilterChange({ city, type, breed });
  }, [city, type, breed, onFilterChange]); // onFilterChange is stable from useCallback or React guarantees it

  // 🎯 Effect to update the list of available breeds whenever the 'type' filter or 'pets' data changes.
  // This makes the breed dropdown dynamic based on the selected pet type.
  useEffect(() => {
    const filteredBreeds = pets
      .filter((pet) => (type ? pet.type === type : true)) // Filter pets by selected type
      .map((pet) => pet.breed) // Extract all breeds from the filtered pets
      .filter(Boolean); // Remove any undefined/null/empty string breeds

    const uniqueBreeds = [...new Set(filteredBreeds)]; // Get only unique breeds
    setBreedOptions(uniqueBreeds.sort()); // Store unique and sorted breeds in state
  }, [type, pets]); // Depend on 'type' and 'pets' data

  // Derive unique city and type options from the full 'pets' list
  const uniqueCities = [...new Set(pets.map((pet) => pet.location).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(pets.map((pet) => pet.type).filter(Boolean))].sort();

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center bg-[#FFFFFC] px-4 py-4 mb-6 rounded-xl shadow border border-[#BEB7A4] max-w-4xl mx-auto">
      {/* City Filter */}
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="px-4 py-2 text-[#000000] bg-white border border-[#BEB7A4] rounded-md shadow-sm focus:ring-2 focus:ring-[#FF7F11] focus:outline-none"
      >
        <option value="">All Cities</option>
        {uniqueCities.map((loc) => (
          // Added 'key' prop here, using 'loc' as it's unique for each city option
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
          setBreed(""); // Reset breed filter when type changes to avoid invalid combinations
        }}
        className="px-4 py-2 text-[#000000] bg-white border border-[#BEB7A4] rounded-md shadow-sm focus:ring-2 focus:ring-[#FF7F11] focus:outline-none"
      >
        <option value="">All Types</option>
        {uniqueTypes.map((t) => (
          // Added 'key' prop here, using 't' as it's unique for each type option
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
        {/* 'breedOptions' is already unique and sorted from its useEffect */}
        {breedOptions.map((b) => (
          // Added 'key' prop here, using 'b' as it's unique for each breed option
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PetFilter;