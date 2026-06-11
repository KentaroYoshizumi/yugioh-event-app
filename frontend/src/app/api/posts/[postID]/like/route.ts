import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractBearer, verifyToken } from "@/lib/jwt";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postID: string }> }
) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userID = await verifyToken(token);
  if (!userID) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { postID } = await params;
  const sql = getDb();

  const existing = await sql`
    SELECT 1 FROM post_likes WHERE post_id = ${postID} AND user_id = ${userID}
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM post_likes WHERE post_id = ${postID} AND user_id = ${userID}`;
  } else {
    await sql`INSERT INTO post_likes (post_id, user_id) VALUES (${postID}, ${userID})`;
  }

  const countRows = await sql`SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = ${postID}`;
  return NextResponse.json({
    liked: existing.length === 0,
    like_count: Number(countRows[0].count),
  });
}
