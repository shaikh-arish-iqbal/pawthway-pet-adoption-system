import React, { useState } from "react";
import { auth, db, googleProvider } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import MyFooter from "../components/Footer";
import { useDarkMode } from "../contexts/DarkModeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
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
      setError("Google sign-in failed. Please try again: " + err.message);
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
      <div
        className={`min-h-screen flex items-center justify-center px-6 py-8 ${
          isDarkMode
            ? "bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#2d2d2d]"
            : "bg-gradient-to-br from-[#FFFFFC] via-[#f8f7f4] to-[#BEB7A4]"
        }`}
      >
        <div
          className={`flex flex-col lg:flex-row w-full max-w-7xl shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-yellow-900/30 border border-yellow-500/20"
              : "bg-white/95 border border-gray-200/50"
          }`}
        >
          <div
            className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1558788353-f76d92427f16")`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="text-2xl font-bold mb-2">
                Find Your Perfect Companion
              </h3>
              <p className="text-white/80">
                Join thousands of happy pet adoptions
              </p>
            </div>
          </div>

          <div
            className={`w-full lg:w-1/2 flex items-center justify-center overflow-y-auto ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-yellow-900/20 text-white"
                : "bg-white/95 text-[#000000]"
            }`}
          >
            <div className="w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center min-h-full">
              <div className="text-center mb-8">
                <h2
                  className={`text-4xl lg:text-5xl font-black mb-4 ${
                    isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"
                  }`}
                >
                  Welcome Back
                </h2>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Sign in to continue your pet adoption journey 🐾
                </p>
              </div>

              {error && (
                <div
                  className={`text-sm p-4 rounded-xl mb-6 text-center border ${
                    isDarkMode
                      ? "bg-red-600/90 text-white border-red-500/30"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleLogin}
                className="space-y-8 w-full max-w-md mx-auto"
              >
                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-opacity-30 transition-all duration-300 ${
                      isDarkMode
                        ? "border-yellow-600/50 bg-gradient-to-r from-gray-800 to-yellow-900/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
                        : "border-gray-300 bg-white text-gray-900 focus:ring-[#FF7F11] focus:border-[#FF7F11]"
                    }`}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-opacity-30 transition-all duration-300 pr-12 ${
                        isDarkMode
                          ? "border-yellow-600/50 bg-gradient-to-r from-gray-800 to-yellow-900/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
                          : "border-gray-300 bg-white text-gray-900 focus:ring-[#FF7F11] focus:border-[#FF7F11]"
                      }`}
                      placeholder="Your secure password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium hover:scale-110 transition-transform ${
                        isDarkMode
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-[#FF7F11] hover:text-[#FF1B1C]"
                      }`}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                    isDarkMode
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-yellow-400/25"
                      : "bg-gradient-to-r from-[#FF7F11] to-[#FF1B1C] hover:from-[#FF1B1C] hover:to-[#FF7F11] text-white shadow-[#FF7F11]/25"
                  }`}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span
                      className={`px-2 ${
                        isDarkMode
                          ? "bg-gray-900/95 text-gray-400"
                          : "bg-white/95 text-gray-500"
                      }`}
                    >
                      or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full border-2 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isDarkMode
                      ? "bg-gradient-to-r from-gray-800 to-yellow-900/20 text-white border-yellow-400 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:text-black"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-[#FF7F11]"
                  }`}
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

                <p
                  className={`text-center text-sm mt-8 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className={`font-semibold hover:underline transition-colors ${
                      isDarkMode
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-[#FF1B1C] hover:text-[#FF7F11]"
                    }`}
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
