import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Adopt from "./pages/Adopt";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PetDetail from "./pages/PetDetail";
import Navbar from "./components/Navbar";
import UserProfile from "./components/UserProfile";
import ShelterInfoForm from "./pages/ShelterInfoForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdoptionForm from "./pages/AdoptionForm";
import FAQPage from "./pages/FAQPage";
import UserDashboard from "./pages/UserDashboard";
import Favourites from "./pages/Favourites";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import MyAdoptions from "./pages/MyAdoptions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DarkModeProvider } from "./contexts/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <ToastContainer position="bottom-right" />
      <BrowserRouter>
        <Navbar />
        {/* 👇 This adds spacing below the fixed navbar */}
        <main className="pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adopt" element={<Adopt />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/shelter-info" element={<ShelterInfoForm />} />
            <Route path="/adoption-form/:id" element={<AdoptionForm />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:postId" element={<BlogPost />} />
            <Route path="/my-adoptions" element={<MyAdoptions />} />
          </Routes>
        </main>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
