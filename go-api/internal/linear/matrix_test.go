package linear

import (
	"testing"
)

func TestRotateMatrix(t *testing.T) {
	tests := []struct {
		name      string
		matrix    [][]float64
		direction string
		expected  [][]float64
	}{
		{
			name: "rotate 2x3 right",
			matrix: [][]float64{
				{1, 2, 3},
				{4, 5, 6},
			},
			direction: "right",
			expected: [][]float64{
				{4, 1},
				{5, 2},
				{6, 3},
			},
		},
		{
			name: "rotate 2x3 left",
			matrix: [][]float64{
				{1, 2, 3},
				{4, 5, 6},
			},
			direction: "left",
			expected: [][]float64{
				{3, 6},
				{2, 5},
				{1, 4},
			},
		},
		{
			name: "rotate 3x3 right",
			matrix: [][]float64{
				{1, 2, 3},
				{4, 5, 6},
				{7, 8, 9},
			},
			direction: "right",
			expected: [][]float64{
				{7, 4, 1},
				{8, 5, 2},
				{9, 6, 3},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := RotateMatrix(tt.matrix, tt.direction)
			if err != nil {
				t.Fatalf("RotateMatrix failed: %v", err)
			}

			if len(result) != len(tt.expected) {
				t.Fatalf("Expected %d rows, got %d", len(tt.expected), len(result))
			}

			for i := range result {
				if len(result[i]) != len(tt.expected[i]) {
					t.Fatalf("Row %d: expected %d cols, got %d", i, len(tt.expected[i]), len(result[i]))
				}
				for j := range result[i] {
					if result[i][j] != tt.expected[i][j] {
						t.Errorf("At [%d][%d]: expected %v, got %v", i, j, tt.expected[i][j], result[i][j])
					}
				}
			}
		})
	}
}

func TestToGonumMatrix(t *testing.T) {
	matrix := [][]float64{
		{1, 2, 3},
		{4, 5, 6},
	}

	gonumMatrix, err := ToGonumMatrix(matrix)
	if err != nil {
		t.Fatalf("ToGonumMatrix failed: %v", err)
	}

	rows, cols := gonumMatrix.Dims()
	if rows != 2 || cols != 3 {
		t.Fatalf("Expected 2x3 matrix, got %dx%d", rows, cols)
	}

	// Verificar valores
	expected := []float64{1, 2, 3, 4, 5, 6}
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			expectedVal := expected[i*cols+j]
			actualVal := gonumMatrix.At(i, j)
			if actualVal != expectedVal {
				t.Errorf("At [%d][%d]: expected %v, got %v", i, j, expectedVal, actualVal)
			}
		}
	}
}

func TestFromGonumMatrix(t *testing.T) {
	// Crear matriz original
	original := [][]float64{
		{1, 2},
		{3, 4},
		{5, 6},
	}

	// Convertir a gonum y de vuelta
	gonumMatrix, err := ToGonumMatrix(original)
	if err != nil {
		t.Fatalf("ToGonumMatrix failed: %v", err)
	}

	result := FromGonumMatrix(gonumMatrix)

	// Verificar que sean iguales
	if len(result) != len(original) {
		t.Fatalf("Expected %d rows, got %d", len(original), len(result))
	}

	for i := range result {
		if len(result[i]) != len(original[i]) {
			t.Fatalf("Row %d: expected %d cols, got %d", i, len(original[i]), len(result[i]))
		}
		for j := range result[i] {
			if result[i][j] != original[i][j] {
				t.Errorf("At [%d][%d]: expected %v, got %v", i, j, original[i][j], result[i][j])
			}
		}
	}
}

func TestValidateMatrix(t *testing.T) {
	tests := []struct {
		name    string
		matrix  [][]float64
		wantErr bool
	}{
		{
			name: "valid matrix",
			matrix: [][]float64{
				{1, 2, 3},
				{4, 5, 6},
			},
			wantErr: false,
		},
		{
			name:    "empty matrix",
			matrix:  [][]float64{},
			wantErr: true,
		},
		{
			name: "irregular matrix",
			matrix: [][]float64{
				{1, 2, 3},
				{4, 5},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateMatrix(tt.matrix)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateMatrix() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
