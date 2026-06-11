"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { api, Event } from "@/lib/api";

export default function EventsPage() {
  const token = useAuthStore((s) => s.token);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.events
      .list(token ?? undefined)
      .then((res) => setEvents(res.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        読み込み中...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">イベント一覧</h2>

      {events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">イベントがありません</p>
          <p className="text-sm">主催者ダッシュボードからイベントを作成できます</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-bold text-[#1a1a2e] text-base">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 text-sm mt-1">{event.description}</p>
              )}
              <div className="mt-2 flex gap-3 text-xs text-gray-500">
                {event.date && <span>📅 {event.date}</span>}
                {event.location && <span>📍 {event.location}</span>}
                {event.max_participants > 0 && (
                  <span>👥 最大{event.max_participants}人</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
