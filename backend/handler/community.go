package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	authmw "github.com/yugioh-event-app/backend/middleware"
	"github.com/yugioh-event-app/backend/model"
)

type CommunityHandler struct {
	db *sql.DB
}

func NewCommunityHandler(db *sql.DB) *CommunityHandler {
	return &CommunityHandler{db: db}
}

// GET /api/posts?type=battle_recruit|deck_share
func (h *CommunityHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	callerID, _ := r.Context().Value(authmw.UserIDKey).(string)
	postType := r.URL.Query().Get("type")

	query := `
		SELECT p.id, p.author_id, p.type, p.title, p.description,
		       p.deck_name, p.card_list, p.preferred_date, p.location, p.status, p.created_at,
		       u.display_name,
		       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS like_count,
		       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_me,
		       (SELECT COUNT(*) FROM follows f WHERE f.follower_id = ? AND f.following_id = p.author_id) AS followed_by_me
		FROM posts p
		JOIN users u ON u.id = p.author_id`

	args := []interface{}{callerID, callerID}
	if postType == "battle_recruit" || postType == "deck_share" {
		query += ` WHERE p.type = ?`
		args = append(args, postType)
	}
	query += ` ORDER BY p.created_at DESC`

	rows, err := h.db.Query(query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	posts := []model.Post{}
	for rows.Next() {
		var p model.Post
		var displayName string
		var likedByMe, followedByMe int
		rows.Scan(
			&p.ID, &p.AuthorID, &p.Type, &p.Title, &p.Description,
			&p.DeckName, &p.CardList, &p.PreferredDate, &p.Location, &p.Status, &p.CreatedAt,
			&displayName, &p.LikeCount, &likedByMe, &followedByMe,
		)
		p.LikedByMe = likedByMe > 0
		p.AuthorFollowedByMe = followedByMe > 0
		p.Author = &model.User{ID: p.AuthorID, DisplayName: displayName}
		posts = append(posts, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"posts": posts})
}

// POST /api/posts
func (h *CommunityHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	authorID := r.Context().Value(authmw.UserIDKey).(string)

	var req model.Post
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.Type != "battle_recruit" && req.Type != "deck_share" {
		writeError(w, http.StatusBadRequest, "type must be battle_recruit or deck_share")
		return
	}

	id := newID()
	_, err := h.db.Exec(`
		INSERT INTO posts (id, author_id, type, title, description, deck_name, card_list, preferred_date, location, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
		id, authorID, req.Type, req.Title, req.Description,
		req.DeckName, req.CardList, req.PreferredDate, req.Location,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create post")
		return
	}

	var displayName string
	h.db.QueryRow(`SELECT display_name FROM users WHERE id = ?`, authorID).Scan(&displayName)

	req.ID = id
	req.AuthorID = authorID
	req.Status = "open"
	req.Author = &model.User{ID: authorID, DisplayName: displayName}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

// POST /api/posts/{postID}/like  — toggles like
func (h *CommunityHandler) ToggleLike(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(authmw.UserIDKey).(string)
	postID := chi.URLParam(r, "postID")

	var exists int
	h.db.QueryRow(`SELECT COUNT(*) FROM post_likes WHERE post_id=? AND user_id=?`, postID, userID).Scan(&exists)

	if exists > 0 {
		h.db.Exec(`DELETE FROM post_likes WHERE post_id=? AND user_id=?`, postID, userID)
	} else {
		h.db.Exec(`INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`, postID, userID)
	}

	var count int
	h.db.QueryRow(`SELECT COUNT(*) FROM post_likes WHERE post_id=?`, postID).Scan(&count)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"liked":      exists == 0,
		"like_count": count,
	})
}

// POST /api/users/{userID}/follow  — toggles follow
func (h *CommunityHandler) ToggleFollow(w http.ResponseWriter, r *http.Request) {
	followerID := r.Context().Value(authmw.UserIDKey).(string)
	followingID := chi.URLParam(r, "userID")

	if followerID == followingID {
		writeError(w, http.StatusBadRequest, "cannot follow yourself")
		return
	}

	var exists int
	h.db.QueryRow(`SELECT COUNT(*) FROM follows WHERE follower_id=? AND following_id=?`, followerID, followingID).Scan(&exists)

	if exists > 0 {
		h.db.Exec(`DELETE FROM follows WHERE follower_id=? AND following_id=?`, followerID, followingID)
	} else {
		h.db.Exec(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`, followerID, followingID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"following": exists == 0})
}
