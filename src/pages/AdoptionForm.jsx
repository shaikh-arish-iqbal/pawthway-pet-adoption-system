import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import MyFooter from "../components/Footer";

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
          newErrors.reasonForAdoption =
            "Please explain your reason for adoption";
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
    if (validateStep(currentStep)) {
      console.log("Form submitted:", { petId: id, ...formData });
      alert("Thank you for your adoption application! We'll contact you soon.");
      navigate("/Adopt");
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
                    Number of people in household *
                  </label>
                  <select
                    name="householdSize"
                    value={formData.householdSize}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.householdSize
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  >
                    <option value="">Select...</option>
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5+">5+ people</option>
                  </select>
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
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasChildren"
                        value="yes"
                        checked={formData.hasChildren === "yes"}
                        onChange={handleInputChange}
                        className="mr-2 text-black"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasChildren"
                        value="no"
                        checked={formData.hasChildren === "no"}
                        onChange={handleInputChange}
                        className="mr-2 text-black"
                      />
                      No
                    </label>
                  </div>
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
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasOtherPets"
                        value="yes"
                        checked={formData.hasOtherPets === "yes"}
                        onChange={handleInputChange}
                        className="mr-2 text-black"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasOtherPets"
                        value="no"
                        checked={formData.hasOtherPets === "no"}
                        onChange={handleInputChange}
                        className="mr-2 text-black "
                      />
                      No
                    </label>
                  </div>
                  {errors.hasOtherPets && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.hasOtherPets}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Previous pet experience *
                  </label>
                  <textarea
                    name="petExperience"
                    value={formData.petExperience}
                    onChange={handleInputChange}
                    placeholder="Describe your experience with pets..."
                    rows="4"
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
                    Why do you want to adopt {pet.name}? *
                  </label>
                  <textarea
                    name="reasonForAdoption"
                    value={formData.reasonForAdoption}
                    onChange={handleInputChange}
                    placeholder="Tell us why you want to adopt this pet..."
                    rows="4"
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
                    How much time do you spend at home? *
                  </label>
                  <select
                    name="timeAtHome"
                    value={formData.timeAtHome}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.timeAtHome
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  >
                    <option value="">Select...</option>
                    <option value="Most of the day">Most of the day</option>
                    <option value="Part of the day">Part of the day</option>
                    <option value="Evenings only">Evenings only</option>
                    <option value="Weekends only">Weekends only</option>
                  </select>
                  {errors.timeAtHome && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.timeAtHome}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#7a7568] font-semibold mb-2">
                    Living situation *
                  </label>
                  <select
                    name="livingSituation"
                    value={formData.livingSituation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 text-black focus:ring-[#FF7F11]/30 ${
                      errors.livingSituation
                        ? "border-red-500"
                        : "border-[#BEB7A4] focus:border-[#FF7F11]"
                    }`}
                  >
                    <option value="">Select...</option>
                    <option value="Own home">Own home</option>
                    <option value="Rent house">Rent house</option>
                    <option value="Rent apartment">Rent apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.livingSituation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.livingSituation}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#BEB7A4] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#a8a194] transition-colors"
                >
                  Previous
                </motion.button>
              )}

              {currentStep < 4 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Next Step
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Submit Application
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>

      <MyFooter />
    </div>
  );
};

export default AdoptionForm;
