import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Edit, Trash, LogOut, Users } from "lucide-react";
import MyFooter from "../components/Footer";
import { storage, db, auth } from "../firebaseConfig"; // Ensure 'auth' is imported
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { signOut } from "firebase/auth"; // Import signOut for proper logout

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("add-pet"); // Main sidebar tab
  const [innerFormTab, setInnerFormTab] = useState("info"); // <--- ADD THIS LINE! This is the missing state.

  const [petImage, setPetImage] = useState(null);
  const [petName, setPetName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Cat");
  const [breed, setBreed] = useState("");
  const [personality, setPersonality] = useState("");
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const navigate = useNavigate();

  // Effect to fetch pets when the component mounts or when relevant tabs are selected
  useEffect(() => {
    // Only fetch pets if the current tab requires showing the list
    if (selectedTab === "edit-pet" || selectedTab === "remove-pet") {
      const fetchPets = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "pets"));
          const petsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPets(petsData);
        } catch (error) {
          console.error("Error fetching pets:", error);
          alert("Failed to load pets: " + error.message);
        }
      };
      fetchPets();
    }
  }, [selectedTab]); // Dependency array: re-run when selectedTab changes

  const resetForm = () => {
    setPetImage(null);
    setPetName("");
    setDescription("");
    setType("Cat");
    setBreed("");
    setPersonality("");
    setEditingPet(null); // Clear editing state
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Use Firebase signOut
      navigate("/login"); // Redirect to login page after successful logout
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out.");
    }
  };

  const handleAddPet = async () => {
    try {
      if (!petImage || !petName || !description || !breed || !personality) { // Added personality check
        alert("Please fill all pet information fields and upload a photo.");
        return;
      }

      // Generate a unique ID for the pet and its image
      const petId = uuidv4();
      const imageRef = ref(storage, `pets/${petId}-${petImage.name}`); // Unique path for the image
      
      console.log("Attempting to upload image to:", imageRef.fullPath);
      console.log("File object:", petImage); // Add this
      console.log("File name:", petImage?.name); // Add this
      console.log("File type:", petImage?.type); // Add this
      console.log("File size:", petImage?.size); // Add this
      await uploadBytes(imageRef, petImage); // Upload image to Firebase Storage
      const imageUrl = await getDownloadURL(imageRef); // Get the public URL of the uploaded image
      console.log("Image uploaded successfully. URL:", imageUrl);

      // Add pet data to Firestore
      await addDoc(collection(db, "pets"), {
        name: petName,
        description,
        type,
        breed,
        personality,
        imageUrl,
        createdAt: new Date(), // Timestamp for when the pet was added
        // Optional: Link pet to the current shelter/admin's UID
        shelterId: auth.currentUser ? auth.currentUser.uid : null,
      });

      alert("Pet added successfully!");
      resetForm(); // Clear the form fields
      setSelectedTab("add-pet"); // Keep the user on the add pet form
    } catch (error) {
      console.error("Error adding pet:", error);
      alert("Error adding pet: " + error.message); // Display specific error message
    }
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet); // Set the pet object to be edited
    setPetName(pet.name);
    setDescription(pet.description);
    setType(pet.type);
    setBreed(pet.breed);
    setPersonality(pet.personality);
    setPetImage(null); // Clear selected image; user can choose to upload new one
    setSelectedTab("edit-pet-form"); // Switch to the dedicated edit form view
  };

  const handleUpdatePet = async () => {
    if (!editingPet || !petName || !description || !breed || !personality) {
      alert("Please fill all fields for the pet.");
      return;
    }

    try {
      let imageUrlToSave = editingPet.imageUrl; // Start with the existing image URL

      // If a new image file is selected, upload it
      if (petImage) {
        // Optional: Delete the old image from storage to save space.
        // Be careful with this, especially if other documents might reference the same image.
        // const oldImageStoragePath = new URL(editingPet.imageUrl).pathname.split('/o/')[1];
        // const oldImageRef = ref(storage, decodeURIComponent(oldImageStoragePath));
        // await deleteObject(oldImageRef).catch(e => console.warn("Could not delete old image:", e));

        const newImageRef = ref(storage, `pets/${editingPet.id}-${petImage.name}`);
        await uploadBytes(newImageRef, petImage);
        imageUrlToSave = await getDownloadURL(newImageRef); // Get URL of the new image
      }

      // Update the Firestore document
      const petDocRef = doc(db, "pets", editingPet.id);
      await updateDoc(petDocRef, {
        name: petName,
        description,
        type,
        breed,
        personality,
        imageUrl: imageUrlToSave, // Use the new URL or the original one
      });

      alert("Pet updated successfully!");
      resetForm(); // Clear form and editing state
      setSelectedTab("edit-pet"); // Go back to the list of pets to edit
    } catch (error) {
      console.error("Error updating pet:", error);
      alert("Error updating pet: " + error.message);
    }
  };

  const handleDeletePet = async (petId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this pet? This action cannot be undone.")) {
      return; // User cancelled
    }

    try {
      // 1. Delete pet document from Firestore
      await deleteDoc(doc(db, "pets", petId));
      console.log("Pet document deleted from Firestore:", petId);

      // 2. Delete image from Firebase Storage (if imageUrl exists)
      if (imageUrl) {
        // Extract the path from the full download URL
        // Example URL: https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET.appspot.com/o/pets%2Fimage-name.jpg?alt=media...
        // We need: pets/image-name.jpg
        const imagePath = new URL(imageUrl).pathname.split('/o/')[1]; // Get path after /o/
        const decodedImagePath = decodeURIComponent(imagePath); // Decode URI components like %2F to /
        
        const imageRef = ref(storage, decodedImagePath);
        await deleteObject(imageRef);
        console.log("Pet image deleted from Storage:", decodedImagePath);
      }

      alert("Pet deleted successfully!");
      // Update local state to remove the deleted pet immediately from the list
      setPets(pets.filter(pet => pet.id !== petId));
    } catch (error) {
      console.error("Error deleting pet:", error);
      alert("Error deleting pet: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFC] flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-20 md:w-56 bg-black text-white flex flex-col items-center py-6 shadow-xl">
          <div className="mb-10 text-center text-[#FF7F11] text-xl md:text-2xl font-bold">
            PAWTHWAY
          </div>
          <nav className="flex flex-col space-y-6 w-full items-center">
            {/* Sidebar Buttons */}
            <button
              onClick={() => { setSelectedTab("add-pet"); resetForm(); }} // Reset form when switching to add
              title="Add New Pet"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 w-full justify-center md:justify-start cursor-pointer"
            >
              <UploadCloud
                size={28}
                stroke={selectedTab === "add-pet" ? "#FF7F11" : "#FFFFFF"}
              />
              <span className="hidden md:block text-sm">Add Pet</span>
            </button>
            <button
              onClick={() => setSelectedTab("edit-pet")}
              title="Edit Existing Pets"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 w-full justify-center md:justify-start cursor-pointer"
            >
              <Edit
                size={28}
                stroke={selectedTab === "edit-pet" || selectedTab === "edit-pet-form" ? "#FF7F11" : "#FFFFFF"}
              />
              <span className="hidden md:block text-sm">Edit Pets</span>
            </button>
            <button
              onClick={() => setSelectedTab("remove-pet")}
              title="Remove Pets"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 w-full justify-center md:justify-start cursor-pointer"
            >
              <Trash
                size={28}
                stroke={selectedTab === "remove-pet" ? "#FF7F11" : "#FFFFFF"}
              />
              <span className="hidden md:block text-sm">Remove Pets</span>
            </button>
            <button
              onClick={() => navigate("/shelter-info")} // Corrected path based on App.jsx
              title="Shelter Information"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 w-full justify-center md:justify-start cursor-pointer"
            >
              <Users size={28} stroke="#FFFFFF" />
              <span className="hidden md:block text-sm">Shelter Info</span>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 w-full justify-center md:justify-start cursor-pointer"
            >
              <LogOut size={28} stroke="#FF1B1C" />
              <span className="hidden md:block text-sm">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 md:p-30">
          {/* Add Pet Form / Edit Pet Form */}
          {(selectedTab === "add-pet" || selectedTab === "edit-pet-form") && (
            <>
              <h1 className="text-3xl font-bold text-[#FF7F11] mb-6">
                {selectedTab === "add-pet" ? "Add A New Pet" : "Edit Pet Information"}
              </h1>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Internal Form Tabs (Photos, Info, Personality) */}
                <div className="w-full md:w-1/4 space-y-4">
                  {[
                    { label: "Photos", key: "photos" },
                    { label: "Info", key: "info" },
                    { label: "Personality", key: "personality" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      // Note: These internal tabs switch between sections of the SAME form.
                      // They don't change the main selectedTab for the sidebar.
                      onClick={() => setInnerFormTab(tab.key)} // Use a new state for inner tabs
                      className={`w-full p-3 cursor-pointer rounded font-semibold border-l-4 ${
                        innerFormTab === tab.key
                          ? "border-[#FF7F11] bg-[#FFF3E6] text-[#FF7F11]"
                          : "border-transparent bg-white hover:bg-[#FFF3E6] text-[#000000]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Form Fields */}
                <div className="w-full md:w-3/4 space-y-4">
                  {innerFormTab === "photos" && ( // Use innerFormTab here
                    <div className="space-y-4 border-2 border-dashed border-[#BEB7A4] rounded p-8 text-center text-[#BEB7A4]">
                      <label className="block text-[#000000] font-medium mb-2">
                        Upload Pet Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPetImage(e.target.files[0])}
                        className="text-[#000000]"
                      />
                      <p className="text-sm">PNG, JPG formats supported</p>
                      {/* Display current image for editing pet if no new image selected */}
                      {editingPet && !petImage && editingPet.imageUrl && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Current Image:</p>
                          <img src={editingPet.imageUrl} alt="Current Pet" className="w-24 h-24 object-cover mx-auto rounded-md" />
                          <a href={editingPet.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF7F11] text-sm hover:underline">View Full Size</a>
                        </div>
                      )}
                    </div>
                  )}

                  {innerFormTab === "info" && ( // Use innerFormTab here
                    <div className="space-y-4">
                      <label htmlFor="petName" className="block text-[#000000] font-medium">
                        Pet Name
                      </label>
                      <input
                        type="text"
                        id="petName"
                        placeholder="Enter pet's name"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        className="w-full p-3 border border-[#BEB7A4] rounded text-[#000000]"
                        required
                      />
                      <label htmlFor="description" className="block text-[#000000] font-medium mt-4">
                        Description
                      </label>
                      <textarea
                        id="description"
                        placeholder="Enter pet's description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border border-[#BEB7A4] rounded text-[#000000]"
                        rows={4}
                        required
                      />
                      <div className="flex space-x-4">
                        <div className="w-1/2">
                          <label htmlFor="type" className="block text-[#000000] font-medium">
                            Type
                          </label>
                          <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-3 border border-[#BEB7A4] rounded text-[#000000]"
                          >
                            <option value="Cat">Cat</option>
                            <option value="Dog">Dog</option>
                            {/* Add more types if needed */}
                          </select>
                        </div>
                        <div className="w-1/2">
                          <label htmlFor="breed" className="block text-[#000000] font-medium">
                            Breed
                          </label>
                          <input
                            type="text"
                            id="breed"
                            placeholder="Enter breed"
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            className="w-full p-3 border border-[#BEB7A4] rounded text-[#000000]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {innerFormTab === "personality" && ( // Use innerFormTab here
                    <textarea
                      rows={5}
                      placeholder="Describe the pet's personality (e.g., energetic, shy, playful, good with kids)"
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      className="w-full p-3 border border-[#BEB7A4] rounded text-[#000000]"
                      required
                    />
                  )}

                  {/* Action Buttons for Add/Edit Form */}
                  <button
                    onClick={selectedTab === "add-pet" ? handleAddPet : handleUpdatePet}
                    className="mt-4 bg-[#FF7F11] hover:bg-[#FF1B1C] text-white px-6 py-3 rounded shadow-md transition"
                  >
                    {selectedTab === "add-pet" ? "Add Pet" : "Update Pet"}
                  </button>
                  {selectedTab === "edit-pet-form" && (
                     <button
                        onClick={() => { resetForm(); setSelectedTab("edit-pet"); }} // Cancel and go back to edit list
                        className="mt-4 ml-4 bg-gray-500 hover:bg-gray-700 text-white px-6 py-3 rounded shadow-md transition"
                      >
                        Cancel
                      </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* List for Editing Pets */}
          {selectedTab === "edit-pet" && (
            <>
              <h1 className="text-3xl font-bold text-[#FF7F11] mb-6">Edit Existing Pets</h1>
              <div className="space-y-4">
                {pets.length === 0 ? (
                  <p className="text-gray-600">No pets found to edit. Add some pets first!</p>
                ) : (
                  pets.map((pet) => (
                    <div key={pet.id} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
                      <div className="flex items-center">
                        {pet.imageUrl && (
                          <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                        )}
                        <div>
                          <h2 className="text-lg font-semibold">{pet.name}</h2>
                          <p className="text-sm text-gray-600">{pet.type} - {pet.breed}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditPet(pet)}
                        className="bg-[#FF7F11] hover:bg-[#FF1B1C] text-white px-4 py-2 rounded-md shadow-sm cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* List for Removing Pets */}
          {selectedTab === "remove-pet" && (
            <>
              <h1 className="text-3xl font-bold text-[#FF7F11] mb-6">Remove Pets</h1>
              <div className="space-y-4">
                {pets.length === 0 ? (
                  <p className="text-gray-600">No pets found to remove.</p>
                ) : (
                  pets.map((pet) => (
                    <div key={pet.id} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
                      <div className="flex items-center">
                        {pet.imageUrl && (
                          <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                        )}
                        <div>
                          <h2 className="text-lg font-semibold">{pet.name}</h2>
                          <p className="text-sm text-gray-600">{pet.type} - {pet.breed}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePet(pet.id, pet.imageUrl)}
                        className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-md shadow-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
      <MyFooter />
    </div>
  );
}