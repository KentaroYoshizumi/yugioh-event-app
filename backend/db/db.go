package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

func Init(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	if err := migrate(db); err != nil {
		return nil, err
	}
	return db, nil
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id           TEXT PRIMARY KEY,
			email        TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			display_name TEXT NOT NULL,
			created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS events (
			id               TEXT PRIMARY KEY,
			title            TEXT NOT NULL,
			description      TEXT DEFAULT '',
			organizer_id     TEXT NOT NULL,
			date             TEXT DEFAULT '',
			location         TEXT DEFAULT '',
			max_participants INTEGER DEFAULT 0,
			created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (organizer_id) REFERENCES users(id)
		);
		CREATE TABLE IF NOT EXISTS posts (
			id             TEXT PRIMARY KEY,
			author_id      TEXT NOT NULL,
			type           TEXT NOT NULL CHECK(type IN ('battle_recruit','deck_share')),
			title          TEXT NOT NULL,
			description    TEXT DEFAULT '',
			deck_name      TEXT DEFAULT '',
			card_list      TEXT DEFAULT '',
			preferred_date TEXT DEFAULT '',
			location       TEXT DEFAULT '',
			status         TEXT DEFAULT 'open',
			created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (author_id) REFERENCES users(id)
		);
		CREATE TABLE IF NOT EXISTS post_likes (
			post_id    TEXT NOT NULL,
			user_id    TEXT NOT NULL,
			PRIMARY KEY (post_id, user_id)
		);
		CREATE TABLE IF NOT EXISTS follows (
			follower_id  TEXT NOT NULL,
			following_id TEXT NOT NULL,
			PRIMARY KEY (follower_id, following_id)
		);
	`)
	return err
}
