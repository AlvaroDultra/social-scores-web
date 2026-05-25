"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import api from "@/lib/api";
import RankingTable from "@/components/ranking/RankingTable";
import type { RankingEntry } from "@/types";

export default function RankingMensalPage() {
  const now = dayjs();
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<RankingEntry[]>(`/api/ranking/mensal?year=${year}&month=${month}`)
      .then(({ data }) => setEntries(data))
      .catch(() => toast.error("Erro ao carregar ranking"))
      .finally(() => setLoading(false));
  }, [year, month]);

  const months = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-bold mb-4">Ranking Mensal</h1>
      <div className="flex gap-3 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {months.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          min={2024}
          max={now.year()}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <RankingTable entries={entries} loading={loading} />
    </div>
  );
}
