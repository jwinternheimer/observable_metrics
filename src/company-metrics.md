---
title: Company Metrics - Buffer Transparent Metrics
---

# Key Business Metrics

This dashboard shows high-level business metrics tracked at Buffer.

```js
const lastQueryTimestamp = await FileAttachment("data/last_query_timestamp.json").json();
const lastRunDate = new Date(lastQueryTimestamp.lastRun).toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
});
```

<div style="margin: 20px 0; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #007bff; font-size: 14px; color: #666;">
  <strong>Data current as of:</strong> ${lastRunDate}
</div>

```js
// Import the xmr component
import {xmrChart} from "./components/xmr.js";

// Load data from CSV files
const weeklySignups = FileAttachment("data/company_weekly_signups.csv").csv({typed: true});
const weeklySubscriptions = FileAttachment("data/company_weekly_subscriptions.csv").csv({typed: true});
const weeklyActiveUsers = FileAttachment("data/company_weekly_active_users.csv").csv({typed: true});
const chartmogulMrrEvents = FileAttachment("data/chartmogul_mrr_events.csv").csv({typed: true});
```

```js
function weeklySignupsPlot(width) {
  return xmrChart({
    metrics: weeklySignups,
    title: "Weekly Signups (Last 52 Weeks)",
    subtitle: "XmR Control Chart with Trend Analysis",
    yField: "signups",
    yLabel: "New Signups",
    dateField: "week",
    showMovingRange: false,
    showTrend: true,
    showSeasonality: true,
    seasonalPeriod: 5 // 13 weeks for quarterly seasonality
  });
}

function weeklyActiveUsersPlot(width) {
  return xmrChart({
    metrics: weeklyActiveUsers,
    title: "Weekly Active Users (Last 52 Weeks)",
    subtitle: "XmR Control Chart with Trend Analysis",
    yField: "weekly_active_users",
    yLabel: "Active Users",
    dateField: "week",
    showMovingRange: false,
    showTrend: true,
    showSeasonality: true,
    seasonalPeriod: 5 // 13 weeks for quarterly seasonality
  });
}

function weeklySubscriptionStartsPlot(width) {
  return xmrChart({
    metrics: weeklySubscriptions,
    title: "Weekly New Subscriptions (Last 52 Weeks)",
    subtitle: "XmR Control Chart with Trend Analysis",
    yField: "new_customers",
    yLabel: "New Customers",
    dateField: "week",
    showMovingRange: false,
    showTrend: true,
    showSeasonality: true,
    seasonalPeriod: 5 // 13 weeks for quarterly seasonality
  });
}

function weeklyMRRMetricsPlot(width) {
  return Plot.plot({
    title: "Weekly MRR Movement Events (Last 52 Weeks)",
    y: {
      grid: true,
      label: "Number of Customers"
    },
    x: {
      label: "Week",
      tickRotate: 45
    },
    color: {
      legend: true
    },
    marks: [
      Plot.line(chartmogulMrrEvents, {
        x: "week",
        y: "customers",
        stroke: "movement_type",
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(chartmogulMrrEvents, {
        x: "week", 
        y: "customers",
        stroke: "movement_type",
        fill: "movement_type",
        r: 3,
        tip: true
      })
    ],
    width: width || 1200,
    height: 400,
    marginBottom: 70,
    marginLeft: 60
  });
}

// XmR Chart Legend
const xmrLegend = html`
  <div style="
    margin: 10px 0 20px 0;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    border-left: 4px solid #007bff;
    font-size: 13px;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ">
    <div style="margin-bottom: 8px;"><strong>Weekly Signups Chart Guide:</strong></div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
      <span><span style="color: steelblue; font-weight: bold; font-size: 16px;">●</span> Normal week (expected variation)</span>
      <span><span style="color: #dc3545; font-weight: bold; font-size: 16px;">●</span> Exceptional week (much higher/lower than expected)</span>
      <span><span style="color: #fd7e14; font-weight: bold; font-size: 16px;">●</span> Potential pattern change (early warning)</span>
      <span><span style="color: #ffc107; font-weight: bold; font-size: 16px;">●</span> Sustained shift (process has changed)</span>
    </div>
  </div>
`;

// Display all plots with custom layout
display(html`
  <div>
    ${xmrLegend}
    
    <!-- Full-width Weekly Signups Chart -->
    <div class="card" style="margin-bottom: 1rem;">
      ${resize(width => weeklySignupsPlot(width))}
    </div>
    
    <!-- Full-width Weekly Active Users Chart -->
    <div class="card" style="margin-bottom: 1rem;">
      ${resize(width => weeklyActiveUsersPlot(width))}
    </div>
    
    <!-- Two-column grid for remaining charts -->
    <div class="grid grid-cols-2">
      <div class="card">${resize(width => weeklySubscriptionStartsPlot(width))}</div>
      <div class="card">${resize(width => weeklyMRRMetricsPlot(width))}</div>
    </div>
  </div>
`);