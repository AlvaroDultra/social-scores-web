"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AuthGuard from "@/components/ui/AuthGuard";
import NotificationBell from "@/components/ui/NotificationBell";
import { usePush } from "@/hooks/usePush";

const navItems = [
  { href: "/feed",           label: "Feed",      icon: "🏠" },
  { href: "/ranking/atual",  label: "Ranking",   icon: "🏆" },
  { href: "/ranking/mensal", label: "Mensal",    icon: "📅" },
  { href: "/ranking/diario", label: "Diário",    icon: "📊" },
  { href: "/history",        label: "Histórico", icon: "📜" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  usePush();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Social Score" width={32} height={32} className="object-contain" />
            <span className="text-base font-bold text-blue-700 tracking-tight">Social Score</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <NotificationBell />
                <Link
                  href={`/profile/${user?.nickname}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
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
                  <span className="hidden sm:inline">@{user?.nickname}</span>
                </Link>
                <span className="hidden sm:inline text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {user?.scoreBalance ?? 0} pts
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <AuthGuard>{children}</AuthGuard>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
