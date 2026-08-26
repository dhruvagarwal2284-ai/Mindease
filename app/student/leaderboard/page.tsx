"use client";
import { Badge, SectionTitle } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function LeaderboardPage() {
  const { state } = useStore();
  const myHandle = state.identity?.handle ?? "MindMate #A7F29";

  return (
    <div className="space-y-6 max-w-2xl animate-fade-up">
      <SectionTitle 
        title="Campus Leaderboard" 
        subtitle="Recognizing the top peer supporters making a difference." 
      />

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-orange-900 mb-4 border-b border-orange-200 pb-3 text-lg">
          🏆 Top Supporters This Week
        </h3>
        <ul className="space-y-4">
          <li className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-orange-100">
            <span className="font-bold text-orange-800 text-lg">🥇 MindMate #88B2</span> 
            <Badge tone="amber">42 points</Badge>
          </li>
          <li className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-orange-100">
            <span className="font-bold text-navy-700 text-lg">🥈 MindMate #11A9</span> 
            <Badge tone="amber">38 points</Badge>
          </li>
          <li className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-orange-100">
            <span className="font-bold text-navy-700 text-lg">🥉 MindMate #4X92</span> 
            <Badge tone="amber">25 points</Badge>
          </li>
          <li className="flex justify-between items-center p-3 mt-4 bg-teal-50 rounded-xl border border-teal-200">
            <span className="font-bold text-teal-900 text-lg">⭐ You ({myHandle})</span> 
            <Badge tone="mint">15 points</Badge>
          </li>
        </ul>
      </div>
      <p className="text-sm text-navy-600 text-center">
        Earn points by accepting chat requests and actively listening to peers.
      </p>
    </div>
  );
}