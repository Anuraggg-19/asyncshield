"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ClientPage() {
  const [clientId, setClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [modelVersion, setModelVersion] = useState<number>(1);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch current model version
  useEffect(() => {
    const fetchModel = async () => {
      try {
        const res = await fetch("http://localhost:8000/get_model");
        if (!res.ok) throw new Error("Failed to fetch model");
        const data = await res.json();
        setModelVersion(data.version);
        setIsConnected(true);
      } catch (err) {
        console.error(err);
        setIsConnected(false);
      }
    };

    fetchModel();
    const interval = setInterval(fetchModel, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate random client ID
  const generateClientId = () => {
    const id = `client_${Math.random().toString(36).substring(2, 9)}`;
    setClientId(id);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResponse(null);
    }
  };

  // Download current model
  const handleDownloadModel = async () => {
    try {
      const res = await fetch("http://localhost:8000/get_model");
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `model_v${data.version}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download model:", err);
    }
  };

  // Download architecture
  const handleDownloadArchitecture = async () => {
    try {
      const res = await fetch("http://localhost:8000/download_architecture");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "models.py";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download architecture:", err);
    }
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !file) {
      alert("Please provide a client ID and select a file");
      return;
    }

    setIsUploading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);
      formData.append("client_version", modelVersion.toString());

      const res = await fetch("http://localhost:8000/submit_update_file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Upload failed:", err);
      setResponse({ status: "error", message: "Upload failed. Make sure the server is running." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            AsyncShield Client
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit model updates and earn bounties
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Server Status */}
          <div className="flex items-center gap-2 text-sm bg-card px-3 py-1.5 rounded-full border border-border">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={isConnected ? "text-muted-foreground" : "text-red-400"}>
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>

          {/* Current Version */}
          <div className="bg-accent px-4 py-2 rounded-md font-mono text-sm border border-border shadow-sm">
            Model: <span className="text-primary font-bold ml-1">v{modelVersion}</span>
          </div>

          {/* Dashboard Link */}
          <Link 
            href="/" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Submit Update */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Submit Update
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Client ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter or generate client ID"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateClientId}
                    className="px-4 py-2 bg-accent border border-border rounded-md text-sm hover:bg-accent/80 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Model File (.pth)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pth"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 text-sm"
                  />
                </div>
                {file && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Version Info */}
              <div className="bg-accent/50 border border-border rounded-md p-3">
                <p className="text-sm text-muted-foreground">
                  Submitting against version: <span className="font-mono font-bold text-foreground">v{modelVersion}</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !clientId || !file}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? "Uploading..." : "Submit Update"}
              </button>
            </form>

            {/* Response */}
            {response && (
              <div className={`mt-4 p-4 rounded-md border ${
                response.status === "success" 
                  ? "bg-green-900/20 border-green-900/50" 
                  : "bg-red-900/20 border-red-900/50"
              }`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${
                      response.status === "success" ? "text-green-400" : "text-red-400"
                    }`}>
                      {response.status === "success" ? "Update Accepted!" : "Update Rejected"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{response.message}</p>
                    {response.bounty_earned && (
                      <p className="text-yellow-400 font-bold mt-2">
                        Bounty Earned: {response.bounty_earned} tokens
                      </p>
                    )}
                    {response.new_version && (
                      <p className="text-primary font-mono text-sm mt-1">
                        New Version: v{response.new_version}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Resources */}
          <div className="space-y-6">
            {/* Model Info */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Model Resources
              </h2>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadModel}
                  className="w-full px-4 py-3 bg-accent border border-border rounded-md text-sm font-medium hover:bg-accent/80 transition-colors text-left flex items-center justify-between"
                >
                  <span>Download Current Model</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                <button
                  onClick={handleDownloadArchitecture}
                  className="w-full px-4 py-3 bg-accent border border-border rounded-md text-sm font-medium hover:bg-accent/80 transition-colors text-left flex items-center justify-between"
                >
                  <span>Download Architecture (models.py)</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>Download the current model and architecture</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Train your model locally with your data</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>Upload your trained model (.pth file)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                  <span>Server validates quality and earns you bounties</span>
                </li>
              </ol>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border rounded-lg p-6 shadow-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Global State</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Model Version</span>
                  <span className="font-mono font-bold text-primary">v{modelVersion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Server Status</span>
                  <span className={`font-semibold ${isConnected ? "text-green-500" : "text-red-500"}`}>
                    {isConnected ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
