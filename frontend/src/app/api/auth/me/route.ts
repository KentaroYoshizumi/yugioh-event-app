import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractBearer, verifyToken } from "@/lib/jwt";

export async function GET(request: Request) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userID = await verifyToken(token);
  if (!userID) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const rows = await sql`SELECT id, email, display_name FROM users WHERE id = ${userID}`;
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(rows[0]);
}
