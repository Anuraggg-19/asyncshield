"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, Activity, TrendingUp, CheckCircle2, XCircle, Award } from "lucide-react";

interface CommitData {
  client: string;
  status: "Merged ✅" | "Rejected ❌";
  bounty: number;
  reason?: string;
  accuracy_change?: string;
  timestamp?: string;
}

interface Contributor {
  client: string;
  bounty: number;
  rank?: number;
}

interface ConvergencePoint {
  version: string;
  accuracy: number;
}

interface DashboardData {
  global_version: number;
  system_status: "online" | "offline";
  convergence_data: ConvergencePoint[];
  commits: CommitData[];
  leaderboard: Contributor[];
}

// Mock data for initial render
const mockData: DashboardData = {
  global_version: 12,
  system_status: "online",
  convergence_data: [
    { version: "v1", accuracy: 62.5 },
    { version: "v2", accuracy: 68.3 },
    { version: "v3", accuracy: 71.8 },
    { version: "v4", accuracy: 75.2 },
    { version: "v5", accuracy: 78.9 },
    { version: "v6", accuracy: 82.1 },
    { version: "v7", accuracy: 84.5 },
    { version: "v8", accuracy: 86.2 },
    { version: "v9", accuracy: 88.7 },
    { version: "v10", accuracy: 90.3 },
    { version: "v11", accuracy: 91.8 },
    { version: "v12", accuracy: 93.2 },
  ],
  commits: [
    {
      client: "0xa3f9b2...d84e",
      status: "Merged ✅",
      bounty: 50,
      accuracy_change: "+0.45%",
      timestamp: "2 min ago",
    },
    {
      client: "0x7c21d8...4fa2",
      status: "Merged ✅",
      bounty: 50,
      accuracy_change: "+0.38%",
      timestamp: "5 min ago",
    },
    {
      client: "0x4b8e12...9c3d",
      status: "Rejected ❌",
      bounty: 0,
      reason: "Zero-Trust Failure: Accuracy dropped by 2.1%",
      timestamp: "7 min ago",
    },
    {
      client: "0x9d5a76...2eb1",
      status: "Merged ✅",
      bounty: 50,
      accuracy_change: "+0.52%",
      timestamp: "12 min ago",
    },
    {
      client: "0x1f3c8e...7a9b",
      status: "Rejected ❌",
      bounty: 0,
      reason: "Validation Failed: Model divergence detected",
      timestamp: "15 min ago",
    },
  ],
  leaderboard: [
    { client: "0xa3f9b2...d84e", bounty: 450 },
    { client: "0x9d5a76...2eb1", bounty: 380 },
    { client: "0x7c21d8...4fa2", bounty: 320 },
    { client: "0x2e4f91...5bc3", bounty: 280 },
    { client: "0x6a8d2c...1ef7", bounty: 250 },
  ],
};

export default function AsyncShieldDashboard() {
  const [data, setData] = useState<DashboardData>(mockData);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/dashboard_data");
        if (!res.ok) throw new Error("Server response not OK");
        const json = await res.json();
        setData(json);
        setIsConnected(true);
      } catch (err) {
        // Use mock data when backend is unavailable
        setIsConnected(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary" strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              AsyncShield Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Decentralized Asynchronous Federated Learning Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* System Health */}
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-success animate-pulse shadow-lg shadow-success/50" : "bg-destructive"
              }`}
            />
            <span className="text-sm font-medium text-card-foreground">
              {isConnected ? "System Online" : "Server Offline"}
            </span>
          </div>

          {/* Global Model Version */}
          <div className="px-4 py-2 bg-secondary border border-primary/30 rounded-lg font-mono text-sm shadow-lg shadow-primary/10">
            <span className="text-muted-foreground">Global Model:</span>{" "}
            <span className="text-primary font-bold ml-1">v{data.global_version}</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Convergence Chart - Full Width on Top */}
        <div className="lg:col-span-12 bg-card border border-border rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-card-foreground">
              Model Convergence & Performance
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.convergence_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="version"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                domain={[0, 100]}
                label={{
                  value: "Accuracy (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--card-foreground))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Commits Feed */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Live Update Commits</h2>
          </div>

          <div className="space-y-3">
            {data.commits.map((commit, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
                  commit.status === "Rejected ❌"
                    ? "bg-destructive/5 border-destructive/40 hover:border-destructive/60 hover:shadow-destructive/20"
                    : "bg-success/5 border-success/40 hover:border-success/60 hover:shadow-success/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          commit.status === "Rejected ❌"
                            ? "bg-gradient-to-br from-destructive to-destructive/70"
                            : "bg-gradient-to-br from-primary to-accent"
                        }`}
                      >
                        {commit.client.slice(2, 4).toUpperCase()}
                      </div>

                      {/* Client ID */}
                      <span className="font-mono text-sm text-primary">{commit.client}</span>

                      {/* Status Badge */}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          commit.status === "Rejected ❌"
                            ? "bg-destructive/20 text-destructive border border-destructive/50"
                            : "bg-success/20 text-success border border-success/50"
                        }`}
                      >
                        {commit.status}
                      </span>

                      {/* Timestamp */}
                      {commit.timestamp && (
                        <span className="text-xs text-muted-foreground ml-auto">{commit.timestamp}</span>
                      )}
                    </div>

                    {/* Reason or Accuracy Change */}
                    <div className="ml-11 flex items-center gap-2">
                      {commit.status === "Rejected ❌" ? (
                        <>
                          <XCircle className="w-4 h-4 text-destructive" />
                          <p className="text-sm text-muted-foreground">{commit.reason}</p>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <p className="text-sm text-muted-foreground">
                            Successfully merged - Accuracy improved by{" "}
                            <span className="text-success font-semibold">{commit.accuracy_change}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bounty */}
                  {commit.bounty > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/20 border border-warning/50 rounded-lg">
                      <span className="text-sm font-bold text-warning">+{commit.bounty}</span>
                      <Award className="w-4 h-4 text-warning" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg sticky top-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <Award className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-semibold text-card-foreground">Top Contributors</h2>
            </div>

            <div className="space-y-3">
              {data.leaderboard.map((contributor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full font-mono text-xs font-bold ${
                        idx === 0
                          ? "bg-warning/20 text-warning border border-warning/50"
                          : idx === 1
                          ? "bg-muted/50 text-muted-foreground border border-muted"
                          : idx === 2
                          ? "bg-primary/20 text-primary border border-primary/50"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-sm text-foreground">{contributor.client}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-warning">{contributor.bounty}</span>
                    <Award className="w-4 h-4 text-warning" />
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
