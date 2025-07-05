import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import MyFooter from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "",
          email: user.email,
          role: "user",
        });
      }

      navigate("/"); // redirect to home page instead of /adopt
    } catch (err) {
      console.error("Google Sign-In Error:", err.message);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) throw new Error("Please enter both email and password.");
      if (!email.includes("@") || !email.includes(".")) throw new Error("Invalid email format.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      let userCredential;

      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginError) {
        if (
          loginError.code === "auth/user-not-found" ||
          loginError.code === "auth/wrong-password"
        ) {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: userCredential.user.email,
            role: "user",
          });
        } else {
          throw loginError;
        }
      }

      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/"); // redirect normal users to home
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-[#FFFFFC] flex items-center justify-center px-4">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-xl rounded-xl overflow-hidden">
          <div
            className="hidden md:block md:w-1/2 bg-cover bg-center"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1558788353-f76d92427f16")`,
            }}
          />

          <div className="w-full md:w-1/2 bg-[#FFFFFC] text-[#000000] flex items-center justify-center overflow-y-auto">
            <div className="w-full p-6 sm:p-10 flex flex-col justify-center min-h-full">
              <h2 className="text-3xl font-bold mb-6 text-center text-[#FF7F11]">
                Welcome Back 🐾
              </h2>

              {error && (
                <div className="bg-[#FF1B1C] text-[#FFFFFC] text-sm p-3 rounded mb-4 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6 w-full">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-[#BEB7A4] rounded bg-[#FFFFFC] text-[#000000] focus:ring-[#FF7F11]"
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-[#BEB7A4] rounded bg-[#FFFFFC] text-[#000000] focus:ring-[#FF7F11] pr-12"
                      placeholder="Your secure password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#FF7F11] hover:text-[#FF1B1C]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF7F11] hover:bg-[#FF1B1C] text-white py-3 font-semibold rounded transition duration-300"
                >
                  {loading ? "Processing..." : "Login / Register"}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white text-[#000000] border border-[#FF7F11] hover:bg-[#FF7F11] hover:text-white py-3 font-semibold rounded transition duration-300"
                >
                  Continue with Google
                </button>

                <p className="text-center text-sm text-[#000000]">
                  Don’t have an account?{" "}
                  <span className="text-[#FF1B1C] font-semibold">
                    Sign up happens automatically
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <MyFooter />
    </div>
  );
}
