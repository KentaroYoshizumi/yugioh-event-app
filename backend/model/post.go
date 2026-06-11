package model

type Post struct {
	ID            string `json:"id"`
	AuthorID      string `json:"author_id"`
	Type          string `json:"type"` // "battle_recruit" | "deck_share"
	Title         string `json:"title"`
	Description   string `json:"description"`
	DeckName      string `json:"deck_name,omitempty"`
	CardList      string `json:"card_list,omitempty"`
	PreferredDate string `json:"preferred_date,omitempty"`
	Location      string `json:"location,omitempty"`
	Status        string `json:"status"`
	CreatedAt     string `json:"created_at,omitempty"`

	Author             *User `json:"author,omitempty"`
	LikeCount          int   `json:"like_count"`
	LikedByMe          bool  `json:"liked_by_me"`
	AuthorFollowedByMe bool  `json:"author_followed_by_me"`
}
