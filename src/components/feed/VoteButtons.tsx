"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Props {
  postId: string;
  closed: boolean;
}

export default function VoteButtons({ postId, closed }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [voted, setVoted] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  async function vote(value: 1 | -1) {
    if (!isAuthenticated) {
      toast.error("Faça login para votar");
      return;
    }
    if (closed) {
      toast.error("Votação encerrada");
      return;
    }
    if (voted !== null) {
      toast.error("Você já votou neste post");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/posts/${postId}/vote`, { value });
      setVoted(value);
      toast.success(value === 1 ? "+Social Credit!" : "-Social Credit!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Erro ao votar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => vote(1)}
        disabled={loading || closed || voted !== null}
        title="+Social Credit"
        className={`rounded-xl p-1 transition border-2
          ${voted === 1
            ? "border-green-400 bg-green-50 scale-110"
            : "border-transparent hover:border-green-300 hover:bg-green-50 hover:scale-105"}
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Image
          src="/vote-up.png"
          alt="+Social Credit"
          width={52}
          height={52}
          className="object-contain"
        />
      </button>

      <button
        onClick={() => vote(-1)}
        disabled={loading || closed || voted !== null}
        title="-Social Credit"
        className={`rounded-xl p-1 transition border-2
          ${voted === -1
            ? "border-red-400 bg-red-50 scale-110"
            : "border-transparent hover:border-red-300 hover:bg-red-50 hover:scale-105"}
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Image
          src="/vote-down.png"
          alt="-Social Credit"
          width={52}
          height={52}
          className="object-contain"
        />
      </button>
    </div>
  );
}
