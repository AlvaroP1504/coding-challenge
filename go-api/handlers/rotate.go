package handlers

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/youruser/coding-challenge/go-api/internal/linear"
)

// RotateRequest representa el payload de entrada para rotación
type RotateRequest struct {
	Matrix    [][]float64 `json:"matrix"`
	Direction string      `json:"direction,omitempty"` // "left" o "right", default "right"
}

// RotateResponse representa la respuesta de rotación
type RotateResponse struct {
	Rotated [][]float64 `json:"rotated"`
}

// HandleRotate maneja el endpoint POST /rotate
func HandleRotate(c *fiber.Ctx) error {
	var req RotateRequest
	
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
	
	// Default direction a "right" si no se especifica
	direction := req.Direction
	if direction == "" {
		direction = "right"
	}
	
	// Validar direction
	if direction != "left" && direction != "right" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "direction must be 'left' or 'right'",
		})
	}
	
	// Realizar rotación
	rotated, err := linear.RotateMatrix(req.Matrix, direction)
	if err != nil {
		log.Printf("Matrix rotation error: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("Matrix rotation failed: %v", err),
		})
	}
	
	originalDims := linear.MatrixDimensions(req.Matrix)
	rotatedDims := linear.MatrixDimensions(rotated)
	
	log.Printf("✅ Matrix rotated %s: %s -> %s", direction, originalDims, rotatedDims)
	
	// Devolver matriz rotada (NO enviamos a node-api según especificaciones)
	response := RotateResponse{
		Rotated: rotated,
	}
	
	return c.JSON(response)
}
