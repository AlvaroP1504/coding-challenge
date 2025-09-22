import { Router, Request, Response } from 'express';
import { MatrixStatsService } from '../services/matrixStats';

const router = Router();
const statsService = new MatrixStatsService();

interface StatsRequest {
  matrix: number[][];
  source: string;
}

interface StatsResponse {
  max: number;
  min: number;
  avg: number;
  sum: number;
  diagonal?: number[];
  mainDiagonalSum?: number;
  source: string;
  processedAt: string;
}

router.post('/', (req: Request, res: Response) => {
  try {
    const { matrix, source }: StatsRequest = req.body;

    // Validaciones
    if (!matrix || !Array.isArray(matrix)) {
      return res.status(400).json({ error: 'Matrix is required and must be an array' });
    }

    if (matrix.length === 0) {
      return res.status(400).json({ error: 'Matrix cannot be empty' });
    }

    if (!matrix.every(row => Array.isArray(row))) {
      return res.status(400).json({ error: 'Matrix must be a 2D array' });
    }

    const cols = matrix[0].length;
    if (!matrix.every(row => row.length === cols)) {
      return res.status(400).json({ error: 'Matrix rows must have consistent length' });
    }

    if (!matrix.every(row => row.every(val => typeof val === 'number' && !isNaN(val)))) {
      return res.status(400).json({ error: 'Matrix must contain only valid numbers' });
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

    console.log(`📊 Estadísticas procesadas para matriz ${matrix.length}x${cols} desde ${source}`);
    
    res.json(response);
  } catch (error) {
    console.error('Error processing stats:', error);
    res.status(500).json({ error: 'Failed to process matrix statistics' });
  }
});

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
