import { Router, Request, Response } from 'express';
import { MatrixStatsService } from '../services/matrixStats';

const router = Router();
const statsService = new MatrixStatsService();

interface StatsRequest {
  matrix?: number[][];
  source?: string;
  // Para QR factorization desde go-api
  q?: number[][];
  r?: number[][];
}

interface StatsResponse {
  max: number;
  min: number;
  avg: number;
  sum: number;
  isDiagonalQ?: boolean;
  isDiagonalR?: boolean;
  diagonal?: number[];
  mainDiagonalSum?: number;
  source?: string;
  processedAt: string;
}

router.post('/', (req: Request, res: Response): void => {
  try {
    const { matrix, source, q, r }: StatsRequest = req.body;

    // Determinar si es request de QR o matrix regular
    if (q && r) {
      // Request desde go-api con matrices Q y R
      handleQRStats(req, res, q, r);
      return;
    } else if (matrix) {
      // Request regular con una matriz
      handleMatrixStats(req, res, matrix, source);
      return;
    } else {
      res.status(400).json({ 
        error: 'Either "matrix" or both "q" and "r" are required' 
      });
      return;
    }
  } catch (error) {
    console.error('Error processing stats:', error);
    res.status(500).json({ error: 'Failed to process matrix statistics' });
  }
});

// Maneja estadísticas para matrices Q y R de factorización QR
function handleQRStats(req: Request, res: Response, q: number[][], r: number[][]): void {
  try {
    // Validar matrices Q y R
    if (!validateMatrix(q) || !validateMatrix(r)) {
      res.status(400).json({ error: 'Invalid Q or R matrix format' });
      return;
    }

    // Calcular estadísticas combinadas de Q y R
    const combinedMatrix = [...q, ...r]; // Concatenar filas
    const stats = statsService.calculateStats(combinedMatrix);
    
    // Analizar propiedades específicas de Q y R
    const isDiagonalQ = isDiagonalMatrix(q);
    const isDiagonalR = isDiagonalMatrix(r);
    
    const response: StatsResponse = {
      max: stats.max,
      min: stats.min,
      avg: stats.avg,
      sum: stats.sum,
      isDiagonalQ,
      isDiagonalR,
      source: 'qr-factorization',
      processedAt: new Date().toISOString()
    };

    console.log(`📊 QR Statistics: Q(${q.length}x${q[0]?.length || 0}) R(${r.length}x${r[0]?.length || 0})`);
    
    res.json(response);
  } catch (error) {
    console.error('Error processing QR stats:', error);
    res.status(500).json({ error: 'Failed to process QR statistics' });
  }
}

// Maneja estadísticas para matrices regulares
function handleMatrixStats(req: Request, res: Response, matrix: number[][], source?: string): void {
  try {
    // Validaciones
    if (!validateMatrix(matrix)) {
      res.status(400).json({ error: 'Invalid matrix format' });
      return;
    }

    // Calcular estadísticas
    const stats = statsService.calculateStats(matrix);
    
    const response: StatsResponse = {
      max: stats.max,
      min: stats.min,
      avg: stats.avg,
      sum: stats.sum,
      diagonal: stats.diagonal.length > 0 ? stats.diagonal : undefined,
      mainDiagonalSum: stats.diagonal.length > 0 ? stats.mainDiagonalSum : undefined,
      source: source || 'unknown',
      processedAt: new Date().toISOString()
    };

    console.log(`📊 Matrix Stats: ${matrix.length}x${matrix[0]?.length || 0} from ${source}`);
    
    res.json(response);
  } catch (error) {
    console.error('Error processing matrix stats:', error);
    res.status(500).json({ error: 'Failed to process matrix statistics' });
  }
}

// Función helper para validar matrices
function validateMatrix(matrix: number[][]): boolean {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  if (!matrix.every(row => Array.isArray(row))) {
    return false;
  }

  const cols = matrix[0].length;
  if (cols === 0 || !matrix.every(row => row.length === cols)) {
    return false;
  }

  if (!matrix.every(row => row.every(val => typeof val === 'number' && !isNaN(val)))) {
    return false;
  }

  return true;
}

// Función helper para verificar si una matriz es diagonal
function isDiagonalMatrix(matrix: number[][]): boolean {
  if (!matrix || matrix.length === 0) return false;
  
  const rows = matrix.length;
  const cols = matrix[0].length;
  const tolerance = 1e-10;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > tolerance) {
        return false;
      }
    }
  }
  
  return true;
}

// Endpoint para obtener historial de estadísticas (opcional)
router.get('/history', (req: Request, res: Response) => {
  const history = statsService.getHistory();
  res.json({
    totalProcessed: history.length,
    lastProcessed: history[history.length - 1] || null,
    history: history.slice(-10) // Últimas 10 entradas
  });
});

export { router as statsRouter };
