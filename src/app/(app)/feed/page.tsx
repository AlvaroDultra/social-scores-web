"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import PostCard from "@/components/feed/PostCard";
import type { Post, Page, UserSummary } from "@/types";

export default function FeedPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content: "", targetEmail: "" });
  const [users, setUsers] = useState<UserSummary[]>([]);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);

  const loadPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const { data } = await api.get<Page<Post>>(`/api/posts?page=${pageNum}&size=20`);
      setPosts((prev) => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
    } catch {
      toast.error("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(0); }, [loadPosts]);

  useEffect(() => {
    api.get<UserSummary[]>("/api/users").then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem maior que 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear video if any
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("Vídeo maior que 50MB"); return; }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    // Clear image if any
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeVideo() {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  function resetForm() {
    setForm({ content: "", targetEmail: "" });
    removeImage();
    removeVideo();
    setShowForm(false);
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const { data } = await api.post<{ url: string }>("/api/upload/image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = data.url;
      }

      if (videoFile) {
        const fd = new FormData();
        fd.append("file", videoFile);
        const { data } = await api.post<{ url: string }>("/api/upload/video", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        videoUrl = data.url;
      }

      const { data } = await api.post<Post>("/api/posts", {
        content: form.content,
        targetEmail: form.targetEmail || undefined,
        imageUrl,
        videoUrl,
      });
      setPosts((prev) => [data, ...prev]);
      resetForm();
      toast.success("Post criado!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Erro ao criar post";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const hasMedia = imagePreview || videoPreview;

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      {/* Criar post */}
      {isAuthenticated && (
        <div className="mb-5">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition text-sm shadow-sm"
            >
              + Novo post
            </button>
          ) : (
            <form
              onSubmit={handleCreatePost}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <textarea
                required
                maxLength={2000}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                placeholder="O que você quer compartilhar?"
                autoFocus
              />

              <select
                value={form.targetEmail}
                onChange={(e) => setForm({ ...form, targetEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white transition"
              >
                <option value="">— Post sobre mim mesmo —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.email}>@{u.nickname}</option>
                ))}
              </select>

              {/* Prévia de imagem */}
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={600}
                    height={300}
                    className="w-full object-cover max-h-56"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Prévia de vídeo */}
              {videoPreview && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-56 object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Botões de mídia — apenas quando não há prévia */}
              {!hasMedia && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2"
                  >
                    📷 Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition flex items-center justify-center gap-2"
                  >
                    🎬 Vídeo <span className="text-xs opacity-70">(máx. 10s)</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                >
                  {submitting ? "Publicando..." : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Lista de posts */}
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
      )}

      {!loading && hasMore && posts.length > 0 && (
        <button
          onClick={() => { const next = page + 1; setPage(next); loadPosts(next); }}
          className="w-full mt-4 py-3 border border-gray-200 rounded-2xl text-gray-500 hover:bg-white hover:shadow-sm transition text-sm font-medium"
        >
          Carregar mais
        </button>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">Nenhum post ainda.</p>
          <p className="text-sm mt-1">Seja o primeiro a criar um post!</p>
        </div>
      )}
    </div>
  );
}
