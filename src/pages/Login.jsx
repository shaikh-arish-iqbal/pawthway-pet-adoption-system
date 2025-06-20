import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged, // Keep this import, it's good practice for other listeners
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar"; // Keep commented or uncomment if you want Navbar on login page
import MyFooter from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // IMPORTANT: Removed the useEffect that was prematurely redirecting
  // The redirection logic will now only happen *after* a successful login/registration
  // in the handleAuth function.
  // For initial page load/refresh, your App.jsx (or a root component)
  // should ideally handle auth state changes and initial redirects.

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // --- Client-side validation (good practice) ---
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }
      if (!email.includes('@') || !email.includes('.')) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      let userCredential;
      try {
        // Attempt 1: Try to Log In
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful!");
      } catch (loginError) {
        // If login fails, attempt to create the user
        if (
          loginError.code === "auth/user-not-found" ||
          loginError.code === "auth/wrong-password" ||
          loginError.code === "auth/invalid-credential"
        ) {
          console.log("Login failed or user not found. Attempting to register...");
          try {
            userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            console.log("User registered successfully!");

            // Save user role to Firestore for new users
            await setDoc(doc(db, "users", userCredential.user.uid), {
              email: userCredential.user.email,
              role: "user", // Default role for newly registered users
            });
            console.log("New user data saved to Firestore.");

          } catch (signupError) {
            if (signupError.code === "auth/email-already-in-use") {
              setError("This email is already registered. Please try logging in with the correct password.");
            } else if (signupError.code === "auth/weak-password") {
              setError("Password is too weak. Please choose a stronger password (at least 6 characters).");
            } else {
              setError(signupError.message || "An error occurred during registration.");
            }
            console.error("Signup Error:", signupError);
            setLoading(false);
            return;
          }
        } else {
          // Other unexpected login errors
          setError(loginError.message || "An unexpected error occurred during login.");
          console.error("Login Error:", loginError);
          setLoading(false);
          return;
        }
      }

      // If we reach here, userCredential should be available from either login or signup.
      setEmail("");
      setPassword("");

      // Redirect based on user role after successful authentication
      // Use the user from userCredential directly as it's the most reliable after a fresh auth operation
      const user = userCredential.user;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin-dashboard");
        } else {
          // Default redirection for non-admin users or newly registered users
          navigate("/adopt");
        }
      } else {
        setError("Authentication successful, but user object is missing.");
        console.error("User object is null after authentication.");
      }

    } catch (err) {
      // Catch client-side validation errors or general unexpected errors
      console.error("Overall Authentication Error:", err.message);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <Navbar /> */} {/* Uncomment if you want to include your Navbar */}
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-[#BEB7A4] rounded bg-[#FFFFFC] text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#FF7F11]"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-[#BEB7A4] rounded bg-[#FFFFFC] text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#FF7F11] pr-12"
                      placeholder="Your secure password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#FF7F11] hover:text-[#FF1B1C] font-semibold disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF7F11] hover:bg-[#FF1B1C] text-white py-3 font-semibold rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Processing..." : "Login / Register"}
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