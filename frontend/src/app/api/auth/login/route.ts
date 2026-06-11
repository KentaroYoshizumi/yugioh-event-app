import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const sql = getDb();
    const rows = await sql`
      SELECT id, email, display_name, password_hash FROM users WHERE email = ${email}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが違います" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが違います" },
        { status: 401 }
      );
    }

    const token = await signToken(user.id as string);
    return NextResponse.json({
      user: { id: user.id, email: user.email, display_name: user.display_name },
      token,
    });
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
