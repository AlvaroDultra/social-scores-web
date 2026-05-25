"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, rehydrate, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ email: "", nickname: "", bio: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rehydrate();
    if (isAuthenticated()) router.replace("/feed");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.bio.length < 10) {
      toast.error("Bio deve ter pelo menos 10 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", form);
      setAuth(data.token, data.user);
      toast.success("Conta criada com sucesso!");
      router.push("/feed");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Erro ao criar conta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="Social Score" width={64} height={64} className="object-contain mb-3" />
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">Social Score</h1>
          <p className="text-sm text-gray-500 mt-1">Crie sua conta e comece a jogar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Criar conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nickname *</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                pattern="^[a-zA-Z0-9_]+$"
                value={form.nickname}
                onChange={(e) => update("nickname", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Apenas letras, números e _"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio * <span className="text-gray-400 font-normal">({form.bio.length}/300)</span>
              </label>
              <textarea
                required
                minLength={10}
                maxLength={300}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5 text-gray-500">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
