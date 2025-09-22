package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gonum.org/v1/gonum/mat"
)

type MatrixRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

type QRResponse struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

type RotateResponse struct {
	Rotated [][]float64 `json:"rotated"`
}

type StatsRequest struct {
	Matrix [][]float64 `json:"matrix"`
	Source string      `json:"source"`
}

func main() {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return ctx.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "go-api"})
	})

	// QR Factorization endpoint (obligatorio)
	app.Post("/qr", handleQRFactorization)

	// Rotate matrix endpoint (opcional)
	app.Post("/rotate", handleRotateMatrix)

	log.Println("🚀 Go API ejecutándose en puerto 3001")
	log.Fatal(app.Listen(":3001"))
}

func handleQRFactorization(c *fiber.Ctx) error {
	var req MatrixRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid JSON")
	}

	if len(req.Matrix) == 0 || len(req.Matrix[0]) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Empty matrix")
	}

	// Convertir a mat.Dense
	rows, cols := len(req.Matrix), len(req.Matrix[0])
	data := make([]float64, rows*cols)
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			data[i*cols+j] = req.Matrix[i][j]
		}
	}

	matrix := mat.NewDense(rows, cols, data)

	// QR Factorization
	var qr mat.QR
	qr.Factorize(matrix)

	var q, r mat.Dense
	qr.QTo(&q)
	qr.RTo(&r)

	// Convertir de vuelta a slices
	qRows, qCols := q.Dims()
	qMatrix := make([][]float64, qRows)
	for i := 0; i < qRows; i++ {
		qMatrix[i] = make([]float64, qCols)
		for j := 0; j < qCols; j++ {
			qMatrix[i][j] = q.At(i, j)
		}
	}

	rRows, rCols := r.Dims()
	rMatrix := make([][]float64, rRows)
	for i := 0; i < rRows; i++ {
		rMatrix[i] = make([]float64, rCols)
		for j := 0; j < rCols; j++ {
			rMatrix[i][j] = r.At(i, j)
		}
	}

	response := QRResponse{
		Q: qMatrix,
		R: rMatrix,
	}

	// Enviar estadísticas a Node API
	go sendStatsToNodeAPI(req.Matrix, "qr")

	return c.JSON(response)
}

func handleRotateMatrix(c *fiber.Ctx) error {
	var req MatrixRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid JSON")
	}

	if len(req.Matrix) == 0 || len(req.Matrix[0]) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Empty matrix")
	}

	// Rotar matriz 90 grados en sentido horario
	rotated := rotateMatrix90(req.Matrix)

	response := RotateResponse{
		Rotated: rotated,
	}

	// Enviar estadísticas a Node API
	go sendStatsToNodeAPI(req.Matrix, "rotate")

	return c.JSON(response)
}

func rotateMatrix90(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	
	// Nueva matriz con dimensiones intercambiadas
	rotated := make([][]float64, cols)
	for i := range rotated {
		rotated[i] = make([]float64, rows)
	}
	
	// Rotar 90 grados en sentido horario
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			rotated[j][rows-1-i] = matrix[i][j]
		}
	}
	
	return rotated
}

func sendStatsToNodeAPI(matrix [][]float64, source string) {
	nodeAPIURL := "http://node-api:3002/stats"
	
	statsReq := StatsRequest{
		Matrix: matrix,
		Source: source,
	}
	
	jsonData, err := json.Marshal(statsReq)
	if err != nil {
		log.Printf("Error marshaling stats request: %v", err)
		return
	}
	
	resp, err := http.Post(nodeAPIURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error sending stats to Node API: %v", err)
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		log.Printf("Node API returned status: %d", resp.StatusCode)
	} else {
		log.Printf("Stats sent successfully to Node API for operation: %s", source)
	}
}
