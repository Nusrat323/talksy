import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { FiTrash2 } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

export default function ChatList({ user, onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.id] = { uid: d.id, ...d.data() };
      });
      setAllUsers(map);
    });
    return () => unsub();
  }, []);

 
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const chatList = snap.docs
        .map((docSnap) => {
          const chat = docSnap.data();

         
          if (chat.deletedFor?.includes(user.uid)) return null;

          const otherUid = chat.participants.find((uid) => uid !== user.uid);

          return {
            id: docSnap.id,
            ...chat,
            otherUser: allUsers[otherUid] || {
              displayName: "Loading...",
              photoURL: "",
            },
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const timeA = a.lastMessageTime?.seconds || 0;
          const timeB = b.lastMessageTime?.seconds || 0;
          return timeB - timeA;
        });

      setChats(chatList);
    });

    return () => unsub();
  }, [user, allUsers]);

  // Soft delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const chatRef = doc(db, "chats", deleteTarget);

      await setDoc(
        chatRef,
        {
          deletedFor: [...(chats.find(c => c.id === deleteTarget)?.deletedFor || []), user.uid]
        },
        { merge: true }
      );

      setChats((prev) => prev.filter((c) => c.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  return (
    <div className="overflow-y-auto p-4 space-y-4 h-full bg-gray-50 dark:bg-gray-900">
      {chats.length === 0 && (
        <div className="text-gray-400 text-center mt-10 text-lg">
          No chats yet
        </div>
      )}

      {chats.map((chat) => (
        <div
          key={chat.id}
          className="flex items-center justify-between p-4 rounded-3xl cursor-pointer bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition transform hover:scale-[1.01]"
        >
          <div
            onClick={() => onSelectChat(chat)}
            className="flex items-center gap-4 flex-1"
          >
            <div className="relative">
              <img
                src={
                  chat.otherUser.photoURL ||
                  `https://ui-avatars.com/api/?name=${chat.otherUser.displayName}`
                }
                className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700"
              />
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white text-md">
                  {chat.otherUser.displayName}
                </h3>
                {chat.lastMessageTime && (
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(chat.lastMessageTime.toDate(), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
                {chat.lastMessage || "Start a new conversation..."}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(chat.id);
            }}
            className="p-2 hover:bg-red-100 rounded-full transition"
          >
            <FiTrash2 className="text-red-500 text-lg" />
          </button>
        </div>
      ))}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-80">
            <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
              Delete Chat?
            </h2>
            <p className="text-gray-500 dark:text-gray-300 mb-4">
              Are you sure you want to delete this chat?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}