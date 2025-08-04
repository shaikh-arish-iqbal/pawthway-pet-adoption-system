import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { Send, X, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useDarkMode } from "../contexts/DarkModeContext";

const ChatSystem = ({ petId = null, shelterId = null, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shelterInfo, setShelterInfo] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const { isDarkMode } = useDarkMode();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (!isOpen || !currentUser || !shelterId) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    const initializeConversation = async () => {
      try {
        setLoading(true);
        console.log(
          "Initializing conversation for:",
          currentUser.uid,
          "with shelter:",
          shelterId
        );

        // Get shelter info
        const shelterDoc = await getDoc(doc(db, "shelters", shelterId));
        if (shelterDoc.exists()) {
          setShelterInfo(shelterDoc.data());
          console.log("Shelter info loaded:", shelterDoc.data());
        }

        // Find existing conversation
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("participantIds", "array-contains", currentUser.uid)
        );
        const conversationsSnap = await getDocs(q);

        let existingConversation = null;
        conversationsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.participantIds.includes(shelterId)) {
            existingConversation = { id: docSnap.id, ...data };
            console.log("Found existing conversation:", docSnap.id);
          }
        });

        if (existingConversation) {
          setConversationId(existingConversation.id);
        } else {
          // Create new conversation
          console.log("Creating new conversation...");
          const newConversation = await addDoc(conversationsRef, {
            participantIds: [currentUser.uid, shelterId],
            petId: petId || null,
            lastMessage: "",
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
            unreadCount: {
              [currentUser.uid]: 0,
              [shelterId]: 0,
            },
          });
          console.log("New conversation created:", newConversation.id);
          setConversationId(newConversation.id);
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
        toast.error("Failed to start conversation: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeConversation();
  }, [isOpen, currentUser, shelterId, petId]);

  // Listen for messages in real-time
  useEffect(() => {
    if (!conversationId) {
      console.log("No conversation ID, skipping message listener");
      return;
    }

    console.log(
      "Setting up real-time listener for conversation:",
      conversationId
    );

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "Messages snapshot received, doc count:",
          snapshot.docs.length
        );

        const messageList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Firestore timestamp to JavaScript Date
            timestamp: data.timestamp?.toDate?.() || new Date(),
          };
        });

        console.log("Processed messages:", messageList);
        setMessages(messageList);
      },
      (error) => {
        console.error("Error in messages listener:", error);
        toast.error("Error loading messages: " + error.message);
      }
    );

    return () => {
      console.log("Cleaning up messages listener");
      unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUser || sending)
      return;

    try {
      setSending(true);
      console.log("Sending message:", newMessage.trim());

      // Add message to messages collection
      const messageData = {
        conversationId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || "Anonymous",
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        type: "text",
        read: false,
      };

      console.log("Message data to send:", messageData);

      const docRef = await addDoc(collection(db, "messages"), messageData);
      console.log("Message sent successfully with ID:", docRef.id);

      // Update conversation's last message
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: newMessage.trim(),
        lastUpdated: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDarkMode
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-yellow-400/20" : "bg-[#FF7F11]/20"
              }`}
            >
              <MessageCircle
                size={20}
                className={isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}
              />
            </div>
            <div>
              <h3
                className={`font-bold ${
                  isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
                }`}
              >
                {shelterInfo?.shelterName || "Shelter Chat"}
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {petId ? "About a specific pet" : "General inquiry"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDarkMode ? "border-yellow-400" : "border-[#FF7F11]"
                }`}
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle
                size={48}
                className={`mb-4 ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Start a conversation with the shelter
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Conversation ID: {conversationId || "Not set"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.senderId === currentUser.uid
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.senderId === currentUser.uid
                        ? isDarkMode
                          ? "bg-yellow-500 text-black"
                          : "bg-[#FF7F11] text-white"
                        : isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 opacity-70 ${
                        message.senderId === currentUser.uid
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {message.timestamp?.toLocaleTimeString?.() ||
                        "Sending..."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div
          className={`p-4 border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white focus:ring-yellow-400/30 placeholder-gray-400"
                  : "bg-white border-gray-300 text-black focus:ring-[#FF7F11]/30 placeholder-gray-500"
              }`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={`p-2 rounded-full transition-colors ${
                newMessage.trim() && !sending
                  ? isDarkMode
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-[#FF7F11] text-white hover:bg-[#e56e0e]"
                  : isDarkMode
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {sending ? (
                <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatSystem;
