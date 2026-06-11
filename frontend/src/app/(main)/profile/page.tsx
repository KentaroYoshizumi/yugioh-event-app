"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#7b2d8b] flex items-center justify-center text-white text-3xl font-bold mb-4">
        {user?.display_name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <h2 className="text-2xl font-bold text-[#1a1a2e]">{user?.display_name ?? "ユーザー"}</h2>
      <p className="text-gray-400 text-sm mt-1 mb-10">{user?.email}</p>

      <button
        onClick={handleSignOut}
        className="px-8 py-3 border border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors"
      >
        ログアウト
      </button>
    </div>
  );
}
