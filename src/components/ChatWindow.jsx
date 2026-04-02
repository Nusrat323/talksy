import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";

export default function ChatWindow({ chat, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chat?.id) return;

    const messagesRef = collection(db, "chats", chat.id, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(msgs);
    });

    return unsub;
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messagesRef = collection(db, "chats", chat.id, "messages");

    await addDoc(messagesRef, {
      text: newMessage,
      sender: user.uid,
      createdAt: serverTimestamp(),
    });

    const chatRef = doc(db, "chats", chat.id);
    await setDoc(
      chatRef,
      {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        deletedFor: chat.deletedFor?.filter(uid => uid !== user.uid) || [],
      },
      { merge: true }
    );

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-[70%] ${
                msg.sender === user.uid
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex p-2 border-t dark:border-gray-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-l-lg border dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={sendMessage}
          className="px-4 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}