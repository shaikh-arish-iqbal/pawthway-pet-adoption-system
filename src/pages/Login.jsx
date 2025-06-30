import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig"; // Ensure 'auth' is exported from firebaseConfig
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup,    // Import signInWithPopup
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";
import MyFooter from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // useEffect to handle initial auth state check and potential redirect
  // This is good practice to prevent showing login page to already logged-in users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, check role and redirect
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/adopt");
        }
      }
    });
    return unsubscribe; // Cleanup subscription on component unmount
  }, [navigate]); // navigate should be in dependency array

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
        // Attempt 1: Try to Log In with Email/Password
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Email/Password Login successful!");
      } catch (loginError) {
        // If login fails, attempt to create the user
        if (
          loginError.code === "auth/user-not-found" ||
          loginError.code === "auth/wrong-password" ||
          loginError.code === "auth/invalid-credential"
        ) {
          console.log("Email/Password login failed. Attempting to register...");
          try {
            userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            console.log("User registered successfully with Email/Password!");

            // Save user role to Firestore for new users
            await setDoc(doc(db, "users", userCredential.user.uid), {
              email: userCredential.user.email,
              role: "user", // Default role for newly registered users
              createdAt: new Date(), // Add a timestamp
            }, { merge: true }); // Use merge: true in case doc exists (e.g. from Google sign-up first)
            console.log("New user data saved to Firestore.");

          } catch (signupError) {
            if (signupError.code === "auth/email-already-in-use") {
              setError("This email is already registered. Please try logging in with the correct password or use Google sign-in.");
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
      const user = userCredential.user;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin-dashboard");
        } else {
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

  // --- New function for Google Sign-In ---
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    const provider = new GoogleAuthProvider(); // Create a Google Auth Provider

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // The signed-in user info

      console.log('Google Sign-In Successful!', user);

      // Check if user document exists in Firestore, create if not
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user or first time Google login, create user document
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName, // Save display name from Google
          photoURL: user.photoURL,     // Save photo URL from Google
          role: "user", // Default role
          createdAt: new Date(),
        });
        console.log("New Google user data saved to Firestore.");
      }

      // Redirect based on user role (including existing users and newly created ones)
      const updatedUserDoc = await getDoc(userDocRef); // Re-fetch to get potential updated role
      if (updatedUserDoc.exists() && updatedUserDoc.data().role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/adopt");
      }

    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Google Sign-In Error:', errorMessage, 'Code:', errorCode);

      if (errorCode === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed. Please try again.');
      } else if (errorCode === 'auth/cancelled-popup-request') {
        setError('Google sign-in attempt was cancelled. Please try again.');
      } else {
        setError(errorMessage || 'An error occurred during Google sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <Navbar /> */}
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

              {/* Separator */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[#FF1B1C] hover:bg-red-700 text-white py-3 font-semibold rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google icon"
                      className="w-5 h-5"
                    />
                    Sign in with Google
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>

      <MyFooter />
    </div>
  );
}