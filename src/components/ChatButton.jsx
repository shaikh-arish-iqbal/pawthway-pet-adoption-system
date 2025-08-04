import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatSystem from "./ChatSystem";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";

const ChatButton = ({ shelterId, petId = null, shelterName = "Shelter" }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const handleChatClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setIsChatOpen(true);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleChatClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
          isDarkMode
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-[#FF7F11] text-white hover:bg-[#e56e0e]"
        }`}
      >
        <MessageCircle size={18} />
        Chat with {shelterName}
      </motion.button>

      <ChatSystem
        petId={petId}
        shelterId={shelterId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default ChatButton;
