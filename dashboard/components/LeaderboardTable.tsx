// dashboard/components/LeaderboardTable.tsx

export interface Contributor {
  client: string;
  bounty: number;
}

export default function LeaderboardTable({ data }: { data: Contributor[] }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg h-fit sticky top-10">
      <h2 className="text-xl font-semibold border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
        Top Contributors
      </h2>
      <div className="space-y-3">
        {data.length === 0 && (
          <p className="text-gray-500 italic text-sm text-center py-4">No bounties awarded yet.</p>
        )}

        {data
          .sort((a, b) => b.bounty - a.bounty)
          .map((user, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-gray-950 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-mono text-sm">#{idx + 1}</span>
                <span className="font-mono text-gray-300 text-sm">{user.client}</span>
              </div>
              <span className="font-bold text-yellow-500">{user.bounty}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
