const BASE = "/api";

export type User = {
  id: string;
  email: string;
  display_name: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  date: string;
  location: string;
  max_participants: number;
  created_at?: string;
};

export type Post = {
  id: string;
  author_id: string;
  type: "battle_recruit" | "deck_share";
  title: string;
  description: string;
  deck_name?: string;
  card_list?: string;
  preferred_date?: string;
  location?: string;
  status: "open" | "closed";
  created_at?: string;
  author?: { id: string; display_name: string };
  like_count: number;
  liked_by_me: boolean;
  author_followed_by_me: boolean;
};

async function request<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "request failed");
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; display_name: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

    me: (token: string) =>
      request<User>("/auth/me", { token }),
  },

  events: {
    list: (token?: string) =>
      request<{ events: Event[] }>("/events", token ? { token } : undefined),

    create: (body: Omit<Event, "id" | "organizer_id" | "created_at">, token: string) =>
      request<Event>("/events", { method: "POST", body: JSON.stringify(body), token }),
  },

  posts: {
    list: (postType?: string, token?: string) => {
      const qs = postType ? `?type=${postType}` : "";
      return request<{ posts: Post[] }>(`/posts${qs}`, token ? { token } : undefined);
    },

    create: (body: Omit<Post, "id" | "author_id" | "created_at" | "author" | "like_count" | "liked_by_me" | "author_followed_by_me">, token: string) =>
      request<Post>("/posts", { method: "POST", body: JSON.stringify(body), token }),

    toggleLike: (postID: string, token: string) =>
      request<{ liked: boolean; like_count: number }>(`/posts/${postID}/like`, { method: "POST", token }),
  },

  users: {
    toggleFollow: (userID: string, token: string) =>
      request<{ following: boolean }>(`/users/${userID}/follow`, { method: "POST", token }),
  },
};
