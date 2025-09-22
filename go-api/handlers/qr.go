package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/youruser/coding-challenge/go-api/internal/linear"
)

// QRRequest representa el payload de entrada para QR
type QRRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

// QRPayload es lo que enviamos a node-api
type QRPayload struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

// StatsResponse es lo que esperamos de node-api
type StatsResponse struct {
	Max           float64 `json:"max"`
	Min           float64 `json:"min"`
	Avg           float64 `json:"avg"`
	Sum           float64 `json:"sum"`
	IsDiagonalQ   bool    `json:"isDiagonalQ"`
	IsDiagonalR   bool    `json:"isDiagonalR"`
	ProcessedAt   string  `json:"processedAt,omitempty"`
	Source        string  `json:"source,omitempty"`
}

// HandleQR maneja el endpoint POST /qr
func HandleQR(c *fiber.Ctx) error {
	var req QRRequest
	
	// Parse JSON body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format",
		})
	}
	
	// Validar matriz de entrada
	if len(req.Matrix) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "matrix is required and cannot be empty",
		})
	}
	
	// Realizar factorización QR
	qrResult, err := linear.ComputeQR(req.Matrix)
	if err != nil {
		log.Printf("QR factorization error: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("QR factorization failed: %v", err),
		})
	}
	
	log.Printf("✅ QR factorization completed for %s matrix", linear.MatrixDimensions(req.Matrix))
	
	// Enviar a node-api para estadísticas
	stats, err := sendQRToNodeAPI(qrResult)
	if err != nil {
		log.Printf("⚠️  Warning: Failed to send to node-api: %v", err)
		// No fallar la request principal por esto - devolver resultado QR sin stats
		return c.JSON(fiber.Map{
			"q": qrResult.Q,
			"r": qrResult.R,
			"warning": "Statistics could not be computed",
		})
	}
	
	log.Printf("📊 Statistics received from node-api")
	
	// Devolver las estadísticas que nos devolvió node-api
	return c.JSON(stats)
}

// sendQRToNodeAPI envía las matrices Q y R a node-api para obtener estadísticas
func sendQRToNodeAPI(qrResult *linear.QRResult) (*StatsResponse, error) {
	// Obtener URL de node-api desde env vars
	nodeAPIURL := getNodeAPIURL()
	endpoint := fmt.Sprintf("%s/stats", nodeAPIURL)
	
	// Preparar payload
	payload := QRPayload{
		Q: qrResult.Q,
		R: qrResult.R,
	}
	
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal QR payload: %w", err)
	}
	
	// Crear request con headers
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Headers básicos
	req.Header.Set("Content-Type", "application/json")
	
	// JWT token si está configurado
	if jwtToken := os.Getenv("JWT_TOKEN"); jwtToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwtToken))
		log.Printf("🔒 Adding JWT token to request")
	}
	
	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	
	// Hacer request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call node-api: %w", err)
	}
	defer resp.Body.Close()
	
	// Verificar status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("node-api returned status %d", resp.StatusCode)
	}
	
	// Parsear response
	var stats StatsResponse
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("failed to decode node-api response: %w", err)
	}
	
	return &stats, nil
}

// getNodeAPIURL obtiene la URL de node-api desde variables de entorno
func getNodeAPIURL() string {
	if url := os.Getenv("NODE_API_URL"); url != "" {
		return url
	}
	
	// Default para desarrollo local
	return "http://localhost:3000"
}
