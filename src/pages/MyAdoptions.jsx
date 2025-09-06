import React, { useEffect, useState } from "react";
import MyFooter from "../components/Footer";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  BsHeartFill,
  BsCheckCircleFill,
  BsHourglassSplit,
  BsXCircleFill,
} from "react-icons/bs";

const MyAdoptions = () => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null); // for popup

  // --- Auth listener ---
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user || null);
    });
    return () => unsub();
  }, []);

  // --- Fetch user's adoption forms + join pets ---
  useEffect(() => {
    const fetchAdoptions = async () => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, "adoptionForms"),
          where("userId", "==", firebaseUser.uid)
        );

        const snapshot = await getDocs(q);

        const rows = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const adoption = { id: docSnap.id, ...data };

            let petName = data.petName || "";
            let petType = "";
            let petCity = "";
            let petImage = "";

            if (data.petId) {
              try {
                const petRef = doc(db, "pets", data.petId);
                const petSnap = await getDoc(petRef);
                if (petSnap.exists()) {
                  const petData = petSnap.data();
                  petName = petName || petData.name || "";
                  petType = petData.type || "";
                  petCity = petData.city || "";

                  const first =
                    (petData.imageUrls && petData.imageUrls[0]) || "";
                  if (first) {
                    if (/^https?:\/\//i.test(first)) {
                      petImage = first;
                    } else {
                      try {
                        const url = await getDownloadURL(ref(storage, first));
                        petImage = url;
                      } catch {
                        petImage = "";
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn("Join pets failed:", e);
              }
            }

            return {
              ...adoption,
              petName,
              petType,
              petCity,
              petImage,
            };
          })
        );

        rows.sort((a, b) => {
          const ta = a.timestamp?.toMillis?.() ?? 0;
          const tb = b.timestamp?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setAdoptions(rows);
      } catch (error) {
        console.error("Error fetching adoptions:", error);
        toast.error("Couldn't load your adoptions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptions();
  }, [firebaseUser]);

  // --- Cancel adoption ---
  const cancelAdoption = async (id) => {
    try {
      setCancelingId(id);
      await deleteDoc(doc(db, "adoptionForms", id));
      setAdoptions((prev) => prev.filter((a) => a.id !== id));
      toast.success("Adoption request cancelled.");
    } catch (error) {
      console.error("Error cancelling adoption:", error);
      toast.error("Failed to cancel adoption.");
    } finally {
      setCancelingId(null);
      setConfirmingId(null); // close popup
    }
  };

  // --- UI helpers ---
  const StatusBadge = ({ status }) => {
    if (status === "approved")
      return (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
          style={{ backgroundColor: "#B9E8A1", color: "#2B6A2D" }}
        >
          <BsCheckCircleFill className="mr-1 text-base" /> Approved
        </span>
      );

    if (status === "rejected")
      return (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
          style={{ backgroundColor: "#ffd6d6", color: "#b42318" }}
        >
          <BsXCircleFill className="mr-1 text-base" /> Rejected
        </span>
      );

    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
        style={{ backgroundColor: "#FFEDC0", color: "#FFA500" }}
      >
        <BsHourglassSplit className="mr-1 text-base" /> Pending
      </span>
    );
  };

  // --- Render ---
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#FFFFFC" }}
      >
        <p
          className="font-semibold text-lg animate-pulse"
          style={{ color: "#BEB7A4" }}
        >
          Loading your adoptions...
        </p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div
        className="flex items-center justify-center min-h-screen px-4 text-center"
        style={{ backgroundColor: "#FFFFFC" }}
      >
        <p className="font-semibold text-lg" style={{ color: "#BEB7A4" }}>
          Please sign in to view your adoptions.
        </p>
      </div>
    );
  }

  if (adoptions.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen px-4 text-center"
        style={{ backgroundColor: "#FFFFFC" }}
      >
        <p className="font-semibold text-lg" style={{ color: "#BEB7A4" }}>
          You haven't applied for adoption yet. Start your journey now!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="min-h-screen pt-15 px-4 relative overflow-hidden"
        style={{ backgroundColor: "#FFFFFC" }}
      >
        {/* Subtle background pattern */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="2" fill="%23BEB7A4" /><circle cx="4" cy="4" r="1.5" fill="%23BEB7A4" /><circle cx="16" cy="4" r="1.5" fill="%23BEB7A4" /><circle cx="4" cy="16" r="1.5" fill="%23BEB7A4" /><circle cx="16" cy="16" r="1.5" fill="%23BEB7A4" /></svg>')`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 flex flex-col items-center">
            <BsHeartFill
              className="text-5xl mb-2"
              style={{ color: "#FF7F11" }}
            />
            <h2
              className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight"
              style={{ color: "#000000" }}
            >
              My Adoptions
            </h2>
            <p className="text-lg mt-2" style={{ color: "#BEB7A4" }}>
              Track the status of your adoption requests.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adoptions.map((adoption) => (
              <motion.div
                key={adoption.id}
                className="rounded-3xl shadow-xl p-0 flex flex-col transform hover:scale-[1.02] transition-transform duration-300 ease-in-out border border-[#BEB7A4]/30"
                style={{ backgroundColor: "#FFFFFC" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Image */}
                <div className="w-full h-44 rounded-t-3xl overflow-hidden bg-[#BEB7A4] flex items-center justify-center">
                  {adoption.petImage ? (
                    <img
                      src={adoption.petImage}
                      alt={adoption.petName || "Pet"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-1">🐾</div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#FFFFFC" }}
                      >
                        No Image
                      </p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-grow">
                  <h3
                    className="text-2xl font-bold mb-1"
                    style={{ color: "#FF7F11" }}
                  >
                    {adoption.petName || "Unnamed Pet"}
                  </h3>

                  <div className="text-sm mb-4" style={{ color: "#7a7568" }}>
                    {adoption.petType ? `${adoption.petType}` : ""}{" "}
                    {adoption.petCity ? `• 📍 ${adoption.petCity}` : ""}
                  </div>

                  <div className="flex items-center mb-3">
                    <span
                      className="text-sm font-semibold mr-2"
                      style={{ color: "#BEB7A4" }}
                    >
                      Status:
                    </span>
                    <StatusBadge status={adoption.status} />
                  </div>

                  <p className="text-sm" style={{ color: "#BEB7A4" }}>
                    Applied on:{" "}
                    {adoption.timestamp?.toDate
                      ? adoption.timestamp.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {/* Actions */}
                {adoption.status !== "approved" && (
                  <motion.button
                    whileHover={{
                      scale: cancelingId === adoption.id ? 1 : 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                    disabled={cancelingId === adoption.id}
                    onClick={() => setConfirmingId(adoption.id)}
                    className="mt-auto w-full px-6 py-3 rounded-b-3xl shadow-md transition-colors duration-200 disabled:opacity-60"
                    style={{ backgroundColor: "#FF1B1C", color: "#FFFFFC" }}
                  >
                    {cancelingId === adoption.id
                      ? "Cancelling..."
                      : "Cancel Request"}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      <AnimatePresence>
        {confirmingId && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-4">
                Cancel Adoption Request?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this request? This action cannot
                be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => cancelAdoption(confirmingId)}
                  disabled={cancelingId === confirmingId}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelingId === confirmingId ? "Cancelling..." : "Yes"}
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 shadow hover:bg-gray-300"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MyFooter />
    </div>
  );
};

export default MyAdoptions;
