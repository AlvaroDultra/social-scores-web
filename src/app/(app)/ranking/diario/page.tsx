"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import api from "@/lib/api";
import RankingTable from "@/components/ranking/RankingTable";
import type { RankingEntry } from "@/types";

export default function RankingDiarioPage() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<RankingEntry[]>(`/api/ranking/diario?date=${date}`)
      .then(({ data }) => setEntries(data))
      .catch(() => toast.error("Erro ao carregar ranking"))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-bold mb-4">Ranking Diário</h1>
      <div className="mb-6">
        <input
          type="date"
          value={date}
          max={dayjs().format("YYYY-MM-DD")}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <RankingTable entries={entries} loading={loading} />
    </div>
  );
}
