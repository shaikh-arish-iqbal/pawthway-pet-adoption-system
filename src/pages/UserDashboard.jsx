// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  PlusCircle,
  Edit,
  Trash2,
  Heart,
  FileText,
  User,
  LogOut,
  Upload,
  X,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { auth, db, storage } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { signOut } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [petImages, setPetImages] = useState([]);
  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (["edit", "delete"].includes(activeTab)) fetchPets();
  }, [activeTab]);

  const fetchPets = async () => {
    const snap = await getDocs(collection(db, "pets"));
    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPets(arr.filter((p) => p.userId === userId));
  };

  const resetForm = () => {
    setPetImages([]);
    setPetName("");
    setBreed("");
    setAge("");
    setDescription("");
    setEditingPet(null);
    setUploadProgress(0);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleAddPet = async () => {
    if (!petName || !breed || !age || !description || petImages.length === 0) {
      return toast.error("All fields are required.");
    }
    setLoading(true);
    let imageUrls = [];
    for (let file of petImages) {
      const imgRef = ref(storage, `pets/${uuidv4()}-${file.name}`);
      await uploadBytes(imgRef, file);
      imageUrls.push(await getDownloadURL(imgRef));
      setUploadProgress((prev) => prev + 100 / petImages.length);
    }
    await addDoc(collection(db, "pets"), {
      userId,
      name: petName,
      breed,
      age,
      description,
      imageUrls,
      createdAt: new Date(),
    });
    toast.success("Pet added!");
    resetForm();
    setActiveTab("dashboard");
    setLoading(false);
  };

  const handleEditClick = (pet) => {
    setEditingPet(pet);
    setPetName(pet.name);
    setBreed(pet.breed);
    setAge(pet.age);
    setDescription(pet.description);
    setPetImages([]);
  };

  const handleUpdatePet = async () => {
    setLoading(true);
    let updatedUrls = editingPet.imageUrls;
    if (petImages.length) {
      updatedUrls = [];
      for (let file of petImages) {
        const imgRef = ref(storage, `pets/${uuidv4()}-${file.name}`);
        await uploadBytes(imgRef, file);
        updatedUrls.push(await getDownloadURL(imgRef));
      }
    }
    await updateDoc(doc(db, "pets", editingPet.id), {
      name: petName,
      breed,
      age,
      description,
      imageUrls: updatedUrls,
      updatedAt: new Date(),
    });
    toast.success("Pet updated!");
    resetForm();
    setActiveTab("edit");
    setLoading(false);
  };

  const handleDelete = async (id, urls) => {
    if (!confirm("Are you sure?")) return;
    await deleteDoc(doc(db, "pets", id));
    for (let url of urls) {
      const path = decodeURIComponent(new URL(url).pathname.split("/o/")[1]);
      await deleteObject(ref(storage, path));
    }
    setPets((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted!");
  };

  const removeImage = (idx) =>
    setPetImages((ps) => ps.filter((_, i) => i !== idx));

  const renderForm = (title, onSubmit) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-[#FF1B1C] mb-6">{title}</h2>
      <div className="border-2 border-dashed border-[#BEB7A4] rounded-xl p-6 text-center mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          id="image-upload"
          className="hidden"
          onChange={(e) => setPetImages([...e.target.files])}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-[#BEB7A4] mx-auto mb-2" />
          <p className="text-[#7a7568]">Upload pet images</p>
        </label>
      </div>
      {petImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {petImages.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                onClick={() => removeImage(i)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {uploadProgress > 0 && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="bg-[#FF7F11] h-2 rounded-full"
            />
          </div>
          <p className="text-sm text-[#7a7568] mt-1">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {["Pet Name", "Breed", "Age"].map((label, idx) => {
          const val = [petName, breed, age][idx];
          const setter = [setPetName, setBreed, setAge][idx];
          return (
            <div key={label}>
              <label className="block text-[#7a7568] font-semibold mb-1">
                {label}
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:ring-[#FF7F11]/30 text-black"
                value={val}
                onChange={(e) => setter(e.target.value)}
              />
            </div>
          );
        })}
      </div>
      <div className="mb-6">
        <label className="block text-[#7a7568] font-semibold mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:ring-[#FF7F11]/30 text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin border-b-2 h-5 w-5 inline-block"></span>
          ) : (
            <CheckCircle size={20} />
          )}
          {editingPet ? "Update Pet" : "Add Pet"}
        </motion.button>
        {editingPet && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetForm}
            className="px-6 py-3 bg-gray-300 text-black rounded-xl font-bold"
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  /** Profile form logic **/
  const [userData, setUserData] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");
  useEffect(() => {
    if (activeTab === "profile") {
      const u = auth.currentUser;
      if (u) {
        getDocs(doc(db, "users", u.uid)).then((docSnap) =>
          setUserData(docSnap.data())
        );
      }
    }
  }, [activeTab]);
  const saveProfile = async () => {
    if (userData.aadhaar?.length !== 12) {
      setAadhaarError("Aadhaar must be 12 digits");
      return;
    }
    await updateDoc(doc(db, "users", auth.currentUser.uid), userData);
    setEditingProfile(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-black/90 backdrop-blur-xl p-6 text-white space-y-4"
      >
        <div className="text-3xl font-bold">PAWTHWAY🐾</div>
        {[
          ["Dashboard", Home, "dashboard"],
          ["My Adoptions", FileText, "adoptions"],
          ["Favorites", Heart, "favorites"],
          ["Profile", User, "profile"],
        ].map(([label, Icon, key]) => (
          <SidebarButton
            key={key}
            label={label}
            icon={Icon}
            active={activeTab === key}
            onClick={() => setActiveTab(key)}
          />
        ))}
        <SidebarButton
          label="Logout"
          icon={LogOut}
          onClick={handleLogout}
          danger
        />
      </motion.aside>

      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl font-black text-[#FF1B1C] mb-8">
            User Dashboard
          </h1>

          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                icon={PlusCircle}
                title="Add a New Pet"
                onClick={() => setActiveTab("add")}
              />
              <Card
                icon={Edit}
                title="Edit Pet"
                onClick={() => setActiveTab("edit")}
              />
              <Card
                icon={Trash2}
                title="Remove Pet"
                onClick={() => setActiveTab("delete")}
              />
              <Card
                icon={Heart}
                title="Favorites"
                onClick={() => setActiveTab("favorites")}
              />
              <Card
                icon={FileText}
                title="My Adoptions"
                onClick={() => setActiveTab("adoptions")}
              />
            </div>
          )}

          {activeTab === "add" && renderForm("Add New Pet", handleAddPet)}
          {activeTab === "edit" && !editingPet && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pets.map((p) => (
                <Card
                  key={p.id}
                  icon={Edit}
                  title={p.name}
                  onClick={() => handleEditClick(p)}
                />
              ))}
            </div>
          )}
          {activeTab === "edit" &&
            editingPet &&
            renderForm("Edit Pet", handleUpdatePet)}
          {activeTab === "delete" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pets.map((p) => (
                <Card
                  key={p.id}
                  icon={Trash2}
                  title={p.name}
                  onClick={() => handleDelete(p.id, p.imageUrls)}
                />
              ))}
            </div>
          )}
          {activeTab === "adoptions" && (
            <p className="text-[#7a7568]">You have no adoptions yet.</p>
          )}
          {activeTab === "favorites" && (
            <p className="text-[#7a7568]">No favorites added yet.</p>
          )}

          {activeTab === "profile" && userData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto relative"
            >
              <h2 className="text-3xl font-bold text-[#FF1B1C] mb-6">
                Profile
              </h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="absolute top-5 right-5 text-[#FF7F11] hover:text-[#FF1B1C]"
              >
                <Pencil size={22} />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  "name",
                  "surname",
                  "phone",
                  "aadhaar",
                  "gender",
                  "dob",
                  "address",
                ].map((field) => (
                  <>
                    <div key={field}>
                      <label className="block text-[#7a7568] font-semibold mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        name={field}
                        value={userData[field] || ""}
                        onChange={(e) =>
                          setUserData({ ...userData, [field]: e.target.value })
                        }
                        readOnly={!editingProfile}
                        className={`w-full px-4 py-2 rounded-lg border text-black placeholder:text-gray-400 ${
                          editingProfile
                            ? "bg-white border-[#FF7F11] focus:outline-[#FF7F11]"
                            : "bg-gray-100"
                        }`}
                      />
                      {field === "aadhaar" && aadhaarError && (
                        <p className="text-red-600 text-sm mt-1">
                          {aadhaarError}
                        </p>
                      )}
                    </div>
                  </>
                ))}
              </div>
              {editingProfile && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  className="mt-4 w-full bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-3 rounded-xl"
                >
                  Save Profile
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function SidebarButton({ icon: Icon, label, active, onClick, danger }) {
  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group w-full ${
        active
          ? "bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white shadow-lg"
          : danger
          ? "hover:bg-red-500/20 text-red-400"
          : "hover:bg-white/10 text-white"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </motion.button>
  );
}

function Card({ icon: Icon, title, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer border border-[#BEB7A4]/20"
    >
      <Icon className="text-[#FF7F11] mb-2" size={28} />
      <p className="text-[#FF1B1C] font-semibold">{title}</p>
    </motion.div>
  );
}
