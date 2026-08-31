"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui";

export default function MyAccountsPage() {
  const { state, savedAccounts, setIdentity, toast } = useStore();
  const currentHandle = state.identity?.handle;

  const [showPinModal, setShowPinModal] = useState(false);
  const [targetHandle, setTargetHandle] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  // Filter out the current account from the saved list to show "Other Accounts"
  const otherAccounts = (savedAccounts || []).filter((acc: any) => acc.handle !== currentHandle);

  const initiateSwitch = (handle: string) => {
    setTargetHandle(handle);
    setPinInput("");
    setShowPinModal(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSwitching(true);
    try {
      const userRef = doc(db, "users", targetHandle);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as any;

      if (userSnap.exists() && userData.pin === pinInput) {
        setIdentity({
          handle: targetHandle,
          caseId: userData.caseId || "A71X",
          createdAt: userData.createdAt || new Date().toISOString(),
        });
        toast(`Switched to ${targetHandle}`, "success");
        setShowPinModal(false);
      } else {
        toast("Incorrect PIN", "urgent");
      }
    } catch (err) {
      toast("Error verifying PIN", "warning");
    }
    setIsSwitching(false);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-up">
      <header className="border-b border-navy-100 pb-4">
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">My Accounts</h1>
        <p className="text-sm text-navy-600 mt-1">
          Manage your anonymous pseudonyms on this device. Switch safely between different identities.
        </p>
      </header>

      {/* 🟢 CURRENT ACTIVE ACCOUNT */}
      <section>
        <h2 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Current Active Identity</h2>
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-teal-100" aria-hidden>
              🕶️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-teal-950">{currentHandle || "MindMate Unknown"}</p>
                <Badge tone="mint">Active</Badge>
              </div>
              <p className="text-xs text-teal-700 mt-0.5">This identity is currently in use for all your requests and posts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚪ OTHER SAVED ACCOUNTS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-navy-500 uppercase tracking-wider">Other Saved Accounts</h2>
          <span className="text-xs text-navy-400 bg-navy-50 px-2 py-1 rounded-md">{otherAccounts.length} saved</span>
        </div>
        
        {otherAccounts.length === 0 ? (
          <div className="border border-dashed border-navy-200 rounded-2xl p-8 text-center bg-navy-50/50">
            <span className="text-3xl opacity-50 mb-2 block" aria-hidden>👻</span>
            <p className="text-sm font-medium text-navy-700">No other accounts saved on this device.</p>
            <p className="text-xs text-navy-500 mt-1">You can create multiple identities for different concerns.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {otherAccounts.map((acc: any) => (
              <div key={acc.handle} className="border border-navy-200 bg-white rounded-2xl p-4 flex items-center justify-between hover:border-teal-300 transition-colors shadow-xs group">
                <div>
                  <p className="font-bold text-navy-900">{acc.handle}</p>
                  <p className="text-[10px] text-navy-400 uppercase font-semibold mt-1">PIN Protected 🔒</p>
                </div>
                <button 
                  onClick={() => initiateSwitch(acc.handle)}
                  className="px-4 py-2 bg-navy-50 hover:bg-teal-50 text-navy-700 hover:text-teal-800 text-sm font-bold rounded-xl transition-colors border border-navy-100 group-hover:border-teal-200"
                >
                  Switch
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔵 CREATE NEW ACCOUNT CTA */}
      <section className="pt-4">
        <Link 
          href="/onboarding" 
          className="block w-full border-2 border-dashed border-teal-200 bg-teal-50/30 hover:bg-teal-50 rounded-2xl p-5 text-center transition-colors"
        >
          <span className="text-teal-800 font-bold text-sm flex items-center justify-center gap-2">
            <span className="text-lg">+</span> Create a new anonymous account
          </span>
        </Link>
      </section>

      {/* 🔐 PIN MODAL FOR SWITCHING */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-navy-950">Verify Identity</h3>
              <button onClick={() => setShowPinModal(false)} className="text-navy-400 hover:text-navy-900">✕</button>
            </div>
            
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <p className="text-sm text-navy-600">Enter the 4-digit PIN for <strong className="text-teal-800">{targetHandle}</strong></p>
              
              <input
                type="password" 
                maxLength={4} 
                required 
                autoFocus
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
              />
              
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 px-4 py-2.5 border border-navy-200 rounded-xl hover:bg-navy-50 text-navy-700 font-bold text-sm transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSwitching || pinInput.length !== 4} className="flex-1 px-4 py-2.5 bg-teal-800 text-white rounded-xl hover:bg-teal-900 font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer">
                  {isSwitching ? "Switching..." : "Switch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}