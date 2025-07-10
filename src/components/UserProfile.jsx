import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Pencil } from "lucide-react";
import MyFooter from "../components/Footer";

export default function UserProfile() {
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    aadhaar: "",
    gender: "",
    dob: "",
    age: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);
  const [aadhaarError, setAadhaarError] = useState("");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUid(currentUser.uid);
      const fetchData = async () => {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || "",
            surname: data.surname || "",
            email: data.email || currentUser.email || "",
            phone: data.phone || "",
            address: data.address || "",
            aadhaar: data.aadhaar || "",
            gender: data.gender || "",
            dob: data.dob || "",
            age: data.age || "",
          });
        }
        setLoading(false);
      };
      fetchData();
    }
  }, []);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "aadhaar") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 12) {
        setUserData((prev) => ({ ...prev, [name]: digitsOnly }));
      }
    } else if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setUserData((prev) => ({ ...prev, phone: digitsOnly }));
      }
    } else if (name === "dob") {
      const age = calculateAge(value);
      setUserData((prev) => ({ ...prev, dob: value, age }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (userData.aadhaar.length !== 12) {
      setAadhaarError("Aadhaar number must be exactly 12 digits.");
      return;
    }
    setAadhaarError("");

    if (uid) {
      await setDoc(
        doc(db, "users", uid),
        { ...userData, role: "user" },
        { merge: true }
      );
      setEditing(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <div className="mb-10 mt-10 min-h-screen flex items-center justify-center bg-white bg-[url('https://www.transparenttextures.com/patterns/dotted-background.png')]">
        <div className="bg-[#FFFFFC] w-full max-w-3xl rounded-2xl shadow-xl px-10 py-8 relative animate-fade-in">
          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt="avatar"
            className="w-24 h-24 mx-auto rounded-full mb-4"
          />
          <h2 className="text-3xl font-bold text-center text-[#FF7F11] mb-2">
            Profile
          </h2>
          {userData.name && (
            <p className="text-center text-lg text-gray-600 mb-6">
              Welcome, {userData.name}!
            </p>
          )}

          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-5 right-5 text-[#FF7F11] hover:text-[#FF1B1C] transition duration-300"
          >
            <Pencil size={22} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6 gap-4">
            {/* Name */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={userData.name}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full px-4 py-2 rounded-lg border text-black placeholder:text-gray-400 ${
                  editing
                    ? "bg-white border-[#FF7F11] focus:outline-[#FF7F11]"
                    : "bg-gray-100"
                }`}
              />
            </div>

            {/* Surname */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Surname
              </label>
              <input
                type="text"
                name="surname"
                placeholder="Last Name"
                value={userData.surname}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full px-4 py-2 rounded-lg border text-black placeholder:text-gray-400 ${
                  editing
                    ? "bg-white border-[#FF7F11] focus:outline-[#FF7F11]"
                    : "bg-gray-100"
                }`}
              />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-[#222] font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                readOnly
                value={userData.email}
                className="w-full px-4 py-2 rounded-lg bg-gray-100 text-black"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Phone Number
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-200 rounded-l-lg text-[#333] font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  readOnly={!editing}
                  inputMode="numeric"
                  className={`w-full px-4 py-2 rounded-r-lg border text-black ${
                    editing ? "bg-white border-[#FF7F11]" : "bg-gray-100"
                  }`}
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* Aadhaar */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Aadhaar ID
              </label>
              <input
                type="text"
                name="aadhaar"
                placeholder="12-digit Aadhaar"
                value={userData.aadhaar}
                onChange={handleChange}
                readOnly={!editing}
                inputMode="numeric"
                className={`w-full px-4 py-2 rounded-lg border text-black ${
                  editing ? "bg-white border-[#FF7F11]" : "bg-gray-100"
                }`}
                maxLength={12}
                minLength={12}
                pattern="\d{12}"
              />
              {aadhaarError && (
                <p className="text-red-600 text-sm mt-1">{aadhaarError}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={userData.gender}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 rounded-lg border text-black ${
                  editing ? "bg-white border-[#FF7F11]" : "bg-gray-100"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={userData.dob}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full px-4 py-2 rounded-lg border text-black ${
                  editing ? "bg-white border-[#FF7F11]" : "bg-gray-100"
                }`}
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-[#222] font-semibold mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={userData.age}
                readOnly
                className="w-full px-4 py-2 rounded-lg bg-gray-100 text-black"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-[#222] font-semibold mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleChange}
                readOnly={!editing}
                placeholder="e.g. 123 Main St, Mumbai"
                className={`w-full px-4 py-2 rounded-lg border text-black ${
                  editing ? "bg-white border-[#FF7F11]" : "bg-gray-100"
                }`}
              />
            </div>
          </div>

          {editing && (
            <button
              onClick={handleSave}
              className="mt-6 w-full bg-[#FF7F11] text-white py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-[#FF1B1C] hover:scale-[1.02] active:scale-95"
            >
              Save
            </button>
          )}
        </div>
      </div>
      <MyFooter />
    </div>
  );
}
