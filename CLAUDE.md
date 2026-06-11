@AGENTS.md

# プロジェクト概要

遊戯王イベント管理Webアプリ。

## 現在のアーキテクチャ

| レイヤー | 技術 | 備考 |
|---|---|---|
| フロントエンド + API | Next.js 15 (App Router) | `frontend/` ディレクトリ |
| データベース | Neon (PostgreSQL) | SQLite から移行済み |
| 認証 | JWT (jose) + bcryptjs | Supabase は不使用 |
| デプロイ | Vercel | `main` push で自動デプロイ |

> **注意**: `backend/`（Go）はローカル開発用として残っているが、本番では使用しない。APIはすべてNext.js Route Handlersで実装済み。

## ディレクトリ構成

```
yugioh-event-app/
├── frontend/          # メインアプリ（Next.js）← ここだけVercelにデプロイ
│   ├── src/app/api/   # APIルート（認証・イベント・投稿・いいね・フォロー）
│   ├── src/lib/       # db.ts（Neon接続）、jwt.ts（JWT）、api.ts（クライアント）
│   ├── src/store/     # auth.ts（Zustand、localStorageにJWT永続化）
│   ├── migration.sql  # Neonで最初に実行するSQL
│   └── .env.local     # DATABASE_URL, JWT_SECRET（gitignore済み）
└── backend/           # Go + SQLite（ローカル開発参考用）
```

## 実装済み機能（Phase）

- **Phase 1**: 認証（新規登録・ログイン・ログアウト）
- **Phase 2**: イベント一覧・作成
- **Phase 4**: コミュニティ（投稿・いいね・フォロー）
  - 投稿タイプ: `battle_recruit`（対戦募集）/ `deck_share`（デッキ共有）
- **Phase 5**: 主催者ダッシュボード（イベント作成フォーム）
- **Phase 3**: 未実装（内容未定）

## APIエンドポイント

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| POST | `/api/auth/register` | 不要 | 新規登録 |
| POST | `/api/auth/login` | 不要 | ログイン |
| GET | `/api/auth/me` | 必要 | 自分の情報 |
| GET | `/api/events` | 不要 | イベント一覧 |
| POST | `/api/events` | 必要 | イベント作成 |
| GET | `/api/posts?type=...` | 任意 | 投稿一覧 |
| POST | `/api/posts` | 必要 | 投稿作成 |
| POST | `/api/posts/[postID]/like` | 必要 | いいねトグル |
| POST | `/api/users/[userID]/follow` | 必要 | フォロートグル |

## インフラ情報

- **Vercel プロジェクト**: `frontend`（yoshi-s-projects13）
- **本番URL**: https://frontend-nine-mu-99.vercel.app
- **Neon プロジェクト**: `yugioh-event-app`（lucky-bird-35424991）
- **GitHub**: https://github.com/KentaroYoshizumi/yugioh-event-app

## ローカル開発

```bash
cd frontend
npm run dev   # http://localhost:3000
```

`.env.local` に `DATABASE_URL`（Neon接続文字列）と `JWT_SECRET` が必要。

## デプロイ

`git push origin main` で Vercel が自動デプロイ。
手動の場合: `cd frontend && vercel --prod`
