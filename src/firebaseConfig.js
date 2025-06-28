// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Add this
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDapPb3KBmCN0Yl8pNd1MWccCpyYDbgrpE",
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
