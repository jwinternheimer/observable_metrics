import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3@7";
import { resize } from "npm:@observablehq/stdlib";

const NPL_SCALING = 2.66;
const URL_SCALING = 3.268;

function getMovements(data) {
  const movements = [];
  for (let i = 1; i < data.length; i++) {
    movements.push({
      ...data[i],
      movingRange: Math.abs(data[i].value - data[i - 1].value)
    });
  }
  return movements;
}

function calculateLimits(data, movements) {
  const avgX = d3.mean(data, d => d.value);
  const avgMovement = movements.length > 0 ? d3.mean(movements, d => d.movingRange) : 0;

  const delta = NPL_SCALING * avgMovement;
  const UNPL = avgX + delta;
  const LNPL = avgX - delta;
  const URL = URL_SCALING * avgMovement;

  return { avgX, avgMovement, UNPL, LNPL, URL };
}

// Detect trends using linear regression
function detectTrend(data) {
  if (data.length < 6) return null;
  
  const x = data.map((_, i) => i);
  const y = data.map(d => d.value);
  
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumXX = d3.sum(x.map(xi => xi * xi));
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared to determine trend strength
  const yMean = d3.mean(y);
  const totalSumSquares = d3.sum(y.map(yi => Math.pow(yi - yMean, 2)));
  const residualSumSquares = d3.sum(y.map((yi, i) => Math.pow(yi - (slope * x[i] + intercept), 2)));
  const rSquared = 1 - (residualSumSquares / totalSumSquares);
  
  return {
    slope,
    intercept,
    rSquared,
    isSignificant: Math.abs(rSquared) > 0.3, // Threshold for significant trend
    direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
  };
}

// Detect seasonality patterns
function detectSeasonality(data, period = 12) {
  if (data.length < period * 2) return null;
  
  const seasonal = [];
  for (let i = 0; i < period; i++) {
    const values = [];
    for (let j = i; j < data.length; j += period) {
      if (data[j]) values.push(data[j].value);
    }
    if (values.length > 0) {
      seasonal.push({
        period: i,
        average: d3.mean(values),
        variance: d3.variance(values) || 0
      });
    }
  }
  
  return seasonal;
}

// Enhanced detection rules based on xmrit documentation
function detectSpecialCauses(data, limits, trend = null) {
  const { avgX, UNPL, LNPL } = limits;
  
  return data.map((point, index) => {
    const signals = [];
    
    // Calculate trend-adjusted limits for this specific point if trend exists
    let currentUCL, currentLCL, currentCL;
    if (trend && trend.isSignificant) {
      currentCL = trend.slope * index + trend.intercept;
      currentUCL = currentCL + (UNPL - avgX);
      currentLCL = currentCL + (LNPL - avgX);
    } else {
      currentCL = avgX;
      currentUCL = UNPL;
      currentLCL = LNPL;
    }
    
    const quarterUpper = currentCL + (currentUCL - currentCL) / 2;
    const quarterLower = currentCL - (currentCL - currentLCL) / 2;
    
    // Rule 1: Process Limit Rule - Point outside control limits (trend-adjusted)
    if (point.value > currentUCL || point.value < currentLCL) {
      signals.push('limit');
    }
    
    // Rule 2: Quartile Limit Rule - 3 out of 4 consecutive points nearer to limit than center
    if (index >= 3) {
      const last4 = data.slice(index - 3, index + 1);
      const nearLimitCount = last4.filter((p, i) => {
        const idx = index - 3 + i;
        let checkUCL, checkLCL, checkCL;
        if (trend && trend.isSignificant) {
          checkCL = trend.slope * idx + trend.intercept;
          checkUCL = checkCL + (UNPL - avgX);
          checkLCL = checkCL + (LNPL - avgX);
        } else {
          checkCL = avgX;
          checkUCL = UNPL;
          checkLCL = LNPL;
        }
        
        return Math.abs(p.value - checkUCL) < Math.abs(p.value - checkCL) ||
               Math.abs(p.value - checkLCL) < Math.abs(p.value - checkCL);
      }).length;
      
      if (nearLimitCount >= 3) {
        signals.push('quartile');
      }
    }
    
    // Rule 3: Runs of Eight - 8 consecutive points on one side of center line (trend-adjusted)
    if (index >= 7) {
      const last8 = data.slice(index - 7, index + 1);
      const allAbove = last8.every((p, i) => {
        const idx = index - 7 + i;
        const checkCL = trend && trend.isSignificant ? 
          trend.slope * idx + trend.intercept : avgX;
        return p.value > checkCL;
      });
      const allBelow = last8.every((p, i) => {
        const idx = index - 7 + i;
        const checkCL = trend && trend.isSignificant ? 
          trend.slope * idx + trend.intercept : avgX;
        return p.value < checkCL;
      });
      
      if (allAbove || allBelow) {
        signals.push('run8');
      }
    }
    
    return {
      ...point,
      signals,
      hasSignal: signals.length > 0
    };
  });
}

