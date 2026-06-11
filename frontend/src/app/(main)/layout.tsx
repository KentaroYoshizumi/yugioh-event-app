"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  { href: "/events", label: "イベント" },
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/community", label: "コミュニティ" },
  { href: "/profile", label: "プロフィール" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#7b2d8b] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <span className="text-lg font-bold">遊戯王イベント</span>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">{children}</main>

      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around max-w-2xl mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  active ? "text-[#7b2d8b] border-t-2 border-[#7b2d8b]" : "text-gray-500 hover:text-[#7b2d8b]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="h-14" />
    </div>
  );
}
