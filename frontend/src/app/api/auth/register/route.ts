import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password, display_name } = await request.json();

    if (!email || !password || !display_name) {
      return NextResponse.json(
        { error: "email, password, display_name are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "パスワードは6文字以上で入力してください" },
        { status: 400 }
      );
    }

    const sql = getDb();
    const hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    try {
      await sql`
        INSERT INTO users (id, email, password_hash, display_name)
        VALUES (${id}, ${email}, ${hash}, ${display_name})
      `;
    } catch {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const token = await signToken(id);
    return NextResponse.json(
      { user: { id, email, display_name }, token },
      { status: 201 }
    );
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
