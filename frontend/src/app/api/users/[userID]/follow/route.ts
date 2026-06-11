import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractBearer, verifyToken } from "@/lib/jwt";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userID: string }> }
) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const followerID = await verifyToken(token);
  if (!followerID) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { userID: followingID } = await params;
  if (followerID === followingID) {
    return NextResponse.json({ error: "cannot follow yourself" }, { status: 400 });
  }

  const sql = getDb();
  const existing = await sql`
    SELECT 1 FROM follows WHERE follower_id = ${followerID} AND following_id = ${followingID}
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM follows WHERE follower_id = ${followerID} AND following_id = ${followingID}`;
  } else {
    await sql`INSERT INTO follows (follower_id, following_id) VALUES (${followerID}, ${followingID})`;
  }

  return NextResponse.json({ following: existing.length === 0 });
}
