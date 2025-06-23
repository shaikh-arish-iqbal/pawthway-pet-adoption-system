// AdminDashboard.jsx - Add Pet Editing Functionality (Improved Flow)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Heart, Mail, Users, Settings,
  PlusCircle, Edit, Trash2, FileText, Grid, BarChart, LogOut
} from "lucide-react";
import { storage, db, auth } from "../firebaseConfig";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";
import {
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

// Import the ShelterInfoForm component
import ShelterInfoForm from "./ShelterInfoForm"; // Make sure the path is correct

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [petImages, setPetImages] = useState([]);
  const [petName, setPetName] = useState("");
  // const [description, setDescription] = "";
  const [type, setType] = useState("Cat");
  const [breed, setBreed] = useState("");
  const [personality, setPersonality] = useState("");
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (["edit", "delete", "applications"].includes(activeTab)) {
      getDocs(collection(db, "pets"))
        .then(snapshot => setPets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        .catch(e => alert("Failed to load pets: " + e.message));
    }
  }, [activeTab]);

  const resetForm = () => {
    setPetImages([]);
    setPetName("");
    setDescription("");
    setType("Cat");
    setBreed("");
    setPersonality("");
    setEditingPet(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleAddPet = async () => {
    if (petImages.length === 0 || !petName || !description || !breed || !personality) {
      return alert("Fill all fields and select at least one image");
    }

    const imageUrls = [];
    for (const file of petImages) {
      const imageRef = ref(storage, `pets/${uuidv4()}-${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }

    await addDoc(collection(db, "pets"), {
      name: petName,
      description, type, breed, personality,
      imageUrls,
      shelterId: auth.currentUser?.uid || null,
      createdAt: new Date(),
    });

    alert("Pet added");
    resetForm();
  };

  const handleDeletePet = async (petId, imageUrls) => {
    await deleteDoc(doc(db, "pets", petId));
    if (Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        const path = decodeURIComponent(new URL(url).pathname.split("/o/")[1]);
        await deleteObject(ref(storage, path));
      }
    }
    alert("Deleted");
    setPets(prev => prev.filter(p => p.id !== petId));
  };

  const handleEditClick = (pet) => {
    setEditingPet(pet);
    setPetName(pet.name);
    setDescription(pet.description);
    setBreed(pet.breed);
    setType(pet.type);
    setPersonality(pet.personality);
    setPetImages([]);
  };

  const handleUpdatePet = async () => {
    if (!editingPet) return;
    let updatedImageUrls = editingPet.imageUrls || [];
    if (petImages.length > 0) {
      updatedImageUrls = [];
      for (const file of petImages) {
        const imageRef = ref(storage, `pets/${uuidv4()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        updatedImageUrls.push(url);
      }
    }
    await updateDoc(doc(db, "pets", editingPet.id), {
      name: petName,
      description, type, breed, personality,
      imageUrls: updatedImageUrls,
    });
    alert("Pet updated");
    resetForm();
    setActiveTab("edit");
  };

  return (
    <div className="flex min-h-screen bg-[#FFFFFC]">
      <aside className="w-64 bg-[#000000] text-white p-6 space-y-6">
        <div className="text-2xl font-bold flex items-center space-x-3">
          <span className="text-3xl">🐾</span><span>Pawthway</span>
        </div>
        <nav className="flex flex-col space-y-4">
          <SidebarButton icon={Home} label="Dashboard" onClick={() => setActiveTab("dashboard")} active={activeTab === "dashboard"} />
          <SidebarButton icon={Heart} label="Adoptions" onClick={() => setActiveTab("applications")} active={activeTab === "applications"} />
          <SidebarButton icon={Mail} label="Messages" onClick={() => setActiveTab("messages")} active={activeTab === "messages"} />
          <SidebarButton icon={Users} label="Users" onClick={() => setActiveTab("users")} active={activeTab === "users"} />
          <SidebarButton icon={Settings} label="Settings" onClick={() => setActiveTab("settings")} active={activeTab === "settings"} />

          {/* New: Shelter Information Button under Settings */}
          <SidebarButton icon={FileText} label="Shelter Info" onClick={() => setActiveTab("shelter-info")} active={activeTab === "shelter-info"} />

          <SidebarButton icon={LogOut} label="Logout" onClick={handleLogout} active={false} danger />
        </nav>
      </aside>

      <main className="flex-1 p-30">
        <h1 className="text-3xl font-bold text-[#000000] mb-8">Admin Dashboard</h1>
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card icon={PlusCircle} title="Add a New Pet" onClick={() => setActiveTab("add")} />
            <Card icon={Edit} title="Edit Pet" onClick={() => setActiveTab("edit")} />
            <Card icon={Trash2} title="Remove Pet" onClick={() => setActiveTab("delete")} />
            <Card icon={FileText} title="View Applications" onClick={() => setActiveTab("applications")} />
            <Card icon={Grid} title="Manage Categories" onClick={() => alert("Coming soon")} />
            <Card icon={BarChart} title="Generate Reports" onClick={() => alert("Coming soon")} />
          </div>
        )}

        {activeTab === "add" && renderForm("Add New Pet", handleAddPet)}

        {activeTab === "edit" && !editingPet && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#000000]">Select Pet to Edit</h2>
            {pets.map((pet) => (
              <div key={pet.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                <div><p className="font-bold text-[#000000]">{pet.name}</p><p className="text-sm text-[#000000]">{pet.type} - {pet.breed}</p></div>
                <button onClick={() => handleEditClick(pet)} className="bg-[#FF7F11] text-white px-3 py-1 rounded cursor-pointer">Edit</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "edit" && editingPet && renderForm("Edit Pet", handleUpdatePet)}

        {activeTab === "delete" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#000000]">Remove Pets</h2>
            {pets.map((pet) => (
              <div key={pet.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                <div><p className="font-bold text-[#000000]">{pet.name}</p><p className="text-sm text-[#000000]">{pet.type} - {pet.breed}</p></div>
                <button onClick={() => handleDeletePet(pet.id, pet.imageUrls)} className="bg-[#FF1B1C] text-white px-3 py-1 rounded cursor-pointer">Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* New: Render ShelterInfoForm when activeTab is 'shelter-info' */}
        {activeTab === "shelter-info" && (
          <div className="space-y-4">
            {/* <h2 className="text-xl font-semibold text-[#000000]">Shelter Information</h2> */}
            <ShelterInfoForm /> {/* Render the component */}
          </div>
        )}

      </main>
    </div>
  );

  function renderForm(title, onSubmit) {
    return (
      <div className="space-y-4 text-[#000000]">
        <h2 className="text-xl font-semibold">{title}</h2>
        <label className="block text-[#000000] font-medium">Pet Images {editingPet ? "(leave empty to keep existing)" : "(multiple allowed)"}</label>
        <input type="file" multiple onChange={(e) => setPetImages(Array.from(e.target.files))} className="cursor-pointer" />
        <label className="block text-[#000000] font-medium">Pet Name</label>
        <input className="block border border-[#BEB7A4] p-2 w-full text-[#000000] placeholder-[#BEB7A4]" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g., Simba" />
        <label className="block text-[#000000] font-medium">Description</label>
        <textarea className="block border border-[#BEB7A4] p-2 w-full text-[#000000] placeholder-[#BEB7A4]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
        <label className="block text-[#000000] font-medium">Breed</label>
        <input className="block border border-[#BEB7A4] p-2 w-full text-[#000000] placeholder-[#BEB7A4]" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g., Labrador" />
        <label className="block text-[#000000] font-medium">Personality</label>
        <textarea className="block border border-[#BEB7A4] p-2 w-full text-[#000000] placeholder-[#BEB7A4]" value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="e.g., Friendly, playful" />
        <button className="bg-[#FF7F11] hover:bg-[#FF1B1C] text-white px-4 py-2 rounded cursor-pointer" onClick={onSubmit}>{editingPet ? "Update" : "Add"}</button>
        {editingPet && <button className="ml-4 px-4 py-2 rounded bg-gray-300 text-black" onClick={resetForm}>Cancel</button>}
      </div>
    );
  }
}

function Card({ icon: Icon, title, onClick }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow hover:shadow-md transition cursor-pointer group">
      <div className="p-4 rounded-full mb-4">
        <Icon size={32} className="text-[#FF7F11] group-hover:text-[#FF1B1C] transition" />
      </div>
      <h2 className="text-lg font-semibold text-[#1F2937] text-center">{title}</h2>
    </div>
  );
}

function SidebarButton({ icon: Icon, label, onClick, active, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-3 py-2 rounded transition group cursor-pointer ${
        active ? "bg-[#1A1A1A] text-[#FF7F11]" : danger ? "hover:bg-[#1A1A1A] text-[#FF1B1C]" : "hover:bg-[#1A1A1A]"
      }`}
    >
      <Icon size={20} className={`transition ${active || danger ? "text-[#FF7F11] group-hover:text-[#FF1B1C]" : "text-white group-hover:text-[#FF1B1C]"}`} />
      <span>{label}</span>
    </button>
  );
}