package linear

import (
	"fmt"
	"math"

	"gonum.org/v1/gonum/mat"
)

// MatrixValidationError representa errores de validación de matrices
type MatrixValidationError struct {
	Message string
}

func (e *MatrixValidationError) Error() string {
	return e.Message
}

// ValidateMatrix valida que una matriz sea rectangular y contenga solo números válidos
func ValidateMatrix(matrix [][]float64) error {
	if len(matrix) == 0 {
		return &MatrixValidationError{Message: "matrix cannot be empty"}
	}
	
	if len(matrix[0]) == 0 {
		return &MatrixValidationError{Message: "matrix rows cannot be empty"}
	}
	
	cols := len(matrix[0])
	
	for _, row := range matrix {
		if len(row) != cols {
			return &MatrixValidationError{Message: "matrix must be rectangular (all rows same length)"}
		}
		
		for _, val := range row {
			if math.IsNaN(val) || math.IsInf(val, 0) {
				return &MatrixValidationError{Message: "matrix contains invalid values (NaN or Inf)"}
			}
		}
	}
	
	return nil
}

// ToGonumMatrix convierte una matriz [][]float64 a mat.Dense
func ToGonumMatrix(matrix [][]float64) (*mat.Dense, error) {
	if err := ValidateMatrix(matrix); err != nil {
		return nil, err
	}
	
	rows := len(matrix)
	cols := len(matrix[0])
	
	// Aplanar la matriz para gonum
	data := make([]float64, rows*cols)
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			data[i*cols+j] = matrix[i][j]
		}
	}
	
	return mat.NewDense(rows, cols, data), nil
}

// FromGonumMatrix convierte una mat.Dense a [][]float64
func FromGonumMatrix(m mat.Matrix) [][]float64 {
	rows, cols := m.Dims()
	result := make([][]float64, rows)
	
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			result[i][j] = m.At(i, j)
		}
	}
	
	return result
}

// RotateMatrix rota una matriz 90 grados
// direction: "right" (clockwise) o "left" (counterclockwise)
func RotateMatrix(matrix [][]float64, direction string) ([][]float64, error) {
	if err := ValidateMatrix(matrix); err != nil {
		return nil, err
	}
	
	rows := len(matrix)
	cols := len(matrix[0])
	
	var rotated [][]float64
	
	switch direction {
	case "right", "": // Default es right (horario)
		// Nueva matriz con dimensiones intercambiadas
		rotated = make([][]float64, cols)
		for i := range rotated {
			rotated[i] = make([]float64, rows)
		}
		
		// Rotar 90 grados horario: (i,j) -> (j, rows-1-i)
		for i := 0; i < rows; i++ {
			for j := 0; j < cols; j++ {
				rotated[j][rows-1-i] = matrix[i][j]
			}
		}
		
	case "left": // Antihorario
		// Nueva matriz con dimensiones intercambiadas
		rotated = make([][]float64, cols)
		for i := range rotated {
			rotated[i] = make([]float64, rows)
		}
		
		// Rotar 90 grados antihorario: (i,j) -> (cols-1-j, i)
		for i := 0; i < rows; i++ {
			for j := 0; j < cols; j++ {
				rotated[cols-1-j][i] = matrix[i][j]
			}
		}
		
	default:
		return nil, &MatrixValidationError{Message: "direction must be 'left' or 'right'"}
	}
	
	return rotated, nil
}

// MatrixDimensions retorna las dimensiones de una matriz como string
func MatrixDimensions(matrix [][]float64) string {
	if len(matrix) == 0 {
		return "0x0"
	}
	return fmt.Sprintf("%dx%d", len(matrix), len(matrix[0]))
}

// IsSquare verifica si una matriz es cuadrada
func IsSquare(matrix [][]float64) bool {
	if len(matrix) == 0 {
		return false
	}
	return len(matrix) == len(matrix[0])
}
