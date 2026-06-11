package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/yugioh-event-app/backend/db"
	"github.com/yugioh-event-app/backend/handler"
	authmw "github.com/yugioh-event-app/backend/middleware"
)

func main() {
	database, err := db.Init("./yugioh.db")
	if err != nil {
		log.Fatal("failed to init db:", err)
	}
	defer database.Close()

	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	authHandler := handler.NewAuthHandler(database)
	eventHandler := handler.NewEventHandler(database)
	communityHandler := handler.NewCommunityHandler(database)

	r.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
			r.Group(func(r chi.Router) {
				r.Use(authmw.RequireAuth)
				r.Get("/me", authHandler.Me)
			})
		})
		r.Route("/events", func(r chi.Router) {
			r.Get("/", eventHandler.List)
			r.Group(func(r chi.Router) {
				r.Use(authmw.RequireAuth)
				r.Post("/", eventHandler.Create)
			})
		})
		r.Route("/posts", func(r chi.Router) {
			r.With(authmw.OptionalAuth).Get("/", communityHandler.ListPosts)
			r.Group(func(r chi.Router) {
				r.Use(authmw.RequireAuth)
				r.Post("/", communityHandler.CreatePost)
				r.Post("/{postID}/like", communityHandler.ToggleLike)
			})
		})
		r.Route("/users", func(r chi.Router) {
			r.Group(func(r chi.Router) {
				r.Use(authmw.RequireAuth)
				r.Post("/{userID}/follow", communityHandler.ToggleFollow)
			})
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("server starting on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
