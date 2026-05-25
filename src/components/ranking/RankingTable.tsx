import Link from "next/link";
import type { RankingEntry } from "@/types";

interface Props {
  entries: RankingEntry[];
  loading: boolean;
}

export default function RankingTable({ entries, loading }: Props) {
  if (loading) {
    return <div className="text-center py-16 text-gray-400">Carregando ranking...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center py-16 text-gray-400">Nenhum usuário no ranking ainda.</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Usuário</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry, idx) => (
            <tr key={entry.id} className="hover:bg-gray-50 transition">
              <td className="py-3 px-4">
                <span className={`font-bold text-sm ${
                  idx === 0 ? "text-yellow-500" :
                  idx === 1 ? "text-gray-400" :
                  idx === 2 ? "text-amber-600" : "text-gray-500"
                }`}>
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/profile/${entry.nickname}`}
                  className="font-medium text-indigo-700 hover:underline"
                >
                  @{entry.nickname}
                </Link>
              </td>
              <td className="py-3 px-4 text-right">
                <span className={`font-bold ${entry.score >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {entry.score >= 0 ? `+${entry.score}` : entry.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
