import * as Plot from "npm:@observablehq/plot";
import { resize } from "npm:@observablehq/stdlib";

/**
 * Common chart configuration defaults
 */
export const defaultChartConfig = {
  marginBottom: 70,
  marginLeft: 60,
  height: 400,
};

/**
 * Common axis configuration for rotated labels
 */
export const rotatedXAxis = {
  tickRotate: 45,
};

/**
 * Common grid configuration
 */
export const gridY = {
  grid: true,
};

/**
 * Parse month string to Date object
 * @param {string} monthStr - Month string in format "YYYY-MM"
 * @returns {Date}
 */
export function parseMonth(monthStr) {
  return new Date(monthStr + "T00:00:00");
}

/**
 * Format date as month label
 * @param {Date} date
 * @returns {string}
 */
export function monthLabel(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Create a responsive line chart with common defaults
 * @param {Object} options - Chart options
 * @param {Array} options.data - Data array
 * @param {string} options.xField - X field name
 * @param {string} options.yField - Y field name
 * @param {string} options.title - Chart title
 * @param {string} options.yLabel - Y axis label
 * @param {string} options.xLabel - X axis label
 * @param {string} options.stroke - Line stroke color
 * @param {number} options.width - Chart width
 * @param {Object} options.extraConfig - Additional Plot config
 * @returns {Plot}
 */
export function lineChart({
  data,
  xField,
  yField,
  title,
  yLabel,
  xLabel = "Week",
  stroke = "steelblue",
  width = 900,
  extraConfig = {}
}) {
  return Plot.plot({
    title,
    y: { grid: true, label: yLabel },
    x: { label: xLabel, tickRotate: 45 },
    marks: [
      Plot.line(data, {
        x: xField,
        y: yField,
        stroke,
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(data, {
        x: xField,
        y: yField,
        fill: stroke,
        r: 3,
        tip: true
      }),
      Plot.ruleY([0])
    ],
    width,
    height: 400,
    marginBottom: 70,
    marginLeft: 60,
    ...extraConfig
  });
}

/**
 * Create a responsive chart function with resize wrapper
 * @param {Function} chartFn - Function that takes width and returns a chart
 * @returns {Function}
 */
export function responsiveChart(chartFn) {
  return resize((width) => chartFn(width));
}

/**
 * Build unique sorted months from data array
 * @param {Array} rows - Data rows with month field
 * @param {string} monthField - Name of the month field (default: "month")
 * @returns {Array<Date>}
 */
export function buildUniqueMonths(rows, monthField = "month") {
  return Array.from(new Set(rows.map(d => d[monthField].getTime())))
    .sort((a, b) => b - a)
    .map(ts => new Date(ts));
}

/**
 * Sort data by column and direction
 * @param {Array} data - Data array
 * @param {string} column - Column to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @param {string} textKey - Key for text columns
 * @returns {Array}
 */
export function sortData(data, column, direction, textKey) {
  return [...data].sort((a, b) => {
    let aVal, bVal;
    if (column === textKey) {
      aVal = (a[textKey] || '').toLowerCase();
      bVal = (b[textKey] || '').toLowerCase();
    } else {
      aVal = a[column] || 0;
      bVal = b[column] || 0;
    }
    if (direction === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });
}

/**
 * Format number with locale string
 * @param {number} num - Number to format
 * @returns {string}
 */
export function formatNumber(num) {
  return num.toLocaleString();
}
