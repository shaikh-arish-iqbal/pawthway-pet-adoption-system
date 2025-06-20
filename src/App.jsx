import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Adopt from './pages/Adopt';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from "./pages/Login";
import PetDetail from "./pages/PetDetail";
import Navbar from "./components/Navbar";
import ShelterInfoForm from "./pages/ShelterInfoForm";
import AdminDashboard from "./pages/AdminDashboard";



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pet/:id" element={<PetDetail />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/shelter-info" element={<ShelterInfoForm />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
