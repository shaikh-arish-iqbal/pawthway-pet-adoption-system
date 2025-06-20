// import React, { useState } from "react";
// import { db, storage } from "../firebaseConfig";
// import { addDoc, collection } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export default function UploadPet() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     onAuthStateChanged(auth, (u) => {
//       if (u) setUser(u);
//       else navigate("/login"); // redirect if not logged in
//     });
//   }, []);

//   if (!user) return null; // Don't render form while checking



  
//   const [form, setForm] = useState({
//     name: "",
//     type: "Dog",
//     breed: "",
//     age: "",
//     location: "",
//     image: null,
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const imageRef = ref(storage, `pets/${Date.now()}_${form.image.name}`);
//     await uploadBytes(imageRef, form.image);
//     const imageURL = await getDownloadURL(imageRef);

//     await addDoc(collection(db, "pets"), {
//       name: form.name,
//       type: form.type,
//       breed: form.breed,
//       age: form.age,
//       location: form.location,
//       imageURL,
//     });

//     alert("Pet uploaded successfully!");
//     setForm({
//       name: "",
//       type: "Dog",
//       breed: "",
//       age: "",
//       location: "",
//       image: null,
//     });
//   };

//   return (
//     <div className="p-10 mt-24">
//       <h2 className="text-3xl font-bold mb-6 text-[#FF7F11]">Upload a Pet</h2>
//       <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
//         {["name", "breed", "age", "location"].map((field) => (
//           <input
//             key={field}
//             name={field}
//             placeholder={field}
//             value={form[field]}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded"
//             required
//           />
//         ))}
//         <select
//           name="type"
//           value={form.type}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded"
//         >
//           <option value="Dog">Dog</option>
//           <option value="Cat">Cat</option>
//         </select>
//         <input
//           type="file"
//           name="image"
//           onChange={handleChange}
//           accept="image/*"
//           className="w-full"
//           required
//         />
//         <button
//           type="submit"
//           className="bg-[#FF7F11] text-white px-4 py-2 rounded hover:bg-[#FF1B1C]"
//         >
//           Upload Pet
//         </button>
//       </form>
//     </div>
//   );
// }
