"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui";

interface Message {
  id: string;
  text: string;
  senderType: string;
  createdAt: any;
  isEdited?: boolean;
}

export function LiveChat({ 
  chatId, 
  onClose, 
  userType = "student" 
}: { 
  chatId: string; 
  onClose?: () => void;
  userType?: "student" | "counsellor"; 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "cases", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[]);
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await addDoc(collection(db, "cases", chatId, "messages"), {
      text: newMessage,
      senderType: userType, 
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || !editingId) return;
    await updateDoc(doc(db, "cases", chatId, "messages", editingId), {
      text: editText,
      isEdited: true,
    });
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (msgId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteDoc(doc(db, "cases", chatId, "messages", msgId));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <div className="bg-teal-50 px-4 py-3 border-b border-teal-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden>💬</span>
          <h3 className="font-semibold text-teal-900 text-sm">
            Live Support Chat {userType === "counsellor" ? "(Counsellor View)" : ""}
          </h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-navy-500 hover:text-navy-900 text-xs font-medium border border-navy-200 px-2 py-1 rounded-full bg-white transition-colors">
            ✕ Close
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center text-navy-400 text-sm mt-10 italic">Start the conversation...</div>
        ) : (
          messages.map((msg) => {
            // 🔥 Exact comparison fix: checks if current logged in user type matches message senderType
            const isMe = msg.senderType === userType;
            const isEditing = editingId === msg.id;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}>
                <span className="text-[10px] text-navy-400 mb-1 px-1 uppercase tracking-wider font-semibold">
                  {isMe ? "You" : (userType === "student" ? "Counsellor" : "Student")}
                </span>
                
                {isEditing ? (
                  <form onSubmit={handleEdit} className="flex gap-2 w-full max-w-[80%]">
                    <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 rounded-xl border border-teal-500 px-3 py-1 text-sm outline-none" />
                    <button type="submit" className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 rounded-lg">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs font-semibold text-navy-500 bg-navy-100 px-2 rounded-lg">Cancel</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 max-w-[80%]">
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => { setEditingId(msg.id); setEditText(msg.text); }} className="text-xs bg-white border border-navy-200 rounded p-1 hover:bg-navy-50" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(msg.id)} className="text-xs bg-white border border-red-200 rounded p-1 hover:bg-red-50 text-red-500" title="Delete">🗑️</button>
                      </div>
                    )}
                    
                   <div className={`px-4 py-2 text-sm rounded-2xl relative shadow-sm max-w-[280px] sm:max-w-xs break-words whitespace-pre-wrap ${
                      isMe 
                        ? "bg-teal-600 text-white rounded-br-none" 
                        : "bg-white border border-navy-200 text-navy-900 rounded-bl-none"
                    }`}>
                      {msg.text}
                      {msg.isEdited && <span className="text-[9px] opacity-60 ml-2 italic">(edited)</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-navy-100 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-navy-200 px-4 py-2 text-sm focus:outline-teal-500 focus:ring-1"
        />
        <Button type="submit" disabled={!newMessage.trim()} tone="primary">Send</Button>
      </form>
    </div>
  );
}