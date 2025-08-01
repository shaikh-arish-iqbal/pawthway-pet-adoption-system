// src/pages/ShelterInfoForm.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// MyFooter is commented out in your original return, so I'll keep it out of the main design focus
// import MyFooter from "../components/Footer";

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
        toast.error("Failed to load shelter information.");
      } finally {
        setLoading(false);
      }
    };

    fetchShelterInfo();
  }, [auth.currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("You must be logged in to save shelter information.");
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
      toast.success("Shelter information saved successfully!");
      setIsNewShelter(false);
    } catch (error) {
      console.error("Error saving shelter info:", error);
      toast.error("Error saving shelter information: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-lg text-gray-700">
        Loading shelter information...
      </div>
    );
  }

  return (
    // Outer container: Adjusted min-h and padding to prevent main page scroll
    <div className="min-h-[calc(100vh-64px)] bg-[#FFFFFC] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Form Container: Adjusted max-w to accommodate two columns */}
      <div className="max-w-5xl w-full bg-white p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl space-y-8 border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF7F11] text-center mb-8">
          {isNewShelter
            ? "Add Your Shelter Information"
            : "Edit Shelter Information"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
        >
          {/* Shelter Name */}
          <div className="md:col-span-1">
            {" "}
            {/* Ensures it takes 1 column on medium screens */}
            <label
              htmlFor="shelterName"
              className="block text-lg font-semibold text-[#BEB7A4] mb-2"
            >
              Shelter Name <span className="text-[#FF1B1C]">*</span>
            </label>
            <input
              type="text"
              id="shelterName"
              value={shelterName}
              onChange={(e) => setShelterName(e.target.value)}
              placeholder="Enter your shelter's name"
              className="w-full p-3 border border-[#BEB7A4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black placeholder-gray-500 transition duration-200"
              required
            />
          </div>

          {/* Location */}
          <div className="md:col-span-1">
            <label
              htmlFor="location"
              className="block text-lg font-semibold text-[#BEB7A4] mb-2"
            >
              Location (City, State/Province, Country){" "}
              <span className="text-[#FF1B1C]">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Nagpur, Maharashtra, India"
              className="w-full p-3 border border-[#BEB7A4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black placeholder-gray-500 transition duration-200"
              required
            />
          </div>

          {/* Contact Email */}
          <div className="md:col-span-1">
            <label
              htmlFor="contactEmail"
              className="block text-lg font-semibold text-[#BEB7A4] mb-2"
            >
              Contact Email <span className="text-[#FF1B1C]">*</span>
            </label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="shelter@example.com"
              className="w-full p-3 border border-[#BEB7A4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black placeholder-gray-500 transition duration-200"
              required
            />
          </div>

          {/* Contact Phone Number */}
          <div className="md:col-span-1">
            <label
              htmlFor="contactPhone"
              className="block text-lg font-semibold text-[#BEB7A4] mb-2"
            >
              Contact Phone Number
            </label>
            <input
              type="tel"
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 1234567890"
              className="w-full p-3 border border-[#BEB7A4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black placeholder-gray-500 transition duration-200"
            />
          </div>

          {/* Website URL - Now included and styled */}
          <div className="md:col-span-2">
            {" "}
            {/* This field spans both columns */}
            <label
              htmlFor="website"
              className="block text-lg font-semibold text-[#BEB7A4] mb-2"
            >
              Website URL
            </label>
            <input
              type="url"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.yourshelter.org"
              className="w-full p-3 border border-[#BEB7A4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black placeholder-gray-500 transition duration-200"
            />
          </div>

          {/* Shelter Description */}
          <div className="md:col-span-2">
            {" "}
            {/* This field spans both columns */}
            <label
              htmlFor="description"
              className="block text-lg font-semibold text-[#BEB7A4] mb-2"
            >
              Shelter Description <span className="text-[#FF1B1C]">*</span>
            </label>
            <textarea
              id="description"
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your shelter's mission, values, and what makes it special. (e.g., number of animals housed, specific rescue efforts, community involvement)."
              className="w-full p-3 border border-[#BEB7A4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F11] text-black placeholder-gray-500 transition duration-200 resize-y"
              required
            ></textarea>
          </div>

          {/* Submit Button - Also spans both columns */}
          <button
            type="submit"
            className="md:col-span-2 w-full bg-[#FF7F11] hover:bg-[#FF1B1C] text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300 font-bold text-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF7F11] focus:ring-offset-2 cursor-pointer"
          >
            {isNewShelter
              ? "Save Shelter Information"
              : "Update Shelter Information"}
          </button>
        </form>
      </div>
    </div>
  );
}
