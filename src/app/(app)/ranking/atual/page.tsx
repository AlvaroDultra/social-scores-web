"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import RankingTable from "@/components/ranking/RankingTable";
import type { RankingEntry } from "@/types";

export default function RankingAtualPage() {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<RankingEntry[]>("/api/ranking/atual")
      .then(({ data }) => setEntries(data))
      .catch(() => toast.error("Erro ao carregar ranking"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-bold mb-4">Ranking Geral</h1>
      <RankingTable entries={entries} loading={loading} />
    </div>
  );
}
