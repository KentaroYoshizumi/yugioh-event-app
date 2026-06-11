import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { extractBearer, verifyToken } from "@/lib/jwt";

export async function GET() {
  const sql = getDb();
  const events = await sql`
    SELECT id, title, description, organizer_id, date, location, max_participants, created_at
    FROM events ORDER BY created_at DESC
  `;
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const token = extractBearer(request);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userID = await verifyToken(token);
  if (!userID) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description = "", date = "", location = "", max_participants = 0 } = body;
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const sql = getDb();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO events (id, title, description, organizer_id, date, location, max_participants)
    VALUES (${id}, ${title}, ${description}, ${userID}, ${date}, ${location}, ${max_participants})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
