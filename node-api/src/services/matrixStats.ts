export interface MatrixStats {
  max: number;
  min: number;
  avg: number;
  sum: number;
  diagonal: number[];
  mainDiagonalSum: number;
}

export interface StatsHistoryEntry {
  timestamp: string;
  source: string;
  matrixDimensions: string;
  stats: MatrixStats;
}

export class MatrixStatsService {
  private history: StatsHistoryEntry[] = [];

  calculateStats(matrix: number[][]): MatrixStats {
    // Aplanar matriz para cálculos generales
    const flattened = matrix.flat();
    
    // Estadísticas básicas
    const max = Math.max(...flattened);
    const min = Math.min(...flattened);
    const sum = flattened.reduce((acc, val) => acc + val, 0);
    const avg = sum / flattened.length;

    // Diagonal principal (solo si es matriz cuadrada o rectangular)
    const diagonal: number[] = [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    const minDimension = Math.min(rows, cols);
    
    for (let i = 0; i < minDimension; i++) {
      diagonal.push(matrix[i][i]);
    }
    
    const mainDiagonalSum = diagonal.reduce((acc, val) => acc + val, 0);

    const stats: MatrixStats = {
      max,
      min,
      avg: Math.round(avg * 100) / 100, // Redondear a 2 decimales
      sum,
      diagonal,
      mainDiagonalSum
    };

    // Guardar en historial
    this.history.push({
      timestamp: new Date().toISOString(),
      source: 'go-api', // Siempre viene de go-api
      matrixDimensions: `${rows}x${cols}`,
      stats
    });

    // Mantener solo las últimas 100 entradas
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    return stats;
  }

  getHistory(): StatsHistoryEntry[] {
    return [...this.history]; // Copia defensiva
  }

  getLatestStats(): StatsHistoryEntry | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  clearHistory(): void {
    this.history = [];
  }

  getStatsForSource(source: string): StatsHistoryEntry[] {
    return this.history.filter(entry => entry.source === source);
  }
}
