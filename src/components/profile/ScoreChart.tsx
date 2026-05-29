"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import api from "@/lib/api";

interface ChartPoint {
  date: string;
  score: number;
}

interface Props {
  nickname: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
    " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { value: number; payload: { date: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const date = payload[0].payload.date;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="text-gray-400 text-xs mb-0.5">{date}</p>
      <p className={`font-bold ${score >= 0 ? "text-blue-600" : "text-red-500"}`}>
        {score >= 0 ? `+${score}` : score} pts
      </p>
    </div>
  );
}

export default function ScoreChart({ nickname }: Props) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ChartPoint[]>(`/api/users/${nickname}/history/chart`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [nickname]);

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Carregando gráfico...</div>;
  }

  if (data.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        Ainda sem variação de score para exibir.
      </div>
    );
  }

  const formatted = data.map((p, i) => ({
    index: i,
    date: formatDate(p.date),
    score: p.score,
  }));

  const scores = formatted.map((p) => p.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const allPositive = min >= 0;
  const allNegative = max <= 0;
  const strokeColor = allNegative ? "#ef4444" : "#3b82f6";
  const gradientColor = allNegative ? "#ef4444" : "#3b82f6";

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

          <XAxis
            dataKey="index"
            type="number"
            domain={[0, formatted.length - 1]}
            tickFormatter={(i) => formatted[i]?.date ?? ""}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {!allPositive && !allNegative && (
            <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
          )}

          <Area
            type="monotone"
            dataKey="score"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={formatted.length <= 10 ? { r: 3, fill: strokeColor, strokeWidth: 0 } : false}
            activeDot={{ r: 5, fill: strokeColor, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
