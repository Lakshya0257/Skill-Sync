/**
 * Calculate the standard deviation of an array of numbers
 * @param values Array of numeric values
 * @returns The standard deviation
 */
const calculateStandardDeviation = (values: number[]): number => {
    // Return 0 for empty arrays
    if (values.length === 0) return 0;
    
    // Calculate the mean (average) of the values
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate the sum of squared differences from the mean
    const sumSquaredDiff = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    
    // Calculate the variance (average of squared differences)
    const variance = sumSquaredDiff / values.length;
    
    // Standard deviation is the square root of the variance
    return Math.sqrt(variance);
  };
  
  export default calculateStandardDeviation;