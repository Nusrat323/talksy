import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

import { FiMessageSquare, FiUser, FiPlus } from "react-icons/fi";

import Login from "./components/Login";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import NewChat from "./components/NewChat";

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [showNewChat, setShowNewChat] = useState(false);

  
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    
    setDoc(
      userRef,
      {
        displayName: user.displayName,
        email: user.email,
        photoURL:
          user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`,
        online: true,
        lastActive: new Date(),
      },
      { merge: true }
    );

    const handleUnload = () => {
      setDoc(userRef, { online: false, lastActive: new Date() }, { merge: true });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      setDoc(userRef, { online: false, lastActive: new Date() }, { merge: true });
    };
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!user) return <Login />;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-all duration-300">

     
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-4 py-3 border-b shadow-sm">
        {selectedChat ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
            >
              ←
            </button>
            <img
              src={
                selectedChat.otherUser?.photoURL ||
                `https://ui-avatars.com/api/?name=${selectedChat.otherUser?.displayName || "User"}`
              }
              alt={selectedChat.otherUser?.displayName || "User"}
              className="w-10 h-10 rounded-full object-cover shadow"
            />
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {selectedChat.otherUser?.displayName || "Loading..."}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <h1 className="font-bold text-2xl text-teal-600 dark:text-gray-100">
              Talksy
            </h1>
            {activeTab === "chats" && (
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 shadow-md transition"
              >
                <FiPlus size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "chats" && !selectedChat && (
          <ChatList user={user} onSelectChat={setSelectedChat} />
        )}

        {selectedChat && <ChatWindow chat={selectedChat} user={user} />}

        {activeTab === "profile" && !selectedChat && (
          <div className="flex flex-col items-center mt-6">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
              className="w-28 h-28 rounded-full shadow-lg mb-4"
            />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.displayName}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            <button
              onClick={() => auth.signOut()}
              className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      
      <div className="h-16 bg-white dark:bg-gray-800 border-t flex justify-around items-center shadow-md">
        <button
          onClick={() => {
            setActiveTab("chats");
            setSelectedChat(null);
          }}
          className={`${activeTab === "chats" ? "text-teal-600" : "text-gray-400"} transition`}
        >
          <FiMessageSquare size={22} />
        </button>

        <button
          onClick={() => {
            setActiveTab("profile");
            setSelectedChat(null);
          }}
          className={`${activeTab === "profile" ? "text-teal-600" : "text-gray-400"} transition`}
        >
          <FiUser size={22} />
        </button>
      </div>

     
      {showNewChat && (
        <NewChat
          user={user}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setShowNewChat(false);
          }}
          close={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
}