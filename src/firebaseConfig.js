// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Add this
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();
// Add scopes for Google provider
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account'
});


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pawthway-fb57d.firebaseapp.com",
  projectId: "pawthway-fb57d",
  storageBucket: "pawthway-fb57d.firebasestorage.app",
  messagingSenderId: "75676576591",
  appId: "1:75676576591:web:3b0f958cb738974244b33a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = provider;
