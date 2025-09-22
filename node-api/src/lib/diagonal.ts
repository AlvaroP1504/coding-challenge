/**
 * Utilidades para verificar si una matriz es diagonal
 */

const TOLERANCE = 1e-9;

/**
 * Verifica si una matriz es diagonal dentro de una tolerancia
 * Una matriz es diagonal si todos los elementos fuera de la diagonal principal
 * están dentro de la tolerancia especificada (≈ 0)
 */
export function isDiagonal(matrix: number[][], tolerance: number = TOLERANCE): boolean {
  if (matrix.length === 0) {
    return false;
  }
  
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  
  // Verificar que sea una matriz válida (rectangular)
  if (!matrix.every(row => row && row.length === cols)) {
    return false;
  }
  
  // Verificar elementos fuera de la diagonal
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Si no está en la diagonal principal
      if (i !== j) {
        // El valor debe estar dentro de la tolerancia (≈ 0)
        if (Math.abs(matrix[i]?.[j] ?? 0) > tolerance) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Verifica si una matriz es diagonal con tolerancia personalizada
 */
export function isDiagonalWithTolerance(matrix: number[][], tolerance: number): boolean {
  return isDiagonal(matrix, tolerance);
}

/**
 * Obtiene los elementos de la diagonal principal de una matriz
 */
export function getDiagonalElements(matrix: number[][]): number[] {
  if (matrix.length === 0) {
    return [];
  }
  
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const minDimension = Math.min(rows, cols);
  
  const diagonal: number[] = [];
  for (let i = 0; i < minDimension; i++) {
    diagonal.push(matrix[i]?.[i] ?? 0);
  }
  
  return diagonal;
}

/**
 * Verifica si una matriz es cuadrada
 */
export function isSquareMatrix(matrix: number[][]): boolean {
  if (matrix.length === 0) {
    return false;
  }
  
  return matrix.length === (matrix[0]?.length ?? 0);
}

/**
 * Calcula la suma de la diagonal principal
 */
export function getDiagonalSum(matrix: number[][]): number {
  const diagonal = getDiagonalElements(matrix);
  return diagonal.reduce((sum, val) => sum + val, 0);
}

/**
 * Información detallada sobre la diagonal de una matriz
 */
export interface DiagonalInfo {
  isDiagonal: boolean;
  diagonalElements: number[];
  diagonalSum: number;
  isSquare: boolean;
  tolerance: number;
}

/**
 * Obtiene información completa sobre la diagonal de una matriz
 */
export function analyzeDiagonal(matrix: number[][], tolerance: number = TOLERANCE): DiagonalInfo {
  return {
    isDiagonal: isDiagonal(matrix, tolerance),
    diagonalElements: getDiagonalElements(matrix),
    diagonalSum: getDiagonalSum(matrix),
    isSquare: isSquareMatrix(matrix),
    tolerance
  };
}
