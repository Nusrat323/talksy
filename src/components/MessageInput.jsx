import { useState } from "react";
import { db, auth } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function MessageInput() {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        text,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName
      });
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
      alert("Cannot send message. Check Firestore rules.");
    }
  };

  return (
    <div className="flex p-3 bg-white border-t">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded px-3 py-2 outline-none"
        placeholder="Type a message..."
      />
      <button
        onClick={sendMessage}
        className="ml-2 bg-green-500 text-white px-4 rounded"
      >
        Send
      </button>
    </div>
  );
}