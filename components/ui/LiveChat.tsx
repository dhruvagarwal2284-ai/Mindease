"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui";

// 🔥 Update interface to include senderType
interface Message {
  id: string;
  text: string;
  senderType: string; // This will store "student" or "counsellor"
  createdAt: any;
  isEdited?: boolean;
}

// 🔥 ADDED userType to props! Default is "student" just in case.
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

  // 1. FETCH MESSAGES REAL-TIME
  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "cases", chatId, "messages"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[]);
    });
    
    return () => unsubscribe();
  }, [chatId]);

  // AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. SEND MESSAGE
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // 🔥 Form submit page reload roki
    if (!newMessage.trim()) return;
    
    // Message bhejte time database me senderType save hoga
    await addDoc(collection(db, "cases", chatId, "messages"), {
      text: newMessage,
      senderType: userType, 
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  // 3. EDIT MESSAGE
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

  // 4. DELETE MESSAGE
  const handleDelete = async (msgId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteDoc(doc(db, "cases", chatId, "messages", msgId));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* HEADER */}
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

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-navy-400 text-sm mt-10 italic">Start the conversation...</div>
        ) : (
          messages.map((msg) => {
            // 🔥 THE MAGIC: Compare message sender with current user
            // Added fallbacks for old messages that might have used senderId or sender
            const msgSender = msg.senderType || (msg as any).sender || (msg as any).senderId;
            const isMe = msgSender === userType;
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
                    {/* Delete & Edit Buttons (Only show for 'Me') */}
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => { setEditingId(msg.id); setEditText(msg.text); }} className="text-xs bg-white border border-navy-200 rounded p-1 hover:bg-navy-50" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(msg.id)} className="text-xs bg-white border border-red-200 rounded p-1 hover:bg-red-50 text-red-500" title="Delete">🗑️</button>
                      </div>
                    )}
                    
                    {/* Chat Bubble */}
                    <div className={`px-4 py-2 text-sm rounded-2xl relative shadow-sm ${
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

      {/* INPUT AREA */}
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