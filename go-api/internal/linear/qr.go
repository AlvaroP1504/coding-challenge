package linear

import (
	"fmt"

	"gonum.org/v1/gonum/mat"
)

// QRResult contiene el resultado de la factorización QR
type QRResult struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

// QRError representa errores específicos de QR
type QRError struct {
	Message string
}

func (e *QRError) Error() string {
	return e.Message
}

// ComputeQR realiza la factorización QR de una matriz usando gonum
func ComputeQR(matrix [][]float64) (*QRResult, error) {
	// Validar matriz de entrada
	if err := ValidateMatrix(matrix); err != nil {
		return nil, fmt.Errorf("invalid matrix: %w", err)
	}
	
	rows := len(matrix)
	cols := len(matrix[0])
	
	// Convertir a gonum matrix
	gonumMatrix, err := ToGonumMatrix(matrix)
	if err != nil {
		return nil, fmt.Errorf("failed to convert matrix: %w", err)
	}
	
	// Verificar dimensiones para QR
	if rows < cols {
		// Matriz "wide" - QR todavía es posible pero puede no ser útil
		// Proceder de todos modos según especificaciones
	}
	
	// Realizar factorización QR
	var qr mat.QR
	qr.Factorize(gonumMatrix)
	
	// Extraer matrices Q y R
	var q, r mat.Dense
	qr.QTo(&q)
	qr.RTo(&r)
	
	// Convertir de vuelta a slices
	qMatrix := FromGonumMatrix(&q)
	rMatrix := FromGonumMatrix(&r)
	
	return &QRResult{
		Q: qMatrix,
		R: rMatrix,
	}, nil
}

// VerifyQR verifica que Q*R = matriz original (para testing)
func VerifyQR(original [][]float64, qr *QRResult) (bool, error) {
	// Convertir todas las matrices a gonum
	origMatrix, err := ToGonumMatrix(original)
	if err != nil {
		return false, err
	}
	
	qMatrix, err := ToGonumMatrix(qr.Q)
	if err != nil {
		return false, err
	}
	
	rMatrix, err := ToGonumMatrix(qr.R)
	if err != nil {
		return false, err
	}
	
	// Multiplicar Q * R
	var product mat.Dense
	product.Mul(qMatrix, rMatrix)
	
	// Comparar con la matriz original (con tolerancia para errores de punto flotante)
	rows, cols := origMatrix.Dims()
	tolerance := 1e-10
	
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			orig := origMatrix.At(i, j)
			prod := product.At(i, j)
			if abs(orig-prod) > tolerance {
				return false, nil
			}
		}
	}
	
	return true, nil
}

// abs retorna el valor absoluto de un float64
func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}

// QRInfo retorna información sobre las matrices Q y R
type QRInfo struct {
	QDimensions string `json:"q_dimensions"`
	RDimensions string `json:"r_dimensions"`
	IsQOrthogonal bool `json:"is_q_orthogonal"`
	IsRUpperTriangular bool `json:"is_r_upper_triangular"`
}

// AnalyzeQR analiza las propiedades de las matrices Q y R
func AnalyzeQR(qr *QRResult) *QRInfo {
	info := &QRInfo{
		QDimensions: MatrixDimensions(qr.Q),
		RDimensions: MatrixDimensions(qr.R),
		IsQOrthogonal: isOrthogonal(qr.Q),
		IsRUpperTriangular: isUpperTriangular(qr.R),
	}
	return info
}

// isOrthogonal verifica si una matriz es ortogonal (Q^T * Q = I)
func isOrthogonal(matrix [][]float64) bool {
	if len(matrix) == 0 {
		return false
	}
	
	n := len(matrix)
	m := len(matrix[0])
	
	// Solo matrices cuadradas pueden ser ortogonales
	if n != m {
		return false
	}
	
	tolerance := 1e-10
	
	// Verificar que Q^T * Q = I
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			dotProduct := 0.0
			for k := 0; k < m; k++ {
				dotProduct += matrix[k][i] * matrix[k][j]
			}
			
			expected := 0.0
			if i == j {
				expected = 1.0
			}
			
			if abs(dotProduct-expected) > tolerance {
				return false
			}
		}
	}
	
	return true
}

// isUpperTriangular verifica si una matriz es triangular superior
func isUpperTriangular(matrix [][]float64) bool {
	if len(matrix) == 0 {
		return true
	}
	
	rows := len(matrix)
	cols := len(matrix[0])
	tolerance := 1e-10
	
	// Verificar que todos los elementos debajo de la diagonal sean cero
	for i := 0; i < rows; i++ {
		for j := 0; j < cols && j < i; j++ {
			if abs(matrix[i][j]) > tolerance {
				return false
			}
		}
	}
	
	return true
}
