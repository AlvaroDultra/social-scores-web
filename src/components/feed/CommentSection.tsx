"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { Comment } from "@/types";

interface Props {
  postId: string;
}

export default function CommentSection({ postId }: Props) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const PREVIEW_COUNT = 3;
  const hasMore = comments.length > PREVIEW_COUNT;
  const visibleComments = expanded || !hasMore ? comments : comments.slice(0, PREVIEW_COUNT);

  useEffect(() => {
    api.get<Comment[]>(`/api/posts/${postId}/comments`)
      .then(({ data }) => setComments(data))
      .catch(() => toast.error("Erro ao carregar comentários"))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<Comment>(`/api/posts/${postId}/comments`, { content });
      setComments((prev) => [...prev, data]);
      setContent("");
    } catch {
      toast.error("Erro ao comentar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error("Erro ao deletar comentário");
    }
  }

  async function handleReact(commentId: string, value: 1 | -1) {
    if (!isAuthenticated) { toast.error("Faça login para reagir"); return; }
    try {
      const { data } = await api.post<Comment>(`/api/comments/${commentId}/react`, { value });
      setComments((prev) => prev.map((c) => c.id === commentId ? data : c));
    } catch {
      toast.error("Erro ao reagir");
    }
  }

  function getAvatarUrl(c: Comment) {
    if (!c.authorAvatarUrl) return null;
    return c.authorAvatarUrl.startsWith("http")
      ? c.authorAvatarUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${c.authorAvatarUrl}`;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {/* Lista de comentários */}
      {loading ? (
        <p className="text-xs text-gray-400 py-2">Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">Nenhum comentário ainda. Seja o primeiro!</p>
      ) : (
        <>
          <ul className="space-y-3 mb-3">
            {visibleComments.map((c) => {
              const avatarUrl = getAvatarUrl(c);
              const isOwn = user?.id === c.authorId;
              return (
                <li key={c.id} className="flex items-start gap-2">
                  {/* Avatar */}
                  <Link href={`/profile/${c.authorNickname}`} className="shrink-0">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 overflow-hidden">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={c.authorNickname} width={28} height={28} className="object-cover w-full h-full" />
                      ) : (
                        c.authorNickname[0].toUpperCase()
                      )}
                    </div>
                  </Link>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <Link href={`/profile/${c.authorNickname}`} className="text-xs font-semibold text-blue-700 hover:underline">
                        @{c.authorNickname}
                      </Link>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-gray-400">{formatRelative(c.createdAt)}</span>
                        {isOwn && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-[10px] text-gray-300 hover:text-red-400 transition"
                            title="Deletar comentário"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 break-words mb-2">{c.content}</p>

                    {/* Like / Dislike */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReact(c.id, 1)}
                        className={`flex items-center gap-1 text-xs transition ${
                          c.myReaction === 1
                            ? "text-blue-600 font-semibold"
                            : "text-gray-400 hover:text-blue-500"
                        }`}
                      >
                        👍 {c.likes > 0 && <span>{c.likes}</span>}
                      </button>
                      <button
                        onClick={() => handleReact(c.id, -1)}
                        className={`flex items-center gap-1 text-xs transition ${
                          c.myReaction === -1
                            ? "text-red-500 font-semibold"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      >
                        👎 {c.dislikes > 0 && <span>{c.dislikes}</span>}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-blue-600 hover:underline mb-3 font-medium"
            >
              {expanded
                ? "Ocultar comentários"
                : `Ver mais ${comments.length - PREVIEW_COUNT} comentário${comments.length - PREVIEW_COUNT > 1 ? "s" : ""}`}
            </button>
          )}
        </>
      )}

      {/* Formulário de novo comentário */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl.startsWith("http") ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl}`}
                alt={user.nickname}
                width={28}
                height={28}
                className="object-cover w-full h-full"
              />
            ) : (
              user?.nickname?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); } }}
              rows={1}
              maxLength={500}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-30 transition shrink-0 text-sm font-semibold"
            >
              {submitting ? "..." : "Enviar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
