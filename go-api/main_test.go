package main

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestQRFactorization(t *testing.T) {
	app := fiber.New()
	app.Post("/qr", handleQRFactorization)

	// Matriz de prueba 2x2
	matrix := MatrixRequest{
		Matrix: [][]float64{
			{1, 2},
			{3, 4},
		},
	}

	jsonBody, _ := json.Marshal(matrix)
	req := httptest.NewRequest("POST", "/qr", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Error en test: %v", err)
	}

	if resp.StatusCode != 200 {
		t.Fatalf("Status esperado 200, obtenido %d", resp.StatusCode)
	}

	var response QRResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Error decodificando response: %v", err)
	}

	// Verificar que Q y R no están vacías
	if len(response.Q) == 0 || len(response.R) == 0 {
		t.Fatal("Q o R están vacías")
	}

	t.Logf("QR factorization test passed - Q: %v, R: %v", response.Q, response.R)
}

func TestRotateMatrix(t *testing.T) {
	app := fiber.New()
	app.Post("/rotate", handleRotateMatrix)

	// Matriz de prueba 2x3
	matrix := MatrixRequest{
		Matrix: [][]float64{
			{1, 2, 3},
			{4, 5, 6},
		},
	}

	jsonBody, _ := json.Marshal(matrix)
	req := httptest.NewRequest("POST", "/rotate", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Error en test: %v", err)
	}

	if resp.StatusCode != 200 {
		t.Fatalf("Status esperado 200, obtenido %d", resp.StatusCode)
	}

	var response RotateResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Error decodificando response: %v", err)
	}

	// Verificar dimensiones rotadas (2x3 -> 3x2)
	if len(response.Rotated) != 3 || len(response.Rotated[0]) != 2 {
		t.Fatalf("Dimensiones incorrectas después de rotación")
	}

	t.Logf("Rotate matrix test passed - Rotated: %v", response.Rotated)
}
