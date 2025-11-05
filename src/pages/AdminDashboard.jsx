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
  Eye,
  User,
  Phone,
  MapPin,
  Home as HomeIcon,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
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
import {
  sendAdoptionAcceptedEmail,
  sendAdoptionRejectedEmail,
} from "../utils/emailService";
import { signOut } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import ShelterInfoForm from "./ShelterInfoForm";
import MyFooter from "../components/Footer";
import { toast } from "react-toastify";
import ConversationsList from "../components/ConversationsList";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [petImages, setPetImages] = useState([]); // NEW STATE: For vaccine certificate file
  const [vaccineCertificateFile, setVaccineCertificateFile] = useState(null); // NEW STATE: To hold the existing vaccine certificate URL for editing
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // DESKTOP: collapsed sidebar
  const [selectedRequest, setSelectedRequest] = useState(null); // For modal view

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
                status: form.status || "pending", // Ensure status is set
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
    setVaccineCertificateUrl(""); // RESET: new state
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
      } // NEW: Upload Vaccine Certificate (Optional)
      let certUrl = "";
      if (vaccineCertificateFile) {
        const certRef = ref(
          storage,
          `vaccine_certificates/${uuidv4()}-${vaccineCertificateFile.name}`
        );
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
  }; // MODIFIED: to also delete vaccine certificate

  const handleDeletePet = async (petId, imageUrls, certUrl) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "pets", petId)); // Delete all images
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
      } // NEW: Delete Vaccine Certificate

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
  }; // MODIFIED: to load existing vaccine certificate URL

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
  }; // MODIFIED: to handle vaccine certificate update and remove mandatory check

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
          uploadedCount++; // Update progress based on the total number of new files (images + cert)
          setUploadProgress((uploadedCount / totalUploads) * 100);
        }
      }

      let certUrlToSave = vaccineCertificateUrl; // Start with existing URL // NEW: Handle new Vaccine Certificate upload (Optional)
      if (vaccineCertificateFile) {
        const certRef = ref(
          storage,
          `vaccine_certificates/${uuidv4()}-${vaccineCertificateFile.name}`
        );
        await uploadBytes(certRef, vaccineCertificateFile);
        certUrlToSave = await getDownloadURL(certRef);
        uploadedCount++; // Update final progress if we uploaded a certificate
        setUploadProgress((uploadedCount / totalUploads) * 100);
      } // REMOVED: Mandatory check for certificate // if (!certUrlToSave) { //   setLoading(false); //   return toast.error("Vaccine certificate is required."); // }
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
  }; // NEW FUNCTION: To handle vaccine certificate file change
  const handleVaccineCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVaccineCertificateFile(file);
      setVaccineCertificateUrl(""); // Clear URL if a new file is selected
    }
  }; // NEW FUNCTION: To clear the vaccine certificate
  const removeVaccineCertificate = () => {
    setVaccineCertificateFile(null);
    setVaccineCertificateUrl("");
  };

  // Handle adoption request acceptance
  const handleAcceptAdoption = async (request) => {
    try {
      // Update status in Firestore
      const adoptionRef = doc(db, "adoptionForms", request.id);
      await updateDoc(adoptionRef, {
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser?.uid,
      });

      // Fetch shelter information
      let shelterInfo = {};
      try {
        const shelterDoc = await getDoc(
          doc(db, "shelters", auth.currentUser.uid)
        );
        if (shelterDoc.exists()) {
          shelterInfo = shelterDoc.data();
        }
      } catch (error) {
        console.error("Error fetching shelter info:", error);
      }

      // Send email notification
      const emailResult = await sendAdoptionAcceptedEmail(
        request.email,
        `${request.firstName} ${request.lastName}`,
        request.petName,
        shelterInfo
      );

      if (emailResult.success) {
        toast.success("Application accepted and email sent successfully!");
      } else {
        toast.success("Application accepted, but email failed to send.");
        console.error("Email error:", emailResult.error);
      }

      // Update local state
      setAdoptionRequests((prev) =>
        prev.map((req) =>
          req.id === request.id ? { ...req, status: "approved" } : req
        )
      );
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error accepting adoption:", error);
      toast.error("Failed to accept application: " + error.message);
    }
  };

  // Handle adoption request rejection
  const handleRejectAdoption = async (request) => {
    try {
      // Update status in Firestore
      const adoptionRef = doc(db, "adoptionForms", request.id);
      await updateDoc(adoptionRef, {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser?.uid,
      });

      // Fetch shelter information
      let shelterInfo = {};
      try {
        const shelterDoc = await getDoc(
          doc(db, "shelters", auth.currentUser.uid)
        );
        if (shelterDoc.exists()) {
          shelterInfo = shelterDoc.data();
        }
      } catch (error) {
        console.error("Error fetching shelter info:", error);
      }

      // Send email notification
      const emailResult = await sendAdoptionRejectedEmail(
        request.email,
        `${request.firstName} ${request.lastName}`,
        request.petName,
        shelterInfo
      );

      if (emailResult.success) {
        toast.success("Application rejected and email sent successfully!");
      } else {
        toast.success("Application rejected, but email failed to send.");
        console.error("Email error:", emailResult.error);
      }

      // Update local state
      setAdoptionRequests((prev) =>
        prev.map((req) =>
          req.id === request.id ? { ...req, status: "rejected" } : req
        )
      );
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting adoption:", error);
      toast.error("Failed to reject application: " + error.message);
    }
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
        className={`fixed lg:sticky lg:top-0 bg-black/90 backdrop-blur-xl text-white shadow-2xl z-50 h-screen overflow-y-auto transform transition-all duration-300 flex-shrink-0 flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        w-64`}
      >
        <div
          className={`p-6 ${sidebarCollapsed ? "lg:px-3" : ""} flex-shrink-0`}
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

          {/* Desktop Toggle Button */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            {!sidebarCollapsed && <h2 className="text-lg font-bold">Menu</h2>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-white/10 ml-auto transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </div>
        </div>

        <nav
          className={`flex flex-col space-y-2 px-6 ${
            sidebarCollapsed ? "lg:px-3" : ""
          } flex-1 pb-6`}
        >
          <SidebarButton
            icon={Home}
            label="Dashboard"
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            active={activeTab === "dashboard"}
            collapsed={sidebarCollapsed}
          />
          <SidebarButton
            icon={Heart}
            label="Adoption Requests"
            onClick={() => {
              setActiveTab("applications");
              setSidebarOpen(false);
            }}
            active={activeTab === "applications"}
            collapsed={sidebarCollapsed}
          />
          <SidebarButton
            icon={Mail}
            label="Messages"
            onClick={() => {
              setActiveTab("messages");
              setSidebarOpen(false);
            }}
            active={activeTab === "messages"}
            collapsed={sidebarCollapsed}
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
            collapsed={sidebarCollapsed}
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
            collapsed={sidebarCollapsed}
          />
        </nav>
      </motion.aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto w-full"
          >
            <h1 className="text-4xl font-black text-[#FF1B1C] mb-8 hidden lg:block">
              Admin Dashboard
            </h1>
                       {" "}
            {activeTab === "dashboard" && (
              <>
                               {" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {" "}
                  <Card
                    icon={PlusCircle}
                    title="Add a New Pet"
                    onClick={() => setActiveTab("add")}
                  />
                                   {" "}
                  <Card
                    icon={Edit}
                    title="Edit Pet"
                    onClick={() => setActiveTab("edit")}
                  />
                                   {" "}
                  <Card
                    icon={Trash2}
                    title="Remove Pet"
                    onClick={() => setActiveTab("delete")}
                  />
                                   {" "}
                  <Card
                    icon={FileText}
                    title="View Applications"
                    onClick={() => setActiveTab("applications")}
                  />
                                   {" "}
                  <Card
                    icon={Grid}
                    title="Manage Categories"
                    onClick={() => toast.info("Coming soon")}
                  />
                                   {" "}
                  <Card
                    icon={BarChart}
                    title="Generate Reports"
                    onClick={() => toast.info("Coming soon")}
                  />
                                 {" "}
                </div>
                                <div className="h-24" />             {" "}
              </>
            )}
                       {" "}
            {activeTab === "applications" && (
              <div className="space-y-6">
                               {" "}
                <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
                                    Adoption Requests                {" "}
                </h2>
                               {" "}
                {loadingRequests ? (
                  <div className="text-center py-8">
                                       {" "}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F11] mx-auto"></div>
                                     {" "}
                  </div>
                ) : adoptionRequests.length === 0 ? (
                  <div className="text-center text-[#7a7568]">
                                        No adoption requests found.            
                         {" "}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                       {" "}
                    {adoptionRequests.map((req) => (
                      <motion.div
                        key={req.id}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white rounded-2xl shadow-lg border border-[#BEB7A4]/30 overflow-hidden transition-all duration-300 hover:shadow-2xl"
                      >
                                                {/* Pet Image Header */}
                        {req.petImage && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={req.petImage}
                              alt={req.petName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-xl font-black text-white mb-1">
                                {req.petName}
                              </h3>
                              <div className="flex items-center gap-2 text-white/90 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    req.status === "approved"
                                      ? "bg-green-500/90"
                                      : req.status === "rejected"
                                      ? "bg-red-500/90"
                                      : "bg-[#FF7F11]/80"
                                  }`}
                                >
                                  {req.status === "approved"
                                    ? "Approved"
                                    : req.status === "rejected"
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-6">
                          {/* Applicant Info */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7F11]/20 to-[#FF1B1C]/20 flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-[#FF7F11]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#FF1B1C] text-lg truncate">
                                {req.firstName} {req.lastName}
                              </h4>
                              <p className="text-sm text-[#7a7568] truncate">
                                {req.email}
                              </p>
                            </div>
                          </div>

                          {/* Quick Info */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-[#7a7568]">
                              <Phone className="w-4 h-4 text-[#FF7F11]" />
                              <span className="truncate">{req.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#7a7568]">
                              <MapPin className="w-4 h-4 text-[#FF7F11]" />
                              <span className="truncate">
                                {req.city}, {req.state}
                              </span>
                            </div>
                          </div>

                          {/* Reason Preview */}
                          <div className="mb-4 p-3 bg-gradient-to-br from-[#FFFFFC] to-[#f8f7f4] rounded-lg border border-[#BEB7A4]/20">
                            <p className="text-xs font-semibold text-[#7a7568] mb-1">
                              Reason for Adoption
                            </p>
                            <p className="text-sm text-[#7a7568] line-clamp-2">
                              {req.reasonForAdoption}
                            </p>
                          </div>

                          {/* Review Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedRequest(req)}
                            className="w-full bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                          >
                            <Eye className="w-5 h-5" />
                            Review Application
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                                     {" "}
                  </div>
                )}
                             {" "}
              </div>
            )}
            {/* Adoption Request Detail Modal */}
            <AnimatePresence>
              {selectedRequest && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={() => setSelectedRequest(null)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      {/* Modal Header */}
                      <div className="sticky top-0 bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                          {selectedRequest.petImage && (
                            <img
                              src={selectedRequest.petImage}
                              alt={selectedRequest.petName}
                              className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                            />
                          )}
                          <div>
                            <h2 className="text-2xl font-black">
                              Adoption Application Review
                            </h2>
                            <p className="text-white/90 text-sm">
                              {selectedRequest.petName}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div className="p-8 space-y-8">
                        {/* Applicant Information Section */}
                        <div className="bg-gradient-to-br from-[#FFFFFC] to-[#f8f7f4] rounded-2xl p-6 border border-[#BEB7A4]/20">
                          <h3 className="text-xl font-bold text-[#FF1B1C] mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Applicant Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Full Name
                              </p>
                              <p className="text-[#FF1B1C] font-semibold">
                                {selectedRequest.firstName}{" "}
                                {selectedRequest.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Email
                              </p>
                              <p className="text-[#7a7568]">
                                {selectedRequest.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Phone
                              </p>
                              <p className="text-[#7a7568] flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#FF7F11]" />
                                {selectedRequest.phone}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Address
                              </p>
                              <p className="text-[#7a7568] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#FF7F11]" />
                                {selectedRequest.address},{" "}
                                {selectedRequest.city}, {selectedRequest.state}{" "}
                                {selectedRequest.zipCode}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Household Information Section */}
                        <div className="bg-gradient-to-br from-[#FFFFFC] to-[#f8f7f4] rounded-2xl p-6 border border-[#BEB7A4]/20">
                          <h3 className="text-xl font-bold text-[#FF1B1C] mb-4 flex items-center gap-2">
                            <HomeIcon className="w-5 h-5" />
                            Household Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Household Size
                              </p>
                              <p className="text-[#7a7568]">
                                {selectedRequest.householdSize}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Has Children
                              </p>
                              <p className="text-[#7a7568]">
                                {selectedRequest.hasChildren}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Has Other Pets
                              </p>
                              <p className="text-[#7a7568]">
                                {selectedRequest.hasOtherPets}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Living Situation
                              </p>
                              <p className="text-[#7a7568]">
                                {selectedRequest.livingSituation}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7a7568] mb-1">
                                Time at Home
                              </p>
                              <p className="text-[#7a7568] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#FF7F11]" />
                                {selectedRequest.timeAtHome}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Pet Experience Section */}
                        <div className="bg-gradient-to-br from-[#FFFFFC] to-[#f8f7f4] rounded-2xl p-6 border border-[#BEB7A4]/20">
                          <h3 className="text-xl font-bold text-[#FF1B1C] mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Pet Experience
                          </h3>
                          <div>
                            <p className="text-sm font-semibold text-[#7a7568] mb-2">
                              Experience Description
                            </p>
                            <p className="text-[#7a7568]">
                              {selectedRequest.petExperience}
                            </p>
                          </div>
                        </div>

                        {/* Adoption Details Section */}
                        <div className="bg-gradient-to-br from-[#FFFFFC] to-[#f8f7f4] rounded-2xl p-6 border border-[#BEB7A4]/20">
                          <h3 className="text-xl font-bold text-[#FF1B1C] mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Adoption Details
                          </h3>
                          <div>
                            <p className="text-sm font-semibold text-[#7a7568] mb-2">
                              Reason for Adoption
                            </p>
                            <p className="text-[#7a7568] mb-4">
                              {selectedRequest.reasonForAdoption}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t border-[#BEB7A4]/30">
                          {selectedRequest.status !== "approved" &&
                            selectedRequest.status !== "rejected" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleAcceptAdoption(selectedRequest)
                                  }
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  Accept Application
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleRejectAdoption(selectedRequest)
                                  }
                                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-5 h-5" />
                                  Reject Application
                                </motion.button>
                              </>
                            )}
                          {(selectedRequest.status === "approved" ||
                            selectedRequest.status === "rejected") && (
                            <div className="w-full text-center py-4">
                              <p className="text-lg font-semibold text-[#7a7568]">
                                Status:{" "}
                                {selectedRequest.status === "approved"
                                  ? "Approved"
                                  : "Rejected"}
                              </p>
                              <p className="text-sm text-[#7a7568] mt-2">
                                This application has already been reviewed.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
                       {" "}
            {activeTab === "add" && renderForm("Add New Pet", handleAddPet)}   
                   {" "}
            {activeTab === "edit" && !editingPet && (
              <div className="space-y-6">
                               {" "}
                <h2 className="text-2xl font-bold text-[#FF1B1C]">
                                    Select Pet to Edit                {" "}
                </h2>
                               {" "}
                {loading ? (
                  <div className="text-center py-8">
                                       {" "}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F11] mx-auto"></div>
                                     {" "}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                       {" "}
                    {pets.map((pet) => (
                      <motion.div
                        key={pet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-[#BEB7A4]/20"
                      >
                                               {" "}
                        <div className="flex justify-between items-start mb-4">
                                                   {" "}
                          <div>
                                                       {" "}
                            <h3 className="font-bold text-lg text-[#FF1B1C]">
                                                            {pet.name}         
                                               {" "}
                            </h3>
                                                       {" "}
                            <p className="text-sm text-[#7a7568]">
                                                            {pet.type} -{" "}
                              {pet.breed}                           {" "}
                            </p>
                                                     {" "}
                          </div>
                                                   {" "}
                          <button
                            onClick={() => handleEditClick(pet)}
                            className="bg-[#FF7F11] text-white px-4 py-2 rounded-lg hover:bg-[#FF1B1C] transition-colors"
                          >
                                                        Edit                    
                                 {" "}
                          </button>
                                                 {" "}
                        </div>
                                               {" "}
                        {pet.imageUrls && pet.imageUrls.length > 0 && (
                          <img
                            src={pet.imageUrls[0]}
                            alt={pet.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                                               {" "}
                        <p className="text-sm text-[#7a7568] line-clamp-2">
                                                    {pet.description}           
                                     {" "}
                        </p>
                                             {" "}
                      </motion.div>
                    ))}
                                     {" "}
                  </div>
                )}
                             {" "}
              </div>
            )}
                       {" "}
            {activeTab === "edit" &&
              editingPet &&
              renderForm("Edit Pet", handleUpdatePet)}
                       {" "}
            {activeTab === "delete" && (
              <div className="space-y-6">
                               {" "}
                <h2 className="text-2xl font-bold text-[#FF1B1C]">
                                    Remove Pets                {" "}
                </h2>
                               {" "}
                {loading ? (
                  <div className="text-center py-8">
                                       {" "}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F11] mx-auto"></div>
                                     {" "}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                       {" "}
                    {pets.map((pet) => (
                      <motion.div
                        key={pet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-[#BEB7A4]/20"
                      >
                                               {" "}
                        <div className="flex justify-between items-start mb-4">
                                                   {" "}
                          <div>
                                                       {" "}
                            <h3 className="font-bold text-lg text-[#FF1B1C]">
                                                            {pet.name}         
                                               {" "}
                            </h3>
                                                       {" "}
                            <p className="text-sm text-[#7a7568]">
                                                            {pet.type} -{" "}
                              {pet.breed}                           {" "}
                            </p>
                                                     {" "}
                          </div>
                                                   {" "}
                          <button
                            onClick={
                              () =>
                                handleDeletePet(
                                  pet.id,
                                  pet.imageUrls,
                                  pet.vaccineCertificateUrl
                                ) // MODIFIED: pass certUrl
                            }
                            className="bg-[#FF1B1C] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                                                        Delete                  
                                   {" "}
                          </button>
                                                 {" "}
                        </div>
                                               {" "}
                        {pet.imageUrls && pet.imageUrls.length > 0 && (
                          <img
                            src={pet.imageUrls[0]}
                            alt={pet.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                                               {" "}
                        <p className="text-sm text-[#7a7568] line-clamp-2">
                                                    {pet.description}           
                                     {" "}
                        </p>
                                             {" "}
                      </motion.div>
                    ))}
                                     {" "}
                  </div>
                )}
                             {" "}
              </div>
            )}
                       {" "}
            {activeTab === "shelter-info" && (
              <div className="space-y-6">
                                <ShelterInfoForm />             {" "}
              </div>
            )}
                       {" "}
            {activeTab === "messages" && (
              <div className="space-y-6">
                               {" "}
                <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
                                    Message Center                {" "}
                </h2>
                               {" "}
                <ConversationsList
                  userId={auth.currentUser?.uid}
                  userType="shelter"
                />
                             {" "}
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
               {" "}
        <h2 className="text-3xl font-bold text-[#FF1B1C] mb-8">{title}</h2>     
          {/* Image Upload Section */}       {" "}
        <div className="mb-8">
                   {" "}
          <label className="block text-[#7a7568] font-semibold mb-3">
                        Pet Images            {" "}
            {editingPet
              ? "(leave empty to keep existing)"
              : "(multiple allowed)"}
                     {" "}
          </label>
                   {" "}
          <div className="border-2 border-dashed border-[#BEB7A4] rounded-xl p-6 text-center">
                       {" "}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPetImages(Array.from(e.target.files))}
              className="hidden"
              id="image-upload"
            />
                       {" "}
            <label htmlFor="image-upload" className="cursor-pointer">
                           {" "}
              <Upload className="w-12 h-12 text-[#BEB7A4] mx-auto mb-4" />     
                      <p className="text-[#7a7568]">Click to upload images</p> 
                       {" "}
            </label>
                     {" "}
          </div>
                    {/* Image Preview */}         {" "}
          {petImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                           {" "}
              {petImages.map((file, index) => (
                <div key={index} className="relative">
                                   {" "}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                                   {" "}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                                        <X size={16} />                 {" "}
                  </button>
                                 {" "}
                </div>
              ))}
                         {" "}
            </div>
          )}
                 {" "}
        </div>
                       {" "}
        {/* NEW: Vaccine Certificate Upload Section (Now Optional) */}       {" "}
        <div className="mb-8">
                   {" "}
          <label className="block text-[#7a7568] font-semibold mb-3">
                        Vaccine Certificate (Optional)          {" "}
          </label>
                             {" "}
          {vaccineCertificateFile || vaccineCertificateUrl ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                           {" "}
              <div className="flex items-center gap-3">
                               {" "}
                <CheckCircle size={20} className="text-green-600" />           
                   {" "}
                <span className="text-sm font-medium text-green-800">
                                    Certificate Uploaded:{" "}
                  {vaccineCertificateFile
                    ? vaccineCertificateFile.name
                    : "View"}
                                 {" "}
                </span>
                               {" "}
                {vaccineCertificateUrl && !vaccineCertificateFile && (
                  <a
                    href={vaccineCertificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                                        (Current File)                  {" "}
                  </a>
                )}
                             {" "}
              </div>
                           {" "}
              <button
                onClick={removeVaccineCertificate}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
              >
                                <X size={16} />             {" "}
              </button>
                         {" "}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#BEB7A4] rounded-xl p-6 text-center">
                             {" "}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleVaccineCertificateChange} // NEW handler
                className="hidden"
                id="certificate-upload"
              />
                             {" "}
              <label htmlFor="certificate-upload" className="cursor-pointer">
                                   {" "}
                <Paperclip className="w-12 h-12 text-[#BEB7A4] mx-auto mb-4" /> 
                                 {" "}
                <p className="text-[#7a7568]">
                  Click to upload a PDF or Image certificate
                </p>
                               {" "}
              </label>
                         {" "}
            </div>
          )}
                 {" "}
        </div>
                {/* Upload Progress */}       {" "}
        {uploadProgress > 0 && (
          <div className="mb-6">
                       {" "}
            <div className="bg-gray-200 rounded-full h-2">
                           {" "}
              <div
                className="bg-[#FF7F11] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
                         {" "}
            </div>
                       {" "}
            <p className="text-sm text-[#7a7568] mt-2">
                            Uploading... {Math.round(uploadProgress)}%          
               {" "}
            </p>
                     {" "}
          </div>
        )}
               {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}         {" "}
          <div className="space-y-4">
                       {" "}
            <h3 className="text-lg font-semibold text-[#FF1B1C] border-b border-[#BEB7A4] pb-2">
                            Basic Information            {" "}
            </h3>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Pet Name *              {" "}
              </label>
                           {" "}
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g., Simba"
              />
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Type *              {" "}
              </label>
                           {" "}
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                                <option value="Cat">Cat</option>               {" "}
                <option value="Dog">Dog</option>               {" "}
                <option value="Bird">Bird</option>               {" "}
                <option value="Rabbit">Rabbit</option>               {" "}
                <option value="Other">Other</option>             {" "}
              </select>
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Breed *              {" "}
              </label>
                           {" "}
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Labrador"
              />
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Age              {" "}
              </label>
                           {" "}
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 2 years old"
              />
                         {" "}
            </div>
                     {" "}
          </div>
                    {/* Physical Details */}         {" "}
          <div className="space-y-4">
                       {" "}
            <h3 className="text-lg font-semibold text-[#FF1B1C] border-b border-[#BEB7A4] pb-2">
                            Physical Details            {" "}
            </h3>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Gender              {" "}
              </label>
                           {" "}
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                                <option value="">Select gender</option>         
                      <option value="Male">Male</option>               {" "}
                <option value="Female">Female</option>             {" "}
              </select>
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Size              {" "}
              </label>
                           {" "}
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                                <option value="">Select size</option>           
                    <option value="Small">Small</option>               {" "}
                <option value="Medium">Medium</option>               {" "}
                <option value="Large">Large</option>             {" "}
              </select>
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Color              {" "}
              </label>
                           {" "}
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Golden brown"
              />
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-[#7a7568] font-semibold mb-2">
                                Weight              {" "}
              </label>
                           {" "}
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 25 lbs"
              />
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
                {/* Description and Personality */}       {" "}
        <div className="mt-6 space-y-4">
                   {" "}
          <div>
                       {" "}
            <label className="block text-[#7a7568] font-semibold mb-2">
                            Description *            {" "}
            </label>
                       {" "}
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this pet's personality, needs, and what makes them special..."
              rows="4"
            />
                     {" "}
          </div>
                   {" "}
          <div>
                       {" "}
            <label className="block text-[#7a7568] font-semibold mb-2">
                            Personality *            {" "}
            </label>
                       {" "}
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g., Friendly, playful, loves children, good with other pets"
              rows="3"
            />
                     {" "}
          </div>
                   {" "}
          <div>
                       {" "}
            <label className="block text-[#7a7568] font-semibold mb-2">
                            Living Situation            {" "}
            </label>
                       {" "}
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-[#BEB7A4] focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 text-black"
              value={livingSituation}
              onChange={(e) => setLivingSituation(e.target.value)}
            >
                            <option value="">Select living situation</option>   
                        <option value="Own home">Own home</option>             {" "}
              <option value="Rent house">Rent house</option>             {" "}
              <option value="Rent apartment">Rent apartment</option>           
                <option value="Condo">Condo</option>             {" "}
              <option value="Other">Other</option>           {" "}
            </select>
                     {" "}
          </div>
                 {" "}
        </div>
                {/* Action Buttons */}       {" "}
        <div className="mt-8 flex gap-4">
                   {" "}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
                       {" "}
            {loading ? (
              <>
                               {" "}
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                {editingPet ? "Updating..." : "Adding..."}     
                       {" "}
              </>
            ) : (
              <>
                                <CheckCircle size={20} />               {" "}
                {editingPet ? "Update Pet" : "Add Pet"}             {" "}
              </>
            )}
                     {" "}
          </motion.button>
                   {" "}
          {editingPet && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="px-8 py-4 bg-gray-300 text-black rounded-xl font-bold text-lg hover:bg-gray-400 transition-colors"
            >
                            Cancel            {" "}
            </motion.button>
          )}
                 {" "}
        </div>
             {" "}
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
           {" "}
      <div className="p-4 rounded-full bg-gradient-to-br from-[#FF7F11]/10 to-[#FF1B1C]/10 mb-4 group-hover:from-[#FF7F11]/20 group-hover:to-[#FF1B1C]/20 transition-all duration-300">
               {" "}
        <Icon
          size={32}
          className="text-[#FF7F11] group-hover:text-[#FF1B1C] transition-colors"
        />
             {" "}
      </div>
           {" "}
      <h2 className="text-lg font-semibold text-[#FF1B1C] text-center">
                {title}     {" "}
      </h2>
         {" "}
    </motion.div>
  );
}

function SidebarButton({ icon, label, onClick, active, danger, collapsed }) {
  const Icon = icon;
  return (
    <motion.button
      whileHover={collapsed ? { scale: 1.1 } : { x: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center ${
        collapsed ? "lg:justify-center" : "space-x-3"
      } px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer relative ${
        active
          ? "bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] text-white shadow-lg"
          : danger
          ? "hover:bg-red-500/20 text-red-400"
          : "hover:bg-white/10 text-white"
      }`}
      title={collapsed ? label : ""}
    >
      <Icon size={20} className="transition-colors flex-shrink-0" />
      <span
        className={`font-medium transition-all duration-300 ${
          collapsed
            ? "lg:opacity-0 lg:absolute lg:left-full lg:ml-2 lg:whitespace-nowrap lg:bg-black/90 lg:px-3 lg:py-2 lg:rounded-lg lg:pointer-events-none lg:z-50 lg:shadow-lg lg:invisible lg:group-hover:visible lg:delay-75"
            : ""
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}
