"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    max_participants: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      setErrorMsg("タイトルを入力してください");
      return;
    }
    if (!token) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.events.create(
        {
          title: form.title,
          description: form.description,
          date: form.date,
          location: form.location,
          max_participants: form.max_participants ? parseInt(form.max_participants) : 0,
        },
        token
      );
      setSuccessMsg("イベントを作成しました");
      setForm({ title: "", description: "", date: "", location: "", max_participants: "" });
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent";

  return (
    <div>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">主催者ダッシュボード</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-[#1a1a2e] mb-4">新規イベント作成</h3>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="イベントタイトル *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputClass}
          />
          <textarea
            placeholder="イベント説明"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className={inputClass + " resize-none"}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="開催場所"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="最大参加人数（0 = 無制限）"
            value={form.max_participants}
            onChange={(e) => setForm((f) => ({ ...f, max_participants: e.target.value }))}
            min={0}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#7b2d8b] text-white font-bold rounded-lg text-base hover:bg-[#5a1f66] disabled:opacity-60 transition-colors"
          >
            {submitting ? "作成中..." : "イベントを作成"}
          </button>
        </form>
      </div>
    </div>
  );
}
