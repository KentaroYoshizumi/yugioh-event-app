package model

type User struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	CreatedAt   string `json:"created_at,omitempty"`
}

type Event struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	OrganizerID     string `json:"organizer_id"`
	Date            string `json:"date"`
	Location        string `json:"location"`
	MaxParticipants int    `json:"max_participants"`
	CreatedAt       string `json:"created_at,omitempty"`
}
