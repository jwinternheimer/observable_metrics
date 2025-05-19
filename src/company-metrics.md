---
title: Company Metrics - Buffer Transparent Metrics
---

# Company Key Performance Indicators

This dashboard provides high-level company metrics to track business performance.

```js
// Load data from CSV files
const weeklySignups = FileAttachment("data/company_weekly_signups.csv").csv({typed: true});
const weeklySubscriptions = FileAttachment("data/company_weekly_subscriptions.csv").csv({typed: true});
const weeklyActiveUsers = FileAttachment("data/company_weekly_active_users.csv").csv({typed: true});
const signupsBySource = FileAttachment("data/signups_by_source.csv").csv({typed: true});
const chartmogulMrrEvents = FileAttachment("data/chartmogul_mrr_events.csv").csv({typed: true});
```

```js
Plot.plot({
  title: "Weekly Signups (Last 52 Weeks)",
  y: {
    grid: true,
    label: "New Signups"
  },
  x: {
    label: "Week",
    tickRotate: 45
  },
  color: {
    scheme: "blues"
  },
  marks: [
    // Line for actual data 
    Plot.line(weeklySignups, {
      x: "week",
      y: "signups",
      stroke: "steelblue",
      strokeWidth: 2,
      curve: "natural"
    }),
    // Data points
    Plot.dot(weeklySignups, {
      x: "week",
      y: "signups", 
      fill: "steelblue",
      r: 3,
      tip: true
    }),
    // Linear regression trend line
    Plot.linearRegressionY(weeklySignups, {
      x: "week", 
      y: "signups",
      stroke: "red",
      strokeWidth: 2,
      strokeDasharray: "4 2"
    }),
    Plot.ruleY([0])
  ],
  width: 900,
  height: 400,
  marginBottom: 70,
  marginLeft: 60
})
```

## Weekly Subscription Starts
The plot below shows the number of users that completed the Subscription Started event each week.

```js
Plot.plot({
  title: "Weekly New Subscriptions (Last 52 Weeks)",
  y: {
    grid: true,
    label: "New Customers"
  },
  x: {
    label: "Week",
    tickRotate: 45
  },
  color: {
    scheme: "reds"
  },
  marks: [
    // Line for actual data 
    Plot.line(weeklySubscriptions, {
      x: "week",
      y: "new_customers",
      stroke: "orangered",
      strokeWidth: 2,
      curve: "natural"
    }),
    // Data points
    Plot.dot(weeklySubscriptions, {
      x: "week",
      y: "new_customers", 
      fill: "orangered",
      r: 3,
      tip: true
    }),
    // Linear regression trend line
    Plot.linearRegressionY(weeklySubscriptions, {
      x: "week", 
      y: "new_customers",
      stroke: "darkred",
      strokeWidth: 2,
      strokeDasharray: "4 2"
    }),
    Plot.ruleY([0])
  ],
  width: 900,
  height: 400,
  marginBottom: 70,
  marginLeft: 60
})
```

## MRR Movements
The data below comes from ChartMogul and shows the number of customers that do each MRR movement type each week.

```js
// Simple plot without any filtering
Plot.plot({
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
    }),
    Plot.ruleY([0])
  ],
  width: 900,
  height: 400,
  marginBottom: 70,
  marginLeft: 60
})
```


## Weekly Active Users

This chart shows the weekly active user (WAU) count over the last 52 weeks.

```js
Plot.plot({
  title: "Weekly Active Users (Last 52 Weeks)",
  y: {
    grid: true,
    label: "Active Users"
  },
  x: {
    label: "Week",
    tickRotate: 45
  },
  marks: [
    Plot.lineY(weeklyActiveUsers, {
      x: "week",
      y: "weekly_active_users",
      stroke: "purple",
      strokeWidth: 3,
      marker: "circle"
    }),
    Plot.text(weeklyActiveUsers.filter((d, i) => i % 4 === 0), {
      x: "week",
      y: "weekly_active_users",
      text: d => d.weekly_active_users.toLocaleString(),
      dy: -10
    }),
    Plot.ruleY([0])
  ],
  width: 900,
  height: 400,
  marginBottom: 70,
  marginLeft: 60
})
```