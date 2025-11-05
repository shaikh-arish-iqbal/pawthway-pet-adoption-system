import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import MyFooter from "../components/Footer";
import { toast } from "react-toastify";

const AdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    householdSize: "",
    hasChildren: "",
    hasOtherPets: "",
    petExperience: "",
    reasonForAdoption: "",
    timeAtHome: "",
    livingSituation: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const petRef = doc(db, "pets", id);
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          setPet(petSnap.data());
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim())
          newErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email is invalid";
        if (!formData.phone.trim())
          newErrors.phone = "Phone number is required";
        break;
      case 2:
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.zipCode.trim())
          newErrors.zipCode = "ZIP code is required";
        break;
      case 3:
        if (!formData.householdSize)
          newErrors.householdSize = "Please select household size";
        if (!formData.hasChildren)
          newErrors.hasChildren = "Please answer about children";
        if (!formData.hasOtherPets)
          newErrors.hasOtherPets = "Please answer about other pets";
        if (!formData.petExperience)
          newErrors.petExperience = "Please describe your pet experience";
        break;
      case 4:
        if (!formData.reasonForAdoption.trim())
          newErrors.reasonForAdoption = "Please explain your reason for adoption";
        if (!formData.timeAtHome)
          newErrors.timeAtHome = "Please select time spent at home";
        if (!formData.livingSituation)
          newErrors.livingSituation = "Please select your living situation";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user ? user.uid : null;

      const adoptionData = {
        ...formData,
        petId: id,
        petName: pet?.name || "",
        userId,
        timestamp: serverTimestamp(),
        status: "pending",
      };

      await addDoc(collection(db, "adoptionForms"), adoptionData);

      toast.success("Thank you for your adoption application! We'll contact you soon.");
      navigate("/Adopt");
    } catch (error) {
      console.error("Error submitting adoption form:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FF7F11] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#7a7568] text-lg">Loading adoption form...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
            Pet Not Found
          </h2>
          <p className="text-[#7a7568] mb-6">
            This pet may have already been adopted.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/Adopt")}
            className="bg-[#FF7F11] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e56e0e] transition-colors"
          >
            Browse Other Pets
          </motion.button>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Personal Information" },
    { number: 2, title: "Address Details" },
    { number: 3, title: "Household & Experience" },
    { number: 4, title: "Adoption Details" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-[#BEB7A4]/20 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#FF7F11] hover:text-[#FF1B1C] transition-colors font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Pet Details
          </motion.button>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-black text-[#FF1B1C] mb-6 text-center">
            Adoption Application for {pet.name}
          </h1>

          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${
                    currentStep >= step.number
                      ? "bg-[#FF7F11] border-[#FF7F11] text-white"
                      : "bg-white border-[#BEB7A4] text-[#BEB7A4]"
                  }`}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.number
                        ? "bg-[#FF7F11]"
                        : "bg-[#BEB7A4]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#FF1B1C]">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-[#FF1B1C] mb-6">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#7a7568] font-semibold mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`text-black w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 ${
                        errors.firstName
                          ? "border-red-500"
                          : "border-[#BEB7A4] focus:border-[#FF7F11]"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#7a7568] font-semibold mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                        errors.lastName
                          ? "border-red-500"
                          : "border-[#BEB7A4] focus:border-[#FF7F11]"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.email
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.phone
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Address Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-[#FF1B1C] mb-6">
                  Address Details
                </h3>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.address
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[#7a7568] font-semibold mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                        errors.city
                          ? "border-red-500"
                          : "border-[#BEB7A4] focus:border-[#FF7F11]"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#7a7568] font-semibold mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                        errors.state
                          ? "border-red-500"
                          : "border-[#BEB7A4] focus:border-[#FF7F11]"
                      }`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#7a7568] font-semibold mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                        errors.zipCode
                          ? "border-red-500"
                          : "border-[#BEB7A4] focus:border-[#FF7F11]"
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Household & Experience */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-[#FF1B1C] mb-6">
                  Household & Experience
                </h3>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Household Size *
                  </label>
                  <input
                    type="text"
                    name="householdSize"
                    value={formData.householdSize}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.householdSize
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.householdSize && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.householdSize}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Do you have children? *
                  </label>
                  <input
                    type="text"
                    name="hasChildren"
                    value={formData.hasChildren}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.hasChildren
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.hasChildren && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.hasChildren}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Do you have other pets? *
                  </label>
                  <input
                    type="text"
                    name="hasOtherPets"
                    value={formData.hasOtherPets}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.hasOtherPets
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.hasOtherPets && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.hasOtherPets}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Describe your pet experience *
                  </label>
                  <input
                    type="text"
                    name="petExperience"
                    value={formData.petExperience}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.petExperience
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.petExperience && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.petExperience}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Adoption Details */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-[#FF1B1C] mb-6">
                  Adoption Details
                </h3>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Reason for Adoption *
                  </label>
                  <input
                    type="text"
                    name="reasonForAdoption"
                    value={formData.reasonForAdoption}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.reasonForAdoption
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.reasonForAdoption && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reasonForAdoption}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Time spent at home *
                  </label>
                  <input
                    type="text"
                    name="timeAtHome"
                    value={formData.timeAtHome}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.timeAtHome
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.timeAtHome && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.timeAtHome}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Living Situation *
                  </label>
                  <input
                    type="text"
                    name="livingSituation"
                    value={formData.livingSituation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.livingSituation
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  />
                  {errors.livingSituation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.livingSituation}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex items-center justify-between">
              {currentStep > 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={prevStep}
                  className="bg-white text-[#FF7F11] border-2 border-[#FF7F11] px-6 py-3 rounded-full font-semibold hover:bg-[#fff3ea] transition-colors"
                >
                  Back
                </motion.button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={nextStep}
                  className="bg-[#FF7F11] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e56e0e] transition-colors"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-[#FF7F11] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e56e0e] transition-colors"
                >
                  Submit Application
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdoptionForm;
