"use client";
import { useState, useEffect } from 'react';
import { encryptText, decryptText } from '@/lib/encryption'; 
import { db } from '@/lib/firebase'; 
import { collection, addDoc, getDocs, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore'; 
import { useRouter } from 'next/navigation';

export default function NewJournal() {
    const router = useRouter(); 

    // 1. New Entry States
    const [heading, setHeading] = useState("");
    const [thought, setThought] = useState("");
    const [mood, setMood] = useState("");
    const [shareWithCounselor, setShareWithCounselor] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // 2. Data & AI States
    const [aiMessage, setAiMessage] = useState("");
    const [pastEntries, setPastEntries] = useState<any[]>([]);

    // 3. EDIT PANEL STATES (The Right Sidebar)
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [editHeading, setEditHeading] = useState("");
    const [editThought, setEditThought] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const moods = [
        { label: "Very Happy", emoji: "😁", color: "bg-green-100 text-green-700", level: 5, graphColor: "bg-green-400" },
        { label: "Good", emoji: "🙂", color: "bg-blue-100 text-blue-700", level: 4, graphColor: "bg-blue-400" },
        { label: "Satisfied", emoji: "😐", color: "bg-yellow-100 text-yellow-700", level: 3, graphColor: "bg-yellow-400" },
        { label: "Low", emoji: "😔", color: "bg-orange-100 text-orange-700", level: 2, graphColor: "bg-orange-400" },
        { label: "Worse", emoji: "😫", color: "bg-red-100 text-red-700", level: 1, graphColor: "bg-red-400" }
    ];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const q = query(collection(db, "journals"), orderBy("timestamp", "desc"), limit(7));
            const querySnapshot = await getDocs(q);
            const entries = querySnapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: decryptText(data.title),
                    content: decryptText(data.content),
                    mood: data.mood,
                    date: data.timestamp?.toDate().toLocaleDateString() || "Just now"
                };
            });
            setPastEntries(entries.reverse()); 
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setAiMessage("");

        try {
            const aiRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: thought })
            });
            const aiData = await aiRes.json();
            
            setAiMessage(aiData.suggestion || "Would you like to express more?");

            await addDoc(collection(db, "journals"), {
                title: encryptText(heading),
                content: encryptText(thought),
                mood: mood,
                riskLevel: aiData.risk_level || "Low",
                sharedWithCounselor: shareWithCounselor,
                timestamp: new Date()
            });

            setHeading(""); setThought(""); setMood(""); setShareWithCounselor(false);
            fetchHistory(); 
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // EDIT PANEL LOGIC
    const openEditPanel = (entry: any) => {
        setSelectedEntry(entry);
        setEditHeading(entry.title);
        setEditThought(entry.content);
    };

    const handleUpdate = async () => {
        if (!selectedEntry) return;
        setIsUpdating(true);
        try {
            const entryRef = doc(db, "journals", selectedEntry.id);
            await updateDoc(entryRef, {
                title: encryptText(editHeading),
                content: encryptText(editThought)
            });
            setSelectedEntry(null);
            fetchHistory();
        } catch (error) {
            console.error("Error updating:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getEmoji = (label: string) => moods.find(m => m.label === label)?.emoji || "📝";
    const getGraphData = (label: string) => moods.find(m => m.label === label) || moods[2];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* 1. NEW ENTRY SECTION */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h1 className="text-2xl font-bold mb-1 text-slate-800">Quick Cloud Journal</h1>
                        <p className="text-sm text-slate-500 mb-6">Encrypted on your device before saving.</p>
                        
                        <input type="text" className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-indigo-400"
                            value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Entry Title..." />

                        {/* ID added for the 'Express More' scroll function */}
                        <textarea id="journal-input" className="w-full border p-4 mb-6 rounded-lg h-32 focus:ring-2 focus:ring-indigo-400 resize-none"
                            value={thought} onChange={(e) => setThought(e.target.value)} placeholder="How are you feeling right now?" />

                        <div className="mb-6 flex flex-wrap gap-2">
                            {moods.map((m) => (
                                <button key={m.label} onClick={() => setMood(m.label)}
                                    className={`px-4 py-2 rounded-full border transition-all ${mood === m.label ? m.color + " border-transparent ring-2 ring-offset-1" : "bg-white"}`}>
                                    {m.emoji} <span className="text-sm font-medium ml-1">{m.label}</span>
                                </button>
                            ))}
                        </div>
                        
                        <button className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg w-full hover:bg-indigo-700 disabled:opacity-50"
                            onClick={handleSave} disabled={isSaving || !heading || !thought || !mood}>
                            {isSaving ? "Analyzing & Saving..." : "Save Entry"}
                        </button>
                    </div>

                    {/* 2. MOOD PATTERN GRAPH (CSS Fixed) */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800">Your mood pattern</h2>
                        <p className="text-sm text-slate-500 mb-8">Cloud-synced check-ins. Decrypted locally.</p>
                        
                        {pastEntries.length > 0 ? (
                            <div className="h-48 flex items-end space-x-6 border-b border-slate-200 pb-2 overflow-x-auto px-4 mt-8">
                                {pastEntries.map((entry, idx) => {
                                    const mData = getGraphData(entry.mood);
                                    const heightPct = Math.max((mData.level / 5) * 100, 15);
                                    return (
                                        <div key={entry.id + idx} className="flex flex-col items-center justify-end h-full flex-shrink-0 group w-12">
                                            <span className="opacity-0 group-hover:opacity-100 text-xs font-bold mb-2 transition-opacity text-slate-600">{mData.label}</span>
                                            <div 
                                                className={`w-8 rounded-t-md transition-all duration-500 shadow-sm ${mData.graphColor}`} 
                                                style={{ height: `${heightPct}%` }}
                                            ></div>
                                            <span className="text-xl mt-2">{mData.emoji}</span>
                                            <span className="text-xs text-slate-400 mt-1">{entry.date.split('/')[0]}/{entry.date.split('/')[1]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6"><p className="text-slate-400">Not enough data for graph.</p></div>
                        )}
                    </div>

                    {/* 3. GROQ AI SUGGESTION BLOCK (Wiring Added) */}
                    {aiMessage && (
                        <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🤖</div>
                            <h3 className="text-indigo-900 font-bold text-lg mb-2">MindEase Assistant</h3>
                            <p className="text-indigo-800 mb-5">{aiMessage}</p>
                            
                            <div className="flex flex-wrap gap-3 relative z-10">
                                {/* Counselor Button */}
<button 
    onClick={() => router.push('/counsellor')}
    className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors">
    Need Counsellor
</button>

{/* AI Chatbot Button */}
<button 
    onClick={() => router.push('/student/support')}
    className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors">
    Talk to AI Chatbot
</button>
                                <button 
                                    onClick={() => {
                                        const input = document.getElementById('journal-input');
                                        input?.scrollIntoView({ behavior: 'smooth' });
                                        input?.focus();
                                    }}
                                    className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors">
                                    Express More
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 4. RECENT ENTRIES LIST */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Entries</h2>
                        <div className="space-y-3">
                            {pastEntries.slice().reverse().map((entry) => (
                                <div key={entry.id} 
                                    onClick={() => openEditPanel(entry)}
                                    className="p-5 border border-slate-100 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer bg-slate-50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            {getEmoji(entry.mood)} {entry.title}
                                        </h3>
                                        <span className="text-xs text-slate-400 font-medium">{entry.date}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-2 line-clamp-2">{entry.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. RIGHT SIDEBAR FOR EDITING */}
            <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-slate-200 transform transition-transform duration-300 ease-in-out z-50 ${selectedEntry ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedEntry && (
                    <div className="h-full flex flex-col p-6">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Edit Journal Entry</h2>
                            <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heading</label>
                                <input type="text" className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-500 text-lg font-semibold"
                                    value={editHeading} onChange={(e) => setEditHeading(e.target.value)} />
                            </div>
                            
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Your Thoughts</label>
                                <textarea className="w-full h-64 border border-slate-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-slate-700"
                                    value={editThought} onChange={(e) => setEditThought(e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <button 
                                onClick={handleUpdate} disabled={isUpdating}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 disabled:opacity-50">
                                {isUpdating ? "Encrypting & Updating..." : "Update Securely"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Backdrop for sidebar */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedEntry(null)}></div>
            )}
        </div>
    );
}