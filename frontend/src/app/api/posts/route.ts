import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractBearer, verifyToken } from "@/lib/jwt";

type PostRow = Record<string, unknown>;

function formatPosts(rows: PostRow[]) {
  return rows.map((p) => ({
    id: p.id,
    author_id: p.author_id,
    type: p.type,
    title: p.title,
    description: p.description,
    deck_name: p.deck_name,
    card_list: p.card_list,
    preferred_date: p.preferred_date,
    location: p.location,
    status: p.status,
    created_at: p.created_at,
    author: { id: p.author_id, display_name: p.display_name },
    like_count: Number(p.like_count),
    liked_by_me: Number(p.liked_by_me) > 0,
    author_followed_by_me: Number(p.followed_by_me) > 0,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postType = searchParams.get("type");

  const token = extractBearer(request);
  const callerID = token ? ((await verifyToken(token)) ?? "") : "";

  const sql = getDb();
  let rows: PostRow[];

  if (postType === "battle_recruit" || postType === "deck_share") {
    rows = (await sql`
      SELECT p.id, p.author_id, p.type, p.title, p.description,
             p.deck_name, p.card_list, p.preferred_date, p.location, p.status, p.created_at,
             u.display_name,
             (SELECT COUNT(*)::int FROM post_likes l WHERE l.post_id = p.id) AS like_count,
             (SELECT COUNT(*)::int FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ${callerID}) AS liked_by_me,
             (SELECT COUNT(*)::int FROM follows f WHERE f.follower_id = ${callerID} AND f.following_id = p.author_id) AS followed_by_me
      FROM posts p JOIN users u ON u.id = p.author_id
      WHERE p.type = ${postType}
      ORDER BY p.created_at DESC
    `) as PostRow[];
  } else {
    rows = (await sql`
      SELECT p.id, p.author_id, p.type, p.title, p.description,
             p.deck_name, p.card_list, p.preferred_date, p.location, p.status, p.created_at,
             u.display_name,
             (SELECT COUNT(*)::int FROM post_likes l WHERE l.post_id = p.id) AS like_count,
             (SELECT COUNT(*)::int FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ${callerID}) AS liked_by_me,
             (SELECT COUNT(*)::int FROM follows f WHERE f.follower_id = ${callerID} AND f.following_id = p.author_id) AS followed_by_me
      FROM posts p JOIN users u ON u.id = p.author_id
      ORDER BY p.created_at DESC
    `) as PostRow[];
  }

  return NextResponse.json({ posts: formatPosts(rows) });
}

export async function POST(request: Request) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userID = await verifyToken(token);
  if (!userID) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    type, title,
    description = "", deck_name = "", card_list = "",
    preferred_date = "", location = "",
  } = body;

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (type !== "battle_recruit" && type !== "deck_share") {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const sql = getDb();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO posts (id, author_id, type, title, description, deck_name, card_list, preferred_date, location, status)
    VALUES (${id}, ${userID}, ${type}, ${title}, ${description}, ${deck_name}, ${card_list}, ${preferred_date}, ${location}, 'open')
  `;

  const userRows = await sql`SELECT display_name FROM users WHERE id = ${userID}`;
  const displayName = (userRows[0]?.display_name as string) ?? "";

  return NextResponse.json(
    {
      id, author_id: userID, type, title, description,
      deck_name, card_list, preferred_date, location, status: "open",
      author: { id: userID, display_name: displayName },
      like_count: 0, liked_by_me: false, author_followed_by_me: false,
    },
    { status: 201 }
  );
}
