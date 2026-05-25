"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Props {
  profile: UserProfile;
  isOwner: boolean;
  onAvatarUpdated?: (newUrl: string) => void;
}

export default function ProfileHeader({ profile, isOwner, onAvatarUpdated }: Props) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: profile.nickname, bio: profile.bio });

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem maior que 10MB"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data: upload } = await api.post<{ url: string }>("/api/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.patch("/api/users/me", { avatarUrl: upload.url });
      setAvatarUrl(upload.url);
      updateUser({ avatarUrl: upload.url });
      onAvatarUpdated?.(upload.url);
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao atualizar foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (editForm.bio.length < 10) { toast.error("Bio deve ter pelo menos 10 caracteres"); return; }
    setSaving(true);
    try {
      await api.patch("/api/users/me", { nickname: editForm.nickname, bio: editForm.bio });
      updateUser({ nickname: editForm.nickname });
      toast.success("Perfil atualizado!");
      setEditing(false);
      // Redirect if nickname changed
      if (editForm.nickname !== profile.nickname) {
        router.replace(`/profile/${editForm.nickname}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Erro ao salvar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const fullAvatarUrl = avatarUrl
    ? avatarUrl.startsWith("http") ? avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`
    : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
            {fullAvatarUrl ? (
              <Image src={fullAvatarUrl} alt={profile.nickname} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              profile.nickname[0].toUpperCase()
            )}
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/40 transition group"
              title="Alterar foto"
            >
              <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition">
                {uploading ? "⏳" : "📷"}
              </span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">@{profile.nickname}</h1>
            {isOwner && (
              <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full shrink-0">Você</span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1 line-clamp-3">{profile.bio}</p>
          <p className="text-xs text-gray-400 mt-2">Membro desde {formatDate(profile.createdAt)}</p>
        </div>

        {/* Edit button */}
        {isOwner && !editing && (
          <button
            onClick={() => { setEditForm({ nickname: profile.nickname, bio: profile.bio }); setEditing(true); }}
            className="shrink-0 text-xs text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition font-medium"
          >
            Editar
          </button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nickname</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-Z0-9_]+$"
              value={editForm.nickname}
              onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Bio <span className="text-gray-400 font-normal">({editForm.bio.length}/300)</span>
            </label>
            <textarea
              required
              minLength={10}
              maxLength={300}
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
