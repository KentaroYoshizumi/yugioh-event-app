"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { api, Post } from "@/lib/api";

type TabType = "all" | "battle_recruit" | "deck_share";

const TABS: { value: TabType; label: string }[] = [
  { value: "all", label: "全体" },
  { value: "battle_recruit", label: "対戦募集" },
  { value: "deck_share", label: "デッキ共有" },
];

export default function CommunityPage() {
  const { token, user } = useAuthStore();
  const [tab, setTab] = useState<TabType>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = async (type: TabType) => {
    setLoading(true);
    try {
      const res = await api.posts.list(type === "all" ? undefined : type, token ?? undefined);
      setPosts(res.posts);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(tab);
  }, [tab]);

  const handleLike = async (postID: string) => {
    if (!token) return;
    try {
      const res = await api.posts.toggleLike(postID, token);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postID ? { ...p, liked_by_me: res.liked, like_count: res.like_count } : p
        )
      );
    } catch {}
  };

  const handleFollow = async (authorID: string) => {
    if (!token || authorID === user?.id) return;
    try {
      const res = await api.users.toggleFollow(authorID, token);
      setPosts((prev) =>
        prev.map((p) =>
          p.author_id === authorID ? { ...p, author_followed_by_me: res.following } : p
        )
      );
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#1a1a2e]">コミュニティ</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#7b2d8b] text-white text-sm font-semibold rounded-lg hover:bg-[#5a1f66] transition-colors"
        >
          投稿する
        </button>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t.value
                ? "text-[#7b2d8b] border-b-2 border-[#7b2d8b]"
                : "text-gray-500 hover:text-[#7b2d8b]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 投稿リスト */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>投稿がありません</p>
          <p className="text-sm mt-1">最初の投稿をしてみましょう</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myID={user?.id}
              onLike={handleLike}
              onFollow={handleFollow}
            />
          ))}
        </ul>
      )}

      {/* 投稿フォーム モーダル */}
      {showForm && (
        <PostForm
          token={token!}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchPosts(tab);
          }}
        />
      )}
    </div>
  );
}

function PostCard({
  post,
  myID,
  onLike,
  onFollow,
}: {
  post: Post;
  myID?: string;
  onLike: (id: string) => void;
  onFollow: (authorID: string) => void;
}) {
  const isOwn = post.author_id === myID;

  return (
    <li className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7b2d8b] flex items-center justify-center text-white text-sm font-bold">
            {post.author?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm font-medium text-gray-700">{post.author?.display_name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              post.type === "battle_recruit"
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {post.type === "battle_recruit" ? "対戦募集" : "デッキ共有"}
          </span>
        </div>
        {!isOwn && (
          <button
            onClick={() => onFollow(post.author_id)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              post.author_followed_by_me
                ? "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-400"
                : "border-[#7b2d8b] text-[#7b2d8b] hover:bg-[#7b2d8b] hover:text-white"
            }`}
          >
            {post.author_followed_by_me ? "フォロー中" : "フォロー"}
          </button>
        )}
      </div>

      {/* 本文 */}
      <h3 className="font-bold text-[#1a1a2e]">{post.title}</h3>
      {post.description && <p className="text-gray-600 text-sm mt-1">{post.description}</p>}

      {post.type === "deck_share" && post.deck_name && (
        <p className="text-sm text-blue-600 mt-1">🃏 {post.deck_name}</p>
      )}
      {post.type === "deck_share" && post.card_list && (
        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 whitespace-pre-wrap border border-gray-100">
          {post.card_list}
        </pre>
      )}
      {post.type === "battle_recruit" && (
        <div className="mt-2 flex gap-3 text-xs text-gray-500">
          {post.preferred_date && <span>📅 {post.preferred_date}</span>}
          {post.location && <span>📍 {post.location}</span>}
          {post.deck_name && <span>🃏 {post.deck_name}</span>}
          <span
            className={`font-medium ${
              post.status === "open" ? "text-green-600" : "text-gray-400"
            }`}
          >
            {post.status === "open" ? "募集中" : "締め切り"}
          </span>
        </div>
      )}

      {/* フッター */}
      <div className="mt-3 flex items-center gap-1">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-colors ${
            post.liked_by_me
              ? "bg-pink-100 text-pink-600"
              : "bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500"
          }`}
        >
          <span>{post.liked_by_me ? "♥" : "♡"}</span>
          <span>{post.like_count}</span>
        </button>
        <span className="text-xs text-gray-400 ml-2">
          {post.created_at ? new Date(post.created_at).toLocaleDateString("ja-JP") : ""}
        </span>
      </div>
    </li>
  );
}

function PostForm({
  token,
  onClose,
  onCreated,
}: {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<"battle_recruit" | "deck_share">("battle_recruit");
  const [form, setForm] = useState({
    title: "",
    description: "",
    deck_name: "",
    card_list: "",
    preferred_date: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      setErrorMsg("タイトルを入力してください");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.posts.create({ type, ...form, status: "open" }, token);
      onCreated();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "投稿に失敗しました");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-[#1a1a2e]">新規投稿</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* 投稿タイプ */}
          <div className="flex gap-2">
            {(["battle_recruit", "deck_share"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  type === t
                    ? "bg-[#7b2d8b] text-white border-[#7b2d8b]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#7b2d8b]"
                }`}
              >
                {t === "battle_recruit" ? "対戦募集" : "デッキ共有"}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="タイトル *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputClass}
          />
          <textarea
            placeholder="説明（任意）"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className={inputClass + " resize-none"}
          />

          {type === "battle_recruit" && (
            <>
              <input
                type="text"
                placeholder="使用デッキ（任意）"
                value={form.deck_name}
                onChange={(e) => setForm((f) => ({ ...f, deck_name: e.target.value }))}
                className={inputClass}
              />
              <input
                type="date"
                value={form.preferred_date}
                onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="希望場所（任意）"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClass}
              />
            </>
          )}

          {type === "deck_share" && (
            <>
              <input
                type="text"
                placeholder="デッキ名"
                value={form.deck_name}
                onChange={(e) => setForm((f) => ({ ...f, deck_name: e.target.value }))}
                className={inputClass}
              />
              <textarea
                placeholder="カードリスト（自由形式）"
                value={form.card_list}
                onChange={(e) => setForm((f) => ({ ...f, card_list: e.target.value }))}
                rows={5}
                className={inputClass + " resize-none font-mono text-xs"}
              />
            </>
          )}

          {errorMsg && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#7b2d8b] text-white font-bold rounded-lg hover:bg-[#5a1f66] disabled:opacity-60 transition-colors"
          >
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </form>
      </div>
    </div>
  );
}
