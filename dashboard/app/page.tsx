// dashboard/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import CommitCard, { CommitProps } from "../components/CommitCard";
import LeaderboardTable, { Contributor } from "../components/LeaderboardTable";

interface DashboardData {
  global_version: number;
  leaderboard: Contributor[];
  commits: CommitProps[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    global_version: 1,
    leaderboard: [],
    commits: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  // Poll FastAPI backend every 2 seconds
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost:8000/dashboard_data");
        if (!res.ok) throw new Error("Server response not OK");
        const json = await res.json();
        setData(json);
        setIsConnected(true);
      } catch (err) {
        setIsConnected(false);
      }
    };

    fetchDashboardData(); // Initial fetch
    const interval = setInterval(fetchDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 md:p-12 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            AsyncShield Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Decentralized, Asynchronous Federated Learning Network
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Server Status Indicator */}
          <div className="flex items-center gap-2 text-sm bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={isConnected ? "text-gray-300" : "text-red-400"}>
              {isConnected ? "System Online" : "Server Offline"}
            </span>
          </div>

          {/* Version Tracker */}
          <div className="bg-gray-800 px-4 py-2 rounded-md font-mono text-sm border border-gray-700 shadow-sm">
            Global Model: <span className="text-green-400 font-bold ml-1">v{data.global_version}</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: COMMIT HISTORY (GitHub Style Feed) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold border-b border-gray-800 pb-2 flex items-center gap-2">
            <svg viewBox="0 0 16 16" className="w-5 h-5 fill-gray-400" aria-hidden="true"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5h-3.32Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path></svg>
            Live Update Commits
          </h2>
          
          <div className="flex flex-col gap-3">
            {data.commits.length === 0 && (
              <div className="border border-dashed border-gray-800 rounded-lg p-10 text-center text-gray-500">
                Waiting for client nodes to submit updates...
              </div>
            )}
            
            {data.commits.map((commit, idx) => (
              <CommitCard key={idx} commit={commit} />
            ))}
          </div>
        </div>

        {/* Right Column: BOUNTY LEADERBOARD */}
        <div>
          <LeaderboardTable data={data.leaderboard} />
        </div>
        
      </div>
    </div>
  );
}