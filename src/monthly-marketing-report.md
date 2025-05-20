---
title: Monthly Marketing Report - Buffer Transparent Metrics
---

# Monthly Marketing Metrics

```js
// Load data
const monthlySignupsData = FileAttachment("data/company_monthly_signups.csv").csv({typed: true});
const monthlyFtsData = FileAttachment("data/company_monthly_fts.csv").csv({typed: true});
```

```js
// Parse the date and add one day to compensate for timezone shift
const dateObj = new Date(monthlySignupsData[12].month);
dateObj.setDate(dateObj.getDate() + 1); // Add one day
const date = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// Format the signups number with commas
const formattedSignups = monthlySignupsData[12].signups.toLocaleString('en-US');

// Calculate month-over-month growth for signups
const momGrowth = monthlySignupsData[11].signups 
  ? (monthlySignupsData[12].signups - monthlySignupsData[11].signups) / monthlySignupsData[11].signups 
  : undefined;

// Format FTS data
const formattedFts = monthlyFtsData[12].fts.toLocaleString('en-US');

// Calculate month-over-month growth for FTS
const momGrowthFts = monthlyFtsData[11].fts 
  ? (monthlyFtsData[12].fts - monthlyFtsData[11].fts) / monthlyFtsData[11].fts 
  : undefined;
```

<div class="grid grid-cols-4">
  <a class="card" style="color: inherit;">
    <h2>Signups</h2>
    <span class="big">${formattedSignups}</span>
    <span style="display: block; color: ${momGrowth >= 0 ? '#28a745' : '#dc3545'}; font-size: 14px;">
      ${momGrowth >= 0 ? '↑' : '↓'} ${(momGrowth * 100).toFixed(1)}% from last month</span>
  </a>
  
  <a class="card" style="color: inherit;">
    <h2>First-Time Sessions</h2>
    <span class="big">${formattedFts}</span>
    <span style="display: block; color: ${momGrowthFts >= 0 ? '#28a745' : '#dc3545'}; font-size: 14px;">
      ${momGrowthFts >= 0 ? '↑' : '↓'} ${(momGrowthFts * 100).toFixed(1)}% from last month</span>
  </a>
</div>
