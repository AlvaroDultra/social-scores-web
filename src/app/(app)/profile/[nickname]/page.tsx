"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsGrid from "@/components/profile/StatsGrid";
import ScoreHistory from "@/components/profile/ScoreHistory";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile, HistorySummary } from "@/types";

export default function ProfilePage() {
  const params = useParams();
  const nickname = params.nickname as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.user);
  const isOwner = currentUser?.nickname === nickname;

  useEffect(() => {
    Promise.all([
      api.get<UserProfile>(`/api/users/${nickname}`),
      api.get<HistorySummary>(`/api/users/${nickname}/history/summary`),
    ])
      .then(([{ data: prof }, { data: sum }]) => {
        setProfile(prof);
        setSummary(sum);
      })
      .catch(() => toast.error("Usuário não encontrado"))
      .finally(() => setLoading(false));
  }, [nickname]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Carregando perfil...</div>;
  }

  if (!profile) {
    return <div className="text-center py-16 text-gray-500">Usuário não encontrado.</div>;
  }

  const stats = [
    { label: "Score Atual", value: profile.scoreBalance },
    { label: "Melhor Mês", value: profile.bestOfMonth },
    { label: "Melhor Dia", value: profile.bestOfDay },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        onAvatarUpdated={(url) => setProfile((p) => p ? { ...p, avatarUrl: url } : p)}
      />

      <StatsGrid stats={stats} />

      {summary && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Resumo de pontuação
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-lg font-bold text-green-600">+{summary.totalGains}</p>
              <p className="text-xs text-gray-500 mt-0.5">Ganhos totais</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-lg font-bold text-red-500">{summary.totalLosses}</p>
              <p className="text-xs text-gray-500 mt-0.5">Perdas totais</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-lg font-bold text-indigo-600">{summary.recentInteractions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Interações (30d)</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Histórico de score
        </h2>
        <ScoreHistory nickname={nickname} />
      </div>
    </div>
  );
}
