---
title: Monthly Marketing Report - Buffer Transparent Metrics
---

# Monthly Marketing Metrics

```js
// Load data
const monthlySignupsData = FileAttachment("data/company_monthly_signups.csv").csv({typed: true});
const monthlyFtsData = FileAttachment("data/company_monthly_fts.csv").csv({typed: true});
const monthlyBlogPageviewsData = FileAttachment("data/company_monthly_blog_pageviews.csv").csv({typed: true});
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

// Format Blog Pageviews data
const formattedBlogPageviews = monthlyBlogPageviewsData[12].blog_pageviews.toLocaleString('en-US');

// Calculate month-over-month growth for Blog Pageviews
const momGrowthBlogPageviews = monthlyBlogPageviewsData[11].blog_pageviews 
  ? (monthlyBlogPageviewsData[12].blog_pageviews - monthlyBlogPageviewsData[11].blog_pageviews) / monthlyBlogPageviewsData[11].blog_pageviews 
  : undefined;
```

<div class="grid grid-cols-3">
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
  
  <a class="card" style="color: inherit;">
    <h2>Blog Pageviews</h2>
    <span class="big">${formattedBlogPageviews}</span>
    <span style="display: block; color: ${momGrowthBlogPageviews >= 0 ? '#28a745' : '#dc3545'}; font-size: 14px;">
      ${momGrowthBlogPageviews >= 0 ? '↑' : '↓'} ${(momGrowthBlogPageviews * 100).toFixed(1)}% from last month</span>
  </a>
</div>

```js
function monthlyFtsPlot(width) {
  return Plot.plot({
    title: "Monthly First-Time Sessions (Last 13 Months)",
    y: {
      grid: true,
      label: "First-Time Sessions"
    },
    x: {
      label: "Month",
      tickRotate: 45
    },
    marks: [
      Plot.line(monthlyFtsData, {
        x: "month",
        y: "fts",
        stroke: "steelblue",
        strokeWidth: 3,
        curve: "natural"
      }),
      Plot.dot(monthlyFtsData, {
        x: "month",
        y: "fts",
        fill: "steelblue",
        r: 3,
        tip: {
          format: {
            x: d => new Date(d).toLocaleDateString(),
            y: d => d.toLocaleString()
          }
        }
      })
    ],
    width: width || 1200,
    height: 400,
    marginBottom: 70,
    marginLeft: 60
  });
}

function monthlyBlogPageviewsPlot(width) {
  return Plot.plot({
    title: "Monthly Blog Pageviews (Last 13 Months)",
    y: {
      grid: true,
      label: "Blog Pageviews"
    },
    x: {
      label: "Month",
      tickRotate: 45
    },
    marks: [
      Plot.line(monthlyBlogPageviewsData, {
        x: "month",
        y: "blog_pageviews",
        stroke: "orangered",
        strokeWidth: 3,
        curve: "natural"
      }),
      Plot.dot(monthlyBlogPageviewsData, {
        x: "month",
        y: "blog_pageviews",
        fill: "orangered",
        r: 3,
        tip: {
          format: {
            x: d => new Date(d).toLocaleDateString(),
            y: d => d.toLocaleString()
          }
        }
      })
    ],
    width: width || 1200,
    height: 400,
    marginBottom: 70,
    marginLeft: 60
  });
}
```

## Monthly Trends

<div class="grid grid-cols-2">
  <div class="card">${resize(width => monthlyFtsPlot(width))}</div>
  <div class="card">${resize(width => monthlyBlogPageviewsPlot(width))}</div>
</div>
