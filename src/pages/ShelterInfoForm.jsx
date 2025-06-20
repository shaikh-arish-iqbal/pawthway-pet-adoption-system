// src/pages/ShelterInfoForm.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import MyFooter from "../components/Footer";

export default function ShelterInfoForm() {
  const [shelterName, setShelterName] = useState("");
  const [location, setLocation] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [isNewShelter, setIsNewShelter] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShelterInfo = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const shelterDocRef = doc(db, "shelters", auth.currentUser.uid);
        const shelterDocSnap = await getDoc(shelterDocRef);

        if (shelterDocSnap.exists()) {
          const data = shelterDocSnap.data();
          setShelterName(data.shelterName || "");
          setLocation(data.location || "");
          setContactEmail(data.contactEmail || "");
          setContactPhone(data.contactPhone || "");
          setWebsite(data.website || "");
          setDescription(data.description || "");
          setIsNewShelter(false);
        } else {
          setIsNewShelter(true);
        }
      } catch (error) {
        console.error("Error fetching shelter info:", error);
        alert("Failed to load shelter information.");
      } finally {
        setLoading(false);
      }
    };

    fetchShelterInfo();
  }, [auth.currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("You must be logged in to save shelter information.");
      navigate("/login");
      return;
    }

    try {
      const shelterDocRef = doc(db, "shelters", auth.currentUser.uid);
      const shelterData = {
        shelterName,
        location,
        contactEmail,
        contactPhone,
        website,
        description,
        lastUpdated: new Date(),
        ownerUid: auth.currentUser.uid,
      };

      await setDoc(shelterDocRef, shelterData, { merge: true });
      alert("Shelter information saved successfully!");
      setIsNewShelter(false);
    } catch (error) {
      console.error("Error saving shelter info:", error);
      alert("Error saving shelter information: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading shelter info...
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-[#FFFFFC] p-8 md:p-30">
        <h1 className="text-3xl font-bold text-[#FF7F11] mb-6">
          {isNewShelter
            ? "Add Your Shelter Information"
            : "Edit Shelter Information"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6 max-w-2xl mx-auto"
        >
          <div>
            <label
              htmlFor="shelterName"
              className="block text-gray-700 font-medium mb-2"
            >
              Shelter Name
            </label>
            <input
              type="text"
              id="shelterName"
              value={shelterName}
              onChange={(e) => setShelterName(e.target.value)}
              placeholder="Enter your shelter's name"
              className="w-full p-3 border border-[#BEB7A4] rounded focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black" // ADDED text-black here
              required
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-gray-700 font-medium mb-2"
            >
              Location (City, State/Province, Country)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Nagpur, Maharashtra, India"
              className="w-full p-3 border border-[#BEB7A4] rounded focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black" // ADDED text-black here
              required
            />
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-gray-700 font-medium mb-2"
            >
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="shelter@example.com"
              className="w-full p-3 border border-[#BEB7A4] rounded focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black" // ADDED text-black here
              required
            />
          </div>

          <div>
            <label
              htmlFor="contactPhone"
              className="block text-gray-700 font-medium mb-2"
            >
              Contact Phone Number
            </label>
            <input
              type="tel"
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 1234567890"
              className="w-full p-3 border border-[#BEB7A4] rounded focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black" // ADDED text-black here
            />
          </div>

          {/* ... (Website URL commented out section remains the same) ... */}

          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Shelter Description
            </label>
            <textarea
              id="description"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your shelter's mission, values, and what makes it special."
              className="w-full p-3 border border-[#BEB7A4] rounded focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black" // ADDED text-black here
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF7F11] hover:bg-[#FF1B1C] text-white px-6 py-3 rounded shadow-md transition font-semibold"
          >
            {isNewShelter
              ? "Save Shelter Information"
              : "Update Shelter Information"}
          </button>
        </form>
      </div>

      <div>
        <MyFooter />
      </div>
    </div>
  );
}