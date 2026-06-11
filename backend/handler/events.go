package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/yugioh-event-app/backend/middleware"
	"github.com/yugioh-event-app/backend/model"
)

type EventHandler struct {
	db *sql.DB
}

func NewEventHandler(db *sql.DB) *EventHandler {
	return &EventHandler{db: db}
}

func (h *EventHandler) List(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(
		`SELECT id, title, description, organizer_id, date, location, max_participants, created_at
		 FROM events ORDER BY created_at DESC`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	events := []model.Event{}
	for rows.Next() {
		var e model.Event
		rows.Scan(&e.ID, &e.Title, &e.Description, &e.OrganizerID, &e.Date, &e.Location, &e.MaxParticipants, &e.CreatedAt)
		events = append(events, e)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"events": events})
}

type createEventRequest struct {
	Title           string `json:"title"`
	Description     string `json:"description"`
	Date            string `json:"date"`
	Location        string `json:"location"`
	MaxParticipants int    `json:"max_participants"`
}

func (h *EventHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req createEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}

	id := newID()
	_, err := h.db.Exec(
		`INSERT INTO events (id, title, description, organizer_id, date, location, max_participants)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		id, req.Title, req.Description, userID, req.Date, req.Location, req.MaxParticipants,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create event")
		return
	}

	event := model.Event{
		ID:              id,
		Title:           req.Title,
		Description:     req.Description,
		OrganizerID:     userID,
		Date:            req.Date,
		Location:        req.Location,
		MaxParticipants: req.MaxParticipants,
		CreatedAt:       time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(event)
}
