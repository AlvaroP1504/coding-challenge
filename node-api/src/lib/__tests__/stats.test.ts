import { calculateMatrixStats, calculateCombinedStats, validateMatrixShape, getMatrixDimensions } from '../stats';

describe('Stats Utils', () => {
  describe('calculateMatrixStats', () => {
    it('should calculate basic stats correctly', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const stats = calculateMatrixStats(matrix);
      
      expect(stats.max).toBe(6);
      expect(stats.min).toBe(1);
      expect(stats.sum).toBe(21); // 1+2+3+4+5+6
      expect(stats.avg).toBe(3.5); // 21/6
    });

    it('should handle single element matrix', () => {
      const matrix = [[42]];
      const stats = calculateMatrixStats(matrix);
      
      expect(stats.max).toBe(42);
      expect(stats.min).toBe(42);
      expect(stats.sum).toBe(42);
      expect(stats.avg).toBe(42);
    });

    it('should handle negative numbers', () => {
      const matrix = [
        [-1, -2],
        [3, 4]
      ];
      const stats = calculateMatrixStats(matrix);
      
      expect(stats.max).toBe(4);
      expect(stats.min).toBe(-2);
      expect(stats.sum).toBe(4); // -1-2+3+4
      expect(stats.avg).toBe(1); // 4/4
    });

    it('should throw error for empty matrix', () => {
      expect(() => calculateMatrixStats([])).toThrow('Matrix cannot be empty');
    });
  });

  describe('calculateCombinedStats', () => {
    it('should calculate stats from two matrices', () => {
      const q = [
        [1, 0],
        [0, 1]
      ];
      const r = [
        [2, 1],
        [0, 3]
      ];
      
      const stats = calculateCombinedStats(q, r);
      
      expect(stats.max).toBe(3);
      expect(stats.min).toBe(0);
      expect(stats.sum).toBe(8); // 1+0+0+1+2+1+0+3
      expect(stats.avg).toBe(1); // 8/8
    });

    it('should handle different sized matrices', () => {
      const q = [[1, 2]];
      const r = [
        [3, 4],
        [5, 6]
      ];
      
      const stats = calculateCombinedStats(q, r);
      
      expect(stats.max).toBe(6);
      expect(stats.min).toBe(1);
      expect(stats.sum).toBe(21); // 1+2+3+4+5+6
      expect(stats.avg).toBe(3.5); // 21/6
    });
  });

  describe('validateMatrixShape', () => {
    it('should validate rectangular matrix', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      expect(validateMatrixShape(matrix)).toBe(true);
    });

    it('should reject irregular matrix', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5] // Different length
      ];
      expect(validateMatrixShape(matrix)).toBe(false);
    });

    it('should reject empty matrix', () => {
      expect(validateMatrixShape([])).toBe(false);
    });

    it('should reject matrix with empty rows', () => {
      const matrix = [
        [1, 2],
        [] // Empty row
      ];
      expect(validateMatrixShape(matrix)).toBe(false);
    });
  });

  describe('getMatrixDimensions', () => {
    it('should return correct dimensions', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const dims = getMatrixDimensions(matrix);
      
      expect(dims.rows).toBe(2);
      expect(dims.cols).toBe(3);
    });

    it('should handle empty matrix', () => {
      const dims = getMatrixDimensions([]);
      
      expect(dims.rows).toBe(0);
      expect(dims.cols).toBe(0);
    });

    it('should handle single element', () => {
      const matrix = [[42]];
      const dims = getMatrixDimensions(matrix);
      
      expect(dims.rows).toBe(1);
      expect(dims.cols).toBe(1);
    });
  });
});
