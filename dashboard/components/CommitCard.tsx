// dashboard/components/CommitCard.tsx

export interface CommitProps {
  client: string;
  status: string;
  reason?: string;
  version_bump?: string;
  bounty: number;
}

export default function CommitCard({ commit }: { commit: CommitProps }) {
  const isRejected = commit.status.includes("Rejected");

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isRejected
          ? "bg-red-950/20 border-red-900/50 hover:bg-red-950/40"
          : "bg-gray-900 border-gray-800 hover:bg-gray-800/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {/* User Avatar Placeholder & ID */}
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-md">
              {commit.client.charAt(0).toUpperCase()}
            </div>
            <span className="font-mono text-blue-300 text-sm">{commit.client}</span>
            
            {/* Status Badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isRejected ? "bg-red-900/50 text-red-300 border border-red-800" : "bg-green-900/50 text-green-300 border border-green-800"
              }`}
            >
              {commit.status}
            </span>
          </div>
          
          {/* Commit Message / Reason */}
          <p className="text-gray-400 text-sm mt-3 ml-9">
            {commit.reason ? commit.reason : `Successfully merged: ${commit.version_bump}`}
          </p>
        </div>

        {/* Bounty Reward */}
        {commit.bounty > 0 && (
          <div className="text-right text-yellow-400 font-bold text-sm bg-yellow-900/20 px-3 py-1 rounded-md border border-yellow-700/30">
            +{commit.bounty}
          </div>
        )}
      </div>
    </div>
  );
}
