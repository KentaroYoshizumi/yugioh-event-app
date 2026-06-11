"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password || !confirmPassword) {
      setErrorMsg("全ての項目を入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("パスワードが一致しません");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("パスワードは6文字以上で入力してください");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    const { error } = await signUp(email.trim(), password, displayName.trim());
    setSubmitting(false);

    if (error) {
      setErrorMsg(error);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-[#1a1a2e] mb-1">遊戯王イベント</h1>
        <p className="text-center text-gray-500 mb-8">新規登録</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="表示名（ニックネーム）"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent"
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent"
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent"
          />
          <input
            type="password"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#7b2d8b] text-white font-bold rounded-lg text-base hover:bg-[#5a1f66] disabled:opacity-60 transition-colors"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[#7b2d8b] text-sm hover:underline">
            既にアカウントをお持ちの方はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
