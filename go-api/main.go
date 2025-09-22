package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/youruser/coding-challenge/go-api/handlers"
)

func main() {
	// Verificar si es un health check
	if len(os.Args) > 1 && os.Args[1] == "--health-check" {
		healthCheck()
		return
	}

	// Crear aplicación Fiber
	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			
			log.Printf("Error: %v", err)
			return ctx.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
		// Configuración adicional
		DisableStartupMessage: false,
		AppName:              "Go API - QR Factorization Service",
	})

	// Middleware globales
	app.Use(recover.New()) // Recuperar de panics
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} - ${latency}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"ok": true,
			"service": "go-api",
			"status": "healthy",
		})
	})

	// API endpoints
	app.Post("/qr", handlers.HandleQR)
	app.Post("/rotate", handlers.HandleRotate)

	// 404 handler
	app.Use("*", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Endpoint not found",
			"available_endpoints": []string{
				"GET /health",
				"POST /qr",
				"POST /rotate",
			},
		})
	})

	// Obtener puerto desde env var
	port := getPort()
	
	log.Printf("🚀 Go API starting on port %s", port)
	log.Printf("📍 NODE_API_URL: %s", getNodeAPIURL())
	log.Printf("🔗 Available endpoints:")
	log.Printf("   GET  /health")
	log.Printf("   POST /qr")
	log.Printf("   POST /rotate")
	
	// Iniciar servidor
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

// getPort obtiene el puerto desde env var PORT, default 8080
func getPort() string {
	if port := os.Getenv("PORT"); port != "" {
		return port
	}
	return "8080"
}

// getNodeAPIURL obtiene la URL de node-api desde env var
func getNodeAPIURL() string {
	if url := os.Getenv("NODE_API_URL"); url != "" {
		return url
	}
	
	// Diferente default según si estamos en Docker o local
	if os.Getenv("DOCKER_ENV") != "" {
		return "http://node-api:3000"
	}
	
	return "http://localhost:3000"
}

// healthCheck verifica que el servicio esté funcionando (para Docker health check)
func healthCheck() {
	port := getPort()
	url := fmt.Sprintf("http://localhost:%s/health", port)
	
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	
	resp, err := client.Get(url)
	if err != nil {
		log.Printf("Health check failed: %v", err)
		os.Exit(1)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		log.Printf("Health check failed: status %d", resp.StatusCode)
		os.Exit(1)
	}
	
	log.Println("Health check passed")
	os.Exit(0)
}