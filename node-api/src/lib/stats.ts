/**
 * Utilidades para cálculos estadísticos sobre matrices
 */

export interface MatrixStats {
  max: number;
  min: number;
  avg: number;
  sum: number;
}

/**
 * Calcula estadísticas básicas de una matriz aplanada
 */
export function calculateMatrixStats(matrix: number[][]): MatrixStats {
  // Aplanar la matriz para obtener todos los valores
  const values = matrix.flat();
  
  if (values.length === 0) {
    throw new Error('Matrix cannot be empty');
  }
  
  // Cálculos estadísticos
  const max = Math.max(...values);
  const min = Math.min(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  return {
    max,
    min,
    avg: Number(avg.toFixed(15)), // Precisión doble
    sum: Number(sum.toFixed(15))  // Precisión doble
  };
}

/**
 * Calcula estadísticas combinadas de dos matrices (Q y R)
 */
export function calculateCombinedStats(q: number[][], r: number[][]): MatrixStats {
  // Combinar ambas matrices en una sola
  const allValues: number[] = [];
  
  // Agregar valores de Q
  for (const row of q) {
    allValues.push(...row);
  }
  
  // Agregar valores de R
  for (const row of r) {
    allValues.push(...row);
  }
  
  if (allValues.length === 0) {
    throw new Error('Combined matrices cannot be empty');
  }
  
  // Cálculos estadísticos
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const sum = allValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / allValues.length;
  
  return {
    max,
    min,
    avg: Number(avg.toFixed(15)), // Precisión doble
    sum: Number(sum.toFixed(15))  // Precisión doble
  };
}

/**
 * Valida que una matriz sea rectangular
 */
export function validateMatrixShape(matrix: number[][]): boolean {
  if (matrix.length === 0) {
    return false;
  }
  
  const expectedCols = matrix[0]?.length ?? 0;
  if (expectedCols === 0) {
    return false;
  }
  
  return matrix.every(row => row.length === expectedCols);
}

/**
 * Obtiene las dimensiones de una matriz
 */
export function getMatrixDimensions(matrix: number[][]): { rows: number; cols: number } {
  const rows = matrix.length;
  const cols = rows > 0 ? (matrix[0]?.length ?? 0) : 0;
  return { rows, cols };
}
