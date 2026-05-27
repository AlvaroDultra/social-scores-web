"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import PostCard from "@/components/feed/PostCard";
import type { Post } from "@/types";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Post>(`/api/posts/${id}`)
      .then(({ data }) => setPost(data))
      .catch(() => {
        toast.error("Post não encontrado");
        router.replace("/feed");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center text-gray-400 text-sm">
        Carregando...
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-gray-400 hover:text-gray-700 transition flex items-center gap-1"
      >
        ← Voltar
      </button>
      <PostCard post={post} onDeleted={() => router.replace("/feed")} />
    </div>
  );
}
