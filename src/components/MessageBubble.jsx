import { auth } from "../firebase/firebase";

export default function MessageBubble({ message }) {
  const isMe = message.uid === auth.currentUser?.uid;
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-xs break-words ${
          isMe ? "bg-green-500 text-white" : "bg-white"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
