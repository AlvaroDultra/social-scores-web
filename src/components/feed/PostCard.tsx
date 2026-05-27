"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import CommentSection from "./CommentSection";
import ImageLightbox from "@/components/ui/ImageLightbox";
import type { Post } from "@/types";
import { formatRelative } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import PostTimer from "./PostTimer";
import VoteButtons from "./VoteButtons";

interface Props {
  post: Post;
  onDeleted?: (id: string) => void;
}

export default function PostCard({ post, onDeleted }: Props) {
  const user = useAuthStore((s) => s.user);
  const isAuthor = user?.id === post.authorId;
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${post.id}`);
      toast.success("Post deletado");
      onDeleted?.(post.id);
    } catch {
      toast.error("Erro ao deletar post");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href={`/profile/${post.authorNickname}`} className="font-semibold text-blue-700 hover:underline text-sm">
            @{post.authorNickname}
          </Link>
          {post.targetNickname && (
            <>
              <span className="text-gray-400 text-xs">sobre</span>
              <Link href={`/profile/${post.targetNickname}`} className="font-semibold text-pink-600 hover:underline text-sm">
                @{post.targetNickname}
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{formatRelative(post.createdAt)}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
              toast.success("Link copiado!");
            }}
            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition"
            title="Compartilhar"
          >
            🔗
          </button>
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              onBlur={() => setConfirmDelete(false)}
              className={`text-xs px-2 py-1 rounded-lg border transition font-medium ${
                confirmDelete
                  ? "border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                  : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
              } disabled:opacity-40`}
            >
              {deleting ? "..." : confirmDelete ? "Confirmar?" : "🗑"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.content}</p>

      {/* Image */}
      {post.imageUrl && (
        <>
          <div
            className="relative w-full rounded-xl overflow-hidden mb-3 bg-gray-100 cursor-zoom-in select-none"
            onClick={() => setLightboxOpen(true)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={post.imageUrl!.startsWith("http") ? post.imageUrl! : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
              alt="Imagem do post"
              width={800}
              height={400}
              className="w-full object-cover max-h-80 hover:brightness-95 transition pointer-events-none"
              draggable={false}
            />
          </div>
          {lightboxOpen && (
            <ImageLightbox
              src={post.imageUrl!.startsWith("http") ? post.imageUrl! : `${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
              onClose={() => setLightboxOpen(false)}
            />
          )}
        </>
      )}

      {/* Video */}
      {post.videoUrl && (
        <div className="relative w-full rounded-xl overflow-hidden mb-3 bg-black">
          <video
            src={post.videoUrl}
            controls
            playsInline
            className="w-full max-h-80 object-contain"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <VoteButtons postId={post.id} closed={post.closed} />
        <div className="flex items-center gap-2">
          {post.closed ? (
            post.finalScore !== undefined && (
              <div className="flex flex-col items-end">
                <span className={`text-sm font-bold ${post.finalScore >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {post.finalScore >= 0 ? `+${post.finalScore}` : post.finalScore} pts
                </span>
                <span className="text-[10px] text-gray-400">resultado final</span>
              </div>
            )
          ) : (
            <div className={`flex flex-col items-end px-2.5 py-1 rounded-xl ${
              post.currentScore > 0 ? "bg-green-50" : post.currentScore < 0 ? "bg-red-50" : "bg-gray-50"
            }`}>
              <span className={`text-sm font-bold leading-tight ${
                post.currentScore > 0 ? "text-green-600" : post.currentScore < 0 ? "text-red-500" : "text-gray-400"
              }`}>
                {post.currentScore > 0 ? `+${post.currentScore}` : post.currentScore} pts
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">
                👍 {post.upvotes} · 👎 {post.downvotes}
              </span>
            </div>
          )}
          <PostTimer endsAt={post.votingEndsAt} closed={post.closed} />
        </div>
      </div>

      {/* Seção de comentários */}
      <CommentSection postId={post.id} />
    </div>
  );
}
