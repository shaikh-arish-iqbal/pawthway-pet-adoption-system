// AdminDashboard.jsx - Only allow shelter-specific pet editing

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Home,
  Heart,
  Mail,
  Users,
  Settings,
  PlusCircle,
  Edit,
  Trash2,
  FileText,
  Grid,
  BarChart,
  LogOut,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  Paperclip, // New icon for certificate
} from "lucide-react";
import { storage, db, auth } from "../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import ShelterInfoForm from "./ShelterInfoForm";
import MyFooter from "../components/Footer";
import { toast } from "react-toastify";
import ConversationsList from "../components/ConversationsList";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [petImages, setPetImages] = useState([]);
  // NEW STATE: For vaccine certificate file
  const [vaccineCertificateFile, setVaccineCertificateFile] = useState(null);
  // NEW STATE: To hold the existing vaccine certificate URL for editing
  const [vaccineCertificateUrl, setVaccineCertificateUrl] = useState("");
  const [petName, setPetName] = useState("");
  const [type, setType] = useState("Cat");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [weight, setWeight] = useState("");
  const [personality, setPersonality] = useState("");
  const [description, setDescription] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE: collapsible sidebar

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "pets"));
        const allPets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const userPets = allPets.filter(
          (pet) => pet.shelterId === currentUser.uid
        );
        setPets(userPets);
      } catch (e) {
        toast.error("Failed to load pets: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    if (["edit", "delete", "applications"].includes(activeTab)) {
      fetchPets();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "applications") {
      const fetchAdoptionRequests = async () => {
        setLoadingRequests(true);
        try {
          const formsSnapshot = await getDocs(collection(db, "adoptionForms"));
          const allForms = formsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const filtered = [];
          for (const form of allForms) {
            const petDoc = await getDoc(doc(db, "pets", form.petId));
            if (
              petDoc.exists() &&
              petDoc.data().shelterId === auth.currentUser?.uid
            ) {
              filtered.push({
                ...form,
                petName: petDoc.data().name,
                petImage: petDoc.data().imageUrls?.[0] || "",
              });
            }
          }
          setAdoptionRequests(filtered);
        } catch (error) {
          toast.error("Failed to load adoption requests: " + error.message);
        } finally {
          setLoadingRequests(false);
        }
      };
      fetchAdoptionRequests();
    }
  }, [activeTab]);

  const resetForm = () => {
    setPetImages([]);
    setVaccineCertificateFile(null); // RESET: new state
    setVaccineCertificateUrl("");   // RESET: new state
    setPetName("");
    setDescription("");
    setType("Cat");
    setBreed("");
    setAge("");
    setGender("");
    setSize("");
    setColor("");
    setWeight("");
    setPersonality("");
    setLivingSituation("");
    setEditingPet(null);
    setUploadProgress(0);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleAddPet = async () => {
    // MODIFIED: Removed !vaccineCertificateFile check
    if (
      petImages.length === 0 ||
      !petName ||
      !description ||
      !breed ||
      !personality
    ) {
      return toast.error(
        "Please fill all required fields and select at least one image." // UPDATED message
      );
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Determine total uploads for progress calculation
      const totalUploads = petImages.length + (vaccineCertificateFile ? 1 : 0);
      let uploadedCount = 0;

      const imageUrls = [];
      for (let i = 0; i < petImages.length; i++) {
        const file = petImages[i];
        const imageRef = ref(storage, `pets/${uuidv4()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
        uploadedCount++;
        setUploadProgress((uploadedCount / totalUploads) * 100); 
      }
      
      // NEW: Upload Vaccine Certificate (Optional)
      let certUrl = "";
      if (vaccineCertificateFile) {
        const certRef = ref(storage, `vaccine_certificates/${uuidv4()}-${vaccineCertificateFile.name}`);
        await uploadBytes(certRef, vaccineCertificateFile);
        certUrl = await getDownloadURL(certRef);
        uploadedCount++;
        setUploadProgress((uploadedCount / totalUploads) * 100); // Final progress update
      }

      await addDoc(collection(db, "pets"), {
        name: petName,
        description,
        type,
        breed,
        age,
        gender,
        size,
        color,
        weight,
        personality,
        livingSituation,
        imageUrls,
        vaccineCertificateUrl: certUrl, // Save certificate URL (can be empty)
        shelterId: auth.currentUser?.uid || null,
        createdAt: new Date(),
      });

      toast.success("Pet added successfully!");
      resetForm();
    } catch (error) {
      toast.error("Error adding pet: " + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // MODIFIED: to also delete vaccine certificate
  const handleDeletePet = async (petId, imageUrls, certUrl) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "pets", petId));
      
      // Delete all images
      if (Array.isArray(imageUrls)) {
        for (const url of imageUrls) {
          try {
            const path = decodeURIComponent(
              new URL(url).pathname.split("/o/")[1]
            );
            await deleteObject(ref(storage, path));
          } catch (e) {
            console.error("Could not delete image: ", url, e);
          }
        }
      }

      // NEW: Delete Vaccine Certificate
      if (certUrl) {
        try {
          const certPath = decodeURIComponent(
            new URL(certUrl).pathname.split("/o/")[1]
          );
          await deleteObject(ref(storage, certPath));
        } catch (e) {
          console.error("Could not delete vaccine certificate: ", certUrl, e);
        }
      }

      toast.success("Pet deleted successfully!");
      setPets((prev) => prev.filter((p) => p.id !== petId));
    } catch (error) {
      toast.error("Error deleting pet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // MODIFIED: to load existing vaccine certificate URL
  const handleEditClick = (pet) => {
    if (pet.shelterId !== auth.currentUser?.uid) {
      return toast.error("You are not authorized to edit this pet.");
    }
    setEditingPet(pet);
    setPetName(pet.name || "");
    setDescription(pet.description || "");
    setBreed(pet.breed || "");
    setType(pet.type || "Cat");
    setAge(pet.age || "");
    setGender(pet.gender || "");
    setSize(pet.size || "");
    setColor(pet.color || "");
    setWeight(pet.weight || "");
    setPersonality(pet.personality || "");
    setLivingSituation(pet.livingSituation || "");
    setPetImages([]);
    setVaccineCertificateFile(null); // Reset file input
    setVaccineCertificateUrl(pet.vaccineCertificateUrl || ""); // NEW: Set existing URL
  };

  // MODIFIED: to handle vaccine certificate update and remove mandatory check
  const handleUpdatePet = async () => {
    if (!editingPet) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // Determine total uploads for progress calculation
      const totalUploads = petImages.length + (vaccineCertificateFile ? 1 : 0);
      let uploadedCount = 0;


      let updatedImageUrls = editingPet.imageUrls || [];
      if (petImages.length > 0) {
        updatedImageUrls = [];
        for (let i = 0; i < petImages.length; i++) {
          const file = petImages[i];
          const imageRef = ref(storage, `pets/${uuidv4()}-${file.name}`);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          updatedImageUrls.push(url);
          uploadedCount++;
          // Update progress based on the total number of new files (images + cert)
          setUploadProgress((uploadedCount / totalUploads) * 100);
        }
      }

      let certUrlToSave = vaccineCertificateUrl; // Start with existing URL
      // NEW: Handle new Vaccine Certificate upload (Optional)
      if (vaccineCertificateFile) {
        const certRef = ref(storage, `vaccine_certificates/${uuidv4()}-${vaccineCertificateFile.name}`);
        await uploadBytes(certRef, vaccineCertificateFile);
        certUrlToSave = await getDownloadURL(certRef);
        uploadedCount++;
        // Update final progress if we uploaded a certificate
        setUploadProgress((uploadedCount / totalUploads) * 100);
      }
      
      // REMOVED: Mandatory check for certificate
      // if (!certUrlToSave) {
      //   setLoading(false);
      //   return toast.error("Vaccine certificate is required.");
      // }


      await updateDoc(doc(db, "pets", editingPet.id), {
        name: petName,
        description,
        type,
        breed,
        age,
        gender,
        size,
        color,
        weight,
        personality,
        livingSituation,
        imageUrls: updatedImageUrls,
        vaccineCertificateUrl: certUrlToSave, // Save updated certificate URL (can be empty)
        updatedAt: new Date(),
      });

      toast.success("Pet updated successfully!");
      resetForm();
      setActiveTab("edit");
    } catch (error) {
      toast.error("Error updating pet: " + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index) => {
    setPetImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  // NEW FUNCTION: To handle vaccine certificate file change
  const handleVaccineCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setVaccineCertificateFile(file);
        setVaccineCertificateUrl(""); // Clear URL if a new file is selected
    }
  };
  
  // NEW FUNCTION: To clear the vaccine certificate
  const removeVaccineCertificate = () => {
    setVaccineCertificateFile(null);
    setVaccineCertificateUrl("");
  };


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (desktop static, mobile collapsible) */}
      <motion.aside
        className={`fixed lg:relative w-64 bg-black/90 backdrop-blur-xl text-white p-6 space-y-6 shadow-2xl z-50 h-full lg:h-auto overflow-y-auto transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Mobile-only header inside sidebar */}
        <div className="flex items-center justify-between lg:hidden mb-2">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          <SidebarButton
            icon={Home}
            label="Dashboard"
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            active={activeTab === "dashboard"}
          />
          <SidebarButton
            icon={Heart}
            label="Adoption Requests"
            onClick={() => {
              setActiveTab("applications");
              setSidebarOpen(false);
            }}
            active={activeTab === "applications"}
          />
          <SidebarButton
            icon={Mail}
            label="Messages"
            onClick={() => {
              setActiveTab("messages");
              setSidebarOpen(false);
            }}
            active={activeTab === "messages"}
          />
          {/* <SidebarButton
            icon={Users}
            label="Users"
            onClick={() => setActiveTab("users")}
            active={activeTab === "users"}
          />
          <SidebarButton
            icon={Settings}
            label="Settings"
            onClick={() => setActiveTab("settings")}
            active={activeTab === "settings"}
          /> */}
          <SidebarButton
            icon={FileText}
            label="Shelter Info"
            onClick={() => {
              setActiveTab("shelter-info");
              setSidebarOpen(false);
            }}
            active={activeTab === "shelter-info"}
          />
          <SidebarButton
            icon={LogOut}
            label="Logout"
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            active={false}
            danger
          />
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with hamburger (desktop hidden) */}
        <div className="lg:hidden bg-white/90 backdrop-blur-xl shadow-md p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-[#FF1B1C]" />
            </button>
            <h1 className="text-lg font-bold text-[#FF1B1C]">
              Admin Dashboard
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <h1 className="text-4xl font-black text-[#FF1B1C] mb-8 hidden lg:block">
              Admin Dashboard
            </h1>
            {activeTab === "dashboard" && (
              <>
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
                    icon={FileText}
                    title="View Applications"
                    onClick={() => setActiveTab("applications")}
                  />
                  <Card
                    icon={Grid}
                    title="Manage Categories"
                    onClick={() => toast.info("Coming soon")}
                  />
                  <Card
                    icon={BarChart}
                    title="Generate Reports"
                    onClick={() => toast.info("Coming soon")}
                  />
                </div>
                <div className="h-24" />
              </>
            )}
            {activeTab === "applications" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
                  Adoption Requests
                </h2>
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F11] mx-auto"></div>
                  </div>
                ) : adoptionRequests.length === 0 ? (
                  <div className="text-center text-[#7a7568]">
                    No adoption requests found.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adoptionRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white p-6 rounded-xl shadow border border-[#BEB7A4]/30"
                      >
                        <div className="flex gap-4 items-center mb-4">
                          {req.petImage && (
                            <img
                              src={req.petImage}
                              alt={req.petName}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-[#FF1B1C]">
                              {req.petName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {req.firstName} {req.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{req.email}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <strong>Phone:</strong> {req.phone}
                          </p>
                          <p>
                            <strong>City:</strong> {req.city}
                          </p>
                          <p>
                            <strong>Reason:</strong> {req.reasonForAdoption}
                          </p>
                          <p>
                            <strong>Living:</strong> {req.livingSituation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "add" && renderForm("Add New Pet", handleAddPet)}
            {activeTab === "edit" && !editingPet && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#FF1B1C]">
                  Select Pet to Edit
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F11] mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.map((pet) => (
                      <motion.div
                        key={pet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-[#BEB7A4]/20"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-[#FF1B1C]">
                              {pet.name}
                            </h3>
                            <p className="text-sm text-[#7a7568]">
                              {pet.type} - {pet.breed}
                            </p>
                          </div>
                          <button
                            onClick={() => handleEditClick(pet)}
                            className="bg-[#FF7F11] text-white px-4 py-2 rounded-lg hover:bg-[#FF1B1C] transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                        {pet.imageUrls && pet.imageUrls.length > 0 && (
                          <img
                            src={pet.imageUrls[0]}
                            alt={pet.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <p className="text-sm text-[#7a7568] line-clamp-2">
                          {pet.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "edit" &&
              editingPet &&
              renderForm("Edit Pet", handleUpdatePet)}
            {activeTab === "delete" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#FF1B1C]">
                  Remove Pets
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F11] mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.map((pet) => (
                      <motion.div
                        key={pet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-[#BEB7A4]/20"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-[#FF1B1C]">
                              {pet.name}
                            </h3>
                            <p className="text-sm text-[#7a7568]">
                              {pet.type} - {pet.breed}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeletePet(pet.id, pet.imageUrls, pet.vaccineCertificateUrl) // MODIFIED: pass certUrl
                            }
                            className="bg-[#FF1B1C] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                        {pet.imageUrls && pet.imageUrls.length > 0 && (
                          <img
                            src={pet.imageUrls[0]}
                            alt={pet.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <p className="text-sm text-[#7a7568] line-clamp-2">
                          {pet.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "shelter-info" && (
              <div className="space-y-6">
                <ShelterInfoForm />
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
                  Message Center
                </h2>
                <ConversationsList
                  userId={auth.currentUser?.uid}
                  userType="shelter"
                />
              </div>
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <MyFooter />
      </div>
    </div>
  );

  function renderForm(title, onSubmit) {
    // Determine if we are adding a new pet for required check display
    const isAdd = title.includes("Add");
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-[#FF1B1C] mb-8">{title}</h2>

        {/* Image Upload Section */}
        <div className="mb-8">
          <label className="block text-[#7a7568] font-semibold mb-3">
            Pet Images{" "}
            {editingPet
              ? "(leave empty to keep existing)"
              : "(multiple allowed)"}
          </label>
          <div className="border-2 border-dashed border-[#BEB7A4] rounded-xl p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPetImages(Array.from(e.target.files))}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-[#BEB7A4] mx-auto mb-4" />
              <p className="text-[#7a7568]">Click to upload images</p>
            </label>
          </div>

          {/* Image Preview */}
          {petImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {petImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* NEW: Vaccine Certificate Upload Section (Now Optional) */}
        <div className="mb-8">
          <label className="block text-[#7a7568] font-semibold mb-3">
            Vaccine Certificate (Optional)
          </label>
          
          {vaccineCertificateFile || vaccineCertificateUrl ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Certificate Uploaded: {vaccineCertificateFile ? vaccineCertificateFile.name : "View"}
                </span>
                {(vaccineCertificateUrl && !vaccineCertificateFile) && (
                  <a 
                    href={vaccineCertificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    (Current File)
                  </a>
                )}
              </div>
              <button
                onClick={removeVaccineCertificate}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#BEB7A4] rounded-xl p-6 text-center">
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleVaccineCertificateChange} // NEW handler
                    className="hidden"
                    id="certificate-upload"
                />
                <label htmlFor="certificate-upload" className="cursor-pointer">
                    <Paperclip className="w-12 h-12 text-[#BEB7A4] mx-auto mb-4" />
                    <p className="text-[#7a7568]">Click to upload a PDF or Image certificate</p>
                </label>
            </div>
          )}
        </div>


        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF7F11] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-[#7a7568] mt-2">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FF1B1C] border-b border-[#BEB7A4] pb-2">
              Basic Information
            </h3>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Pet Name *
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g., Simba"
              />
            </div>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Type *
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Breed *
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Labrador"
              />
            </div>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Age
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 2 years old"
              />
            </div>
          </div>

          {/* Physical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FF1B1C] border-b border-[#BEB7A4] pb-2">
              Physical Details
            </h3>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Gender
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Size
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="">Select size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Color
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Golden brown"
              />
            </div>

            <div>
              <label className="block text-[#7a7568] font-semibold mb-2">
                Weight
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 25 lbs"
              />
            </div>
          </div>
        </div>

        {/* Description and Personality */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-[#7a7568] font-semibold mb-2">
              Description *
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this pet's personality, needs, and what makes them special..."
              rows="4"
            />
          </div>

          <div>
            <label className="block text-[#7a7568] font-semibold mb-2">
              Personality *
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g., Friendly, playful, loves children, good with other pets"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-[#7a7568] font-semibold mb-2">
              Living Situation
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
              value={livingSituation}
              onChange={(e) => setLivingSituation(e.target.value)}
            >
              <option value="">Select living situation</option>
              <option value="Own home">Own home</option>
              <option value="Rent house">Rent house</option>
              <option value="Rent apartment">Rent apartment</option>
              <option value="Condo">Condo</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {editingPet ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                {editingPet ? "Update Pet" : "Add Pet"}
              </>
            )}
          </motion.button>

          {editingPet && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="px-8 py-4 bg-gray-300 text-black rounded-xl font-bold text-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }
}

function Card({ icon, title, onClick }) {
  const Icon = icon;
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-[#BEB7A4]/20"
    >
      <div className="p-4 rounded-full bg-gradient-to-br from-[#FF7F11]/10 to-[#FF1B1C]/10 mb-4 group-hover:from-[#FF7F11]/20 group-hover:to-[#FF1B1C]/20 transition-all duration-300">
        <Icon
          size={32}
          className="text-[#FF7F11] group-hover:text-[#FF1B1C] transition-colors"
        />
      </div>
      <h2 className="text-lg font-semibold text-[#FF1B1C] text-center">
        {title}
      </h2>
    </motion.div>
  );
}

function SidebarButton({ icon, label, onClick, active, danger }) {
  const Icon = icon;
  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
        active
          ? "bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white shadow-lg"
          : danger
          ? "hover:bg-red-500/20 text-red-400"
          : "hover:bg-white/10 text-white"
      }`}
    >
      <Icon size={20} className="transition-colors" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}