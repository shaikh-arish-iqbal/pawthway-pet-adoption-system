import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }
      if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Invalid email format.");
      }

      // Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

      // Successfully authenticated
      const user = userCredential.user;

      // Check if user exists in Firestore and get their role
      const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin-dashboard");
      } else {
        navigate("/"); // redirect normal users to home
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-credential") {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
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

              <form onSubmit={handleLogin} className="space-y-6 w-full">
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
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white text-[#000000] border border-[#FF7F11] hover:bg-[#FF7F11] hover:text-white py-3 font-semibold rounded transition duration-300 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-sm text-[#000000]">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-[#FF1B1C] font-semibold hover:underline"
                  >
                    Create one here
                  </Link>
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
