import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function NewChat({ user, onSelectChat, close }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, snap => {
      const otherUsers = snap.docs
        .filter(d => d.id !== user.uid)
        .map(d => ({ uid: d.id, ...d.data() }));
      setUsers(otherUsers);
    });
    return () => unsub();
  }, [user]);

  const startChat = async (otherUser) => {
    const sortedIds = [user.uid, otherUser.uid].sort();
    const chatId = sortedIds.join("_");

    
    await setDoc(doc(db, "chats", chatId), {
      participants: sortedIds,
      lastMessage: "Say hi!",
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    onSelectChat({ id: chatId, participants: sortedIds, lastMessage: "Say hi!", otherUser });
    close();
  };

  const filteredUsers = users.filter(u => u.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-96 max-h-[80vh] flex flex-col gap-4 overflow-auto">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Start New Chat</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="px-3 py-2 border rounded w-full dark:bg-gray-700 dark:text-white"
        />
        {filteredUsers.map(u => (
          <div
            key={u.uid}
            onClick={() => startChat(u)}
            className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <img
              src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`}
              alt={u.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-medium">{u.displayName}</span>
          </div>
        ))}
        <button
          onClick={close}
          className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}