export function xmrChart({
  metrics,
  title,
  subtitle,
  yField,
  yLabel,
  yTransform = d => d,
  dateField = "date",
  showMovingRange = true,
  showTrend = false,
  showSeasonality = false,
  seasonalPeriod = 12
}) {
  return resize((width) => {
    const data = metrics.map(d => ({
      date: d[dateField],
      value: yTransform(typeof yField === "function" ? yField(d) : d[yField])
    })).filter(d => d.value != null && !isNaN(d.value));
    
    const movements = getMovements(data);
    const { avgX, avgMovement, UNPL, LNPL, URL } = calculateLimits(data, movements);
    
         // Detect trends first
     const trend = showTrend ? detectTrend(data) : null;
     
     // Detect special causes with enhanced rules (trend-adjusted)
     const dataWithSignals = detectSpecialCauses(data, { avgX, UNPL, LNPL }, trend);
    
    // Detect seasonality
    const seasonality = showSeasonality ? detectSeasonality(data, seasonalPeriod) : null;
    
    // Calculate quartile lines for visual reference
    const quarterUpper = avgX + (UNPL - avgX) / 2;
    const quarterLower = avgX - (avgX - LNPL) / 2;
    
    const marks = [];
    
    // Control limits - sloped if trend is significant, otherwise horizontal
    if (trend && trend.isSignificant) {
      // Create sloped control limits following the trend
      const trendCenterLine = data.map((d, i) => ({
        date: d.date,
        value: trend.slope * i + trend.intercept
      }));
      
      const trendUCL = data.map((d, i) => ({
        date: d.date,
        value: trend.slope * i + trend.intercept + (UNPL - avgX)
      }));
      
      const trendLCL = data.map((d, i) => ({
        date: d.date,
        value: trend.slope * i + trend.intercept + (LNPL - avgX)
      }));
      
      marks.push(
        // Sloped center line
        Plot.line(trendCenterLine, {
          x: "date",
          y: "value",
          stroke: "green",
          strokeWidth: 2,
          strokeDasharray: "5 5"
        }),
        // Sloped UCL
        Plot.line(trendUCL, {
          x: "date",
          y: "value",
          stroke: "red",
          strokeWidth: 1,
          strokeDasharray: "3 3"
        }),
        // Sloped LCL
        Plot.line(trendLCL, {
          x: "date",
          y: "value",
          stroke: "red",
          strokeWidth: 1,
          strokeDasharray: "3 3"
        })
      );
    } else {
      // Horizontal control limits when no significant trend
      marks.push(
        Plot.ruleY([avgX], {
          stroke: "green",
          strokeWidth: 2,
          strokeDasharray: "5 5"
        }),
        Plot.ruleY([UNPL], {
          stroke: "red",
          strokeWidth: 1,
          strokeDasharray: "3 3"
        }),
        Plot.ruleY([LNPL], {
          stroke: "red",
          strokeWidth: 1,
          strokeDasharray: "3 3"
        })
             );
     }
     
          // Add remaining marks
     marks.push(
       // Quartile lines (dotted)
       Plot.ruleY([quarterUpper, quarterLower], {
         stroke: "gray",
         strokeWidth: 1,
         strokeDasharray: "1 2",
         strokeOpacity: 0.5
       }),
       // Main data line
       Plot.line(dataWithSignals, {
         x: "date",
         y: "value",
         stroke: "steelblue",
         strokeWidth: 1.5
       }),
       // Data points with enhanced coloring
       Plot.dot(dataWithSignals, {
         x: "date",
         y: "value",
         fill: d => {
           if (d.signals.includes('limit')) return "red";
           if (d.signals.includes('quartile')) return "orange";
           if (d.signals.includes('run8')) return "yellow";
           return "steelblue";
         },
         stroke: d => d.hasSignal ? "black" : "none",
         strokeWidth: d => d.hasSignal ? 1 : 0,
         r: 3,
         tip: {
           format: {
             x: d => new Date(d).toLocaleDateString(),
             y: d => d.toFixed(2),
             fill: d => {
               const point = dataWithSignals.find(p => p.value === d);
               if (!point || !point.hasSignal) return "Normal variation";
               return `Special cause: ${point.signals.join(', ')}`;
             }
           }
         }
       }),
               // Labels - positioned on the actual control limit lines (sloped or horizontal)
        Plot.text(
          trend && trend.isSignificant ? [
            { 
              x: d3.max(data, d => d.date),
              y: trend.slope * (data.length - 1) + trend.intercept + (UNPL - avgX), 
              label: `UCL: ${UNPL.toFixed(0)}` 
            },
            { 
              x: d3.max(data, d => d.date),
              y: trend.slope * (data.length - 1) + trend.intercept, 
              label: `CL: ${avgX.toFixed(0)}` 
            },
            { 
              x: d3.max(data, d => d.date),
              y: trend.slope * (data.length - 1) + trend.intercept + (LNPL - avgX), 
              label: `LCL: ${LNPL.toFixed(0)}` 
            }
          ] : [
            { y: UNPL, label: `UCL: ${UNPL.toFixed(0)}` },
            { y: avgX, label: `CL: ${avgX.toFixed(0)}` },
            { y: LNPL, label: `LCL: ${LNPL.toFixed(0)}` }
          ], 
          trend && trend.isSignificant ? {
            x: "x",
            y: "y",
            text: "label",
            textAnchor: "start",
            dx: 8,
            fontSize: 10,
            fill: "black",
            fontWeight: "bold",
            stroke: "white",
            strokeWidth: 2
          } : {
            x: () => d3.max(data, d => d.date),
            y: d => d.y,
            text: d => d.label,
            textAnchor: "start",
            dx: 8,
            fontSize: 10,
            fill: "black",
            fontWeight: "bold",
            stroke: "white",
            strokeWidth: 2
          }
        )
     );
    
    
    
              const xPlot = Plot.plot({
       title,
       subtitle,
       width,
       height: 300,
       marginLeft: 80, // Add extra margin for Y-axis labels
       marginRight: 80, // Add extra margin for control limit labels
       y: {
         label: yLabel,
         grid: true
       },
       marks
     });
    
    if (!showMovingRange) {
      return xPlot;
    }
    
    const mrPlot = Plot.plot({
      title: "Moving Range",
      width,
      height: 200,
      marginLeft: 80, // Add extra margin for Y-axis labels
      marginRight: 80, // Add extra margin for consistency
      y: {
        label: "Moving Range",
        grid: true
      },
      marks: [
        Plot.ruleY([avgMovement], {
          stroke: "green",
          strokeWidth: 2,
          strokeDasharray: "5 5"
        }),
        Plot.ruleY([URL], {
          stroke: "red",
          strokeWidth: 1,
          strokeDasharray: "3 3"
        }),
        Plot.line(movements, {
          x: "date",
          y: "movingRange",
          stroke: "orange",
          strokeWidth: 1.5
        }),
        Plot.dot(movements, {
          x: "date",
          y: "movingRange",
          fill: d => d.movingRange > URL ? "red" : "orange",
          r: 3,
          tip: true
        }),
        Plot.text([
          { y: avgMovement, label: `CL: ${avgMovement.toFixed(2)}` },
          { y: URL, label: `UCL: ${URL.toFixed(2)}` }
        ], {
          x: () => d3.max(movements, d => d.date),
          y: d => d.y,
          text: d => d.label,
          textAnchor: "start",
          dx: 5,
          fontSize: 10,
          fill: "black"
        })
      ]
    });
    
    const container = document.createElement("div");
    
    // Add legend/explanation above the chart
    const legend = document.createElement("div");
    legend.className = "xmr-legend";
    legend.style.cssText = `
      margin: 10px 0;
      padding: 12px 16px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      border-left: 4px solid #007bff;
      font-size: 13px;
      line-height: 1.5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: block;
      width: 100%;
      box-sizing: border-box;
    `;
    legend.innerHTML = `
      <div style="margin-bottom: 6px;"><strong>XmR Chart Signal Detection:</strong></div>
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        <span><span style="color: steelblue; font-weight: bold; font-size: 16px;">●</span> Normal variation</span>
        <span><span style="color: #dc3545; font-weight: bold; font-size: 16px;">●</span> Outside control limits</span>
        <span><span style="color: #fd7e14; font-weight: bold; font-size: 16px;">●</span> Quartile rule (3/4 near limits)</span>
        <span><span style="color: #ffc107; font-weight: bold; font-size: 16px;">●</span> Runs of eight (systematic shift)</span>
      </div>
    `;
    
    container.appendChild(legend);
    container.appendChild(xPlot);
    container.appendChild(mrPlot);
    
    // Add seasonality chart if requested
    if (showSeasonality && seasonality) {
      const seasonalPlot = Plot.plot({
        title: `Seasonal Pattern (Period: ${seasonalPeriod})`,
        width,
        height: 150,
        x: { label: "Period" },
        y: { label: "Average Value", grid: true },
        marks: [
          Plot.line(seasonality, {
            x: "period",
            y: "average",
            stroke: "green",
            strokeWidth: 2
          }),
          Plot.dot(seasonality, {
            x: "period",
            y: "average",
            fill: "green",
            r: 3,
            tip: true
          })
        ]
      });
      container.appendChild(seasonalPlot);
    }
    
    return container;
  });
}