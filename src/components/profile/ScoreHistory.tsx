"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatDate, scoreColor, scorePrefix } from "@/lib/utils";
import type { HistoryEntry, Page } from "@/types";

interface Props {
  compact?: boolean;
  nickname?: string; // if provided, shows public history for that user; otherwise uses /me
}

export default function ScoreHistory({ compact = false, nickname }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const basePath = nickname ? `/api/users/${nickname}/history` : `/api/users/me/history`;

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const size = compact ? 5 : 30;
      const { data } = await api.get<Page<HistoryEntry>>(
        `${basePath}?page=${p}&size=${size}`
      );
      setEntries((prev) => p === 0 ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
    } catch {
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  }, [compact, basePath]);

  useEffect(() => {
    setEntries([]);
    setPageNum(0);
    load(0);
  }, [load]);

  if (loading && entries.length === 0) {
    return <div className="text-gray-400 py-4 text-sm">Carregando histórico...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-gray-400 py-4 text-sm">Nenhuma alteração de score ainda.</div>;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4"
        >
          <div className={`text-xl font-bold min-w-[60px] text-right ${scoreColor(entry.delta)}`}>
            {scorePrefix(entry.delta)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {entry.origin === "OWN_POST" ? "Post próprio" : "Post de terceiro"}
              </span>
              <span className="text-xs text-gray-400">{formatDate(entry.recordedAt)}</span>
            </div>
            {entry.post && (
              <p className="text-sm text-gray-700 truncate">
                {entry.post.contentPreview}
              </p>
            )}
            <div className="text-xs text-gray-400 mt-1">
              Saldo após: <span className="font-medium text-gray-600">{entry.balanceAfter} pts</span>
            </div>
          </div>
        </div>
      ))}

      {!compact && hasMore && (
        <button
          onClick={() => {
            const next = pageNum + 1;
            setPageNum(next);
            load(next);
          }}
          className="w-full py-2 border border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
        >
          Carregar mais
        </button>
      )}
    </div>
  );
}
