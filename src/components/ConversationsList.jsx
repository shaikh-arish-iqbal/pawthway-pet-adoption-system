import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { MessageCircle, User, Clock } from "lucide-react";
import ChatSystem from "./ChatSystem";
import { useDarkMode } from "../contexts/DarkModeContext";

const ConversationsList = ({ userId, userType = "shelter" }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState({});
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (!userId) return;

    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participantIds", "array-contains", userId),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationList = [];
      const participantData = {};

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Get the other participant (not current user)
        const otherParticipantId = data.participantIds.find(
          (id) => id !== userId
        );

        if (otherParticipantId && !participantData[otherParticipantId]) {
          // Try to get from users collection first, then shelters
          let participantInfo = null;

          try {
            const userDoc = await getDoc(doc(db, "users", otherParticipantId));
            if (userDoc.exists()) {
              participantInfo = {
                name: userDoc.data().name || "Anonymous User",
                type: "user",
              };
            } else {
              const shelterDoc = await getDoc(
                doc(db, "shelters", otherParticipantId)
              );
              if (shelterDoc.exists()) {
                participantInfo = {
                  name: shelterDoc.data().shelterName || "Shelter",
                  type: "shelter",
                };
              }
            }
          } catch (error) {
            console.error("Error fetching participant info:", error);
          }

          participantData[otherParticipantId] = participantInfo || {
            name: "Unknown User",
            type: "unknown",
          };
        }

        conversationList.push({
          id: docSnap.id,
          ...data,
          otherParticipantId,
          participantInfo: participantData[otherParticipantId],
        });
      }

      setConversations(conversationList);
      setParticipants(participantData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const formatLastMessage = (message, maxLength = 50) => {
    if (!message) return "No messages yet";
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-yellow-400" : "border-[#FF7F11]"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* Conversations List */}
      <div
        className={`rounded-xl shadow-lg border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3
            className={`font-bold text-lg ${
              isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
            }`}
          >
            Conversations ({conversations.length})
          </h3>
        </div>

        <div className="overflow-y-auto h-[500px]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle
                size={48}
                className={
                  isDarkMode ? "text-gray-600 mb-4" : "text-gray-400 mb-4"
                }
              />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                No conversations yet
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{
                  backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                }}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  isDarkMode
                    ? "border-gray-700 hover:bg-gray-700"
                    : "border-gray-100 hover:bg-gray-50"
                } ${
                  selectedConversation?.id === conversation.id
                    ? isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        isDarkMode ? "bg-yellow-400/20" : "bg-[#FF7F11]/20"
                      }`}
                    >
                      <User
                        size={18}
                        className={
                          isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {conversation.participantInfo?.name || "Unknown User"}
                      </h4>
                      <p
                        className={`text-sm truncate ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {formatLastMessage(conversation.lastMessage)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(conversation.lastUpdated)}
                    </span>
                    {conversation.unreadCount?.[userId] > 0 && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isDarkMode
                            ? "bg-yellow-400 text-black"
                            : "bg-[#FF1B1C] text-white"
                        }`}
                      >
                        {conversation.unreadCount[userId]}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`rounded-xl shadow-lg border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            <div
              className={`p-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`font-bold text-lg ${
                  isDarkMode ? "text-yellow-400" : "text-[#FF1B1C]"
                }`}
              >
                Chat with {selectedConversation.participantInfo?.name}
              </h3>
            </div>

            {/* Embed the ChatSystem component inline */}
            <div className="flex-1">
              <ChatSystem
                petId={selectedConversation.petId}
                shelterId={selectedConversation.otherParticipantId}
                isOpen={true}
                onClose={() => {}} // Don't close in this context
                conversationId={selectedConversation.id}
                inline={true} // Add prop to render inline instead of modal
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle
              size={64}
              className={
                isDarkMode ? "text-gray-600 mb-4" : "text-gray-400 mb-4"
              }
            />
            <h3
              className={`font-bold text-lg mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Select a Conversation
            </h3>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Choose a conversation from the list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
