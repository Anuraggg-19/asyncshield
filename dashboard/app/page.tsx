"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Commit {
  client_id: string;
  version: number;
  status: "Merged" | "Rejected";
  reason?: string;
  accuracy_delta?: number;
  bounty?: number;
  timestamp: string;
}

interface Contributor {
  client_id: string;
  bounty: number;
  contributions: number;
}

interface ConvergenceData {
  version: number;
  accuracy: number;
}

interface DashboardData {
  global_version: number;
  leaderboard: Contributor[];
  commits: Commit[];
  convergence: ConvergenceData[];
}

const MOCK_DATA: DashboardData = {
  global_version: 5,
  leaderboard: [
    { client_id: "client_alpha", bounty: 450, contributions: 12 },
    { client_id: "client_beta", bounty: 380, contributions: 9 },
    { client_id: "client_gamma", bounty: 310, contributions: 8 },
    { client_id: "client_delta", bounty: 275, contributions: 7 },
    { client_id: "client_epsilon", bounty: 190, contributions: 5 },
  ],
  commits: [
    {
      client_id: "client_alpha",
      version: 5,
      status: "Merged",
      accuracy_delta: 0.032,
      bounty: 50,
      timestamp: "2 min ago",
    },
    {
      client_id: "client_gamma",
      version: 4,
      status: "Rejected",
      reason: "Failed validation: norm exceeded threshold",
      timestamp: "5 min ago",
    },
    {
      client_id: "client_beta",
      version: 4,
      status: "Merged",
      accuracy_delta: 0.028,
      bounty: 45,
      timestamp: "8 min ago",
    },
    {
      client_id: "client_delta",
      version: 3,
      status: "Merged",
      accuracy_delta: 0.019,
      bounty: 35,
      timestamp: "12 min ago",
    },
    {
      client_id: "client_epsilon",
      version: 3,
      status: "Rejected",
      reason: "Failed privacy check: DP budget exhausted",
      timestamp: "15 min ago",
    },
  ],
  convergence: [
    { version: 1, accuracy: 0.7234 },
    { version: 2, accuracy: 0.7812 },
    { version: 3, accuracy: 0.8156 },
    { version: 4, accuracy: 0.8421 },
    { version: 5, accuracy: 0.8673 },
  ],
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost:8000/dashboard_data");
        if (!res.ok) throw new Error("Server response not OK");
        const json = await res.json();
        setData(json);
        setIsConnected(true);
      } catch {
        setIsConnected(false);
        setData(MOCK_DATA);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-foreground">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            AsyncShield Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Decentralized Asynchronous Federated Learning Network
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-full border border-border">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-destructive"
              }`}
            />
            <span className={isConnected ? "text-foreground" : "text-destructive"}>
              {isConnected ? "System Online" : "Server Offline"}
            </span>
          </div>

          <div className="bg-primary/10 px-4 py-2 rounded-md font-mono text-sm border border-primary/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            Global Model: <span className="text-primary font-bold ml-1">v{data.global_version}</span>
          </div>
        </div>
      </header>

      {/* Convergence Chart */}
      <div className="mb-8 bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Model Convergence</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.convergence}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 240)" />
            <XAxis
              dataKey="version"
              label={{ value: "Global Model Version", position: "insideBottom", offset: -5 }}
              stroke="oklch(0.6 0.02 240)"
            />
            <YAxis
              label={{ value: "Accuracy", angle: -90, position: "insideLeft" }}
              domain={[0.7, 0.9]}
              stroke="oklch(0.6 0.02 240)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.2 0.02 240)",
                border: "1px solid oklch(0.3 0.02 240)",
                borderRadius: "0.5rem",
                color: "oklch(0.95 0.01 240)",
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="oklch(0.7 0.19 195)"
              strokeWidth={3}
              dot={{ fill: "oklch(0.7 0.19 195)", r: 5 }}
              activeDot={{ r: 7, fill: "oklch(0.7 0.19 195)", stroke: "oklch(0.95 0.01 240)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Updates Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2 flex items-center gap-2 text-foreground">
            <svg viewBox="0 0 16 16" className="w-5 h-5 fill-muted-foreground">
              <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5h-3.32Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
            </svg>
            Live Update Commits
          </h2>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
            {data.commits.map((commit, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg backdrop-blur-sm ${
                  commit.status === "Merged"
                    ? "bg-success/10 border border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                    : "bg-destructive/10 border border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-primary">
                      {commit.client_id}
                    </code>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        commit.status === "Merged"
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {commit.status === "Merged" ? "Merged ✓" : "Rejected ✗"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{commit.timestamp}</span>
                </div>

                {commit.status === "Merged" ? (
                  <div className="text-sm text-foreground">
                    <span className="text-success font-semibold">
                      +{(commit.accuracy_delta! * 100).toFixed(2)}%
                    </span>{" "}
                    accuracy improvement
                    <span className="ml-3 text-primary font-mono">💰 {commit.bounty} bounty</span>
                  </div>
                ) : (
                  <div className="text-sm text-destructive">{commit.reason}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-primary" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Top Contributors
            </h2>

            <div className="space-y-3">
              {data.leaderboard.map((contributor, idx) => (
                <div
                  key={contributor.client_id}
                  className="flex items-center justify-between p-3 bg-background/60 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                        idx === 0
                          ? "bg-yellow-500/20 text-yellow-500"
                          : idx === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : idx === 2
                          ? "bg-orange-700/20 text-orange-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <code className="text-sm font-mono text-foreground">{contributor.client_id}</code>
                      <div className="text-xs text-muted-foreground">{contributor.contributions} contributions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-primary">{contributor.bounty}</div>
                    <div className="text-xs text-muted-foreground">bounty</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
