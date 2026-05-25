"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import ScoreHistory from "@/components/profile/ScoreHistory";
import type { HistorySummary } from "@/types";

export default function HistoryPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [summary, setSummary] = useState<HistorySummary | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    api.get<HistorySummary>("/api/users/me/history/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => toast.error("Erro ao carregar resumo"));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-xl font-bold">Meu Histórico de Social Scores</h1>

      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">+{summary.totalGains}</div>
            <div className="text-xs text-green-700 mt-1">Total de ganhos</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.totalLosses}</div>
            <div className="text-xs text-red-700 mt-1">Total de perdas</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-700">{summary.currentBalance}</div>
            <div className="text-xs text-indigo-700 mt-1">Saldo atual</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{summary.recentInteractions}</div>
            <div className="text-xs text-gray-500 mt-1">Interações (30 dias)</div>
          </div>
        </div>
      )}

      <ScoreHistory />
    </div>
  );
}
