"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/utils";

interface Props {
  endsAt: string;
  closed: boolean;
}

export default function PostTimer({ endsAt, closed }: Props) {
  const [label, setLabel] = useState(formatCountdown(endsAt));

  useEffect(() => {
    if (closed) return;
    const id = setInterval(() => setLabel(formatCountdown(endsAt)), 30_000);
    return () => clearInterval(id);
  }, [endsAt, closed]);

  if (closed) {
    return <span className="text-xs text-gray-400">Encerrado</span>;
  }

  return (
    <span className="text-xs text-amber-600 font-medium">
      ⏱ {label}
    </span>
  );
}
