/**
 * Trend indicator component
 * Displays a trend with an up or down arrow and color coding
 */
export function Trend(value, {prefix = "", format = null} = {}) {
  const htl = typeof window !== "undefined" ? window.htl : require("htl");
  
  if (value === undefined || value === null) {
    return htl.html`<span style="display: block; color: var(--theme-foreground-secondary); font-size: 14px;">—</span>`;
  }
  
  const formatted = format 
    ? new Intl.NumberFormat("en-US", format).format(value) 
    : (value * 100).toFixed(1) + "%";
  
  return value >= 0 
    ? htl.html`<span style="color: #28a745; display: block; font-size: 14px;">↑ ${prefix}${formatted}</span>` 
    : htl.html`<span style="color: #dc3545; display: block; font-size: 14px;">↓ ${prefix}${formatted}</span>`;
} 