---
title: Monthly Marketing Report - Buffer Transparent Metrics
---

# Monthly Marketing Metrics

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

```js
// Load signups by source data
const signupsBySource = FileAttachment("data/signups_by_source.csv").csv({typed: true});
```

## Signups by Attribution Source

```js
// Create a function to generate the weekly signups by referrer plot
function weeklySignupsByReferrerPlot(width) {
  // List of referrers
  const referrers = [
    "organic_search", "buffer", "direct", "paid_search", "llm",
    "mobile_ios", "mobile_android", "team_invite", "referral", "social"
  ];

  // Create container
  const container = document.createElement("div");

  // Label
  const label = document.createElement("div");
  label.innerHTML = "<b>Filter by Referrer Source(s):</b> (Hold Ctrl/Cmd to select multiple)";
  label.style.marginBottom = "8px";

  // Multi-select dropdown
  const select = document.createElement("select");
  select.multiple = true;
  select.size = 5;
  select.style.marginBottom = "15px";
  select.style.width = "250px";

  // Add options
  referrers.forEach(ref => {
    const opt = document.createElement("option");
    opt.value = ref;
    opt.textContent = ref;
    opt.selected = true; // All selected by default
    select.appendChild(opt);
  });

  // Plot div
  const plotDiv = document.createElement("div");

  // Add elements to container
  container.appendChild(label);
  container.appendChild(select);
  container.appendChild(plotDiv);

  // Update plot function
  function updatePlot() {
    const selected = Array.from(select.selectedOptions).map(opt => opt.value);
    const filtered = signupsBySource.filter(d => selected.includes(d.referrer));

    const plot = Plot.plot({
      title: `Weekly Signups by Referrer Source (Last 52 Weeks)`,
      y: { grid: true, label: "Signups" },
      x: { label: "Week", tickRotate: 45 },
      color: { legend: true },
      marks: [
        Plot.line(filtered, {
          x: "week",
          y: "signups",
          stroke: "referrer",
          strokeWidth: 2,
          curve: "natural"
        }),
        Plot.dot(filtered, {
          x: "week",
          y: "signups",
          stroke: "referrer",
          fill: "referrer",
          r: 3,
          tip: true
        }),
        Plot.ruleY([0])
      ],
      width: width || 900,
      height: 400,
      marginBottom: 70,
      marginLeft: 60
    });

    plotDiv.innerHTML = "";
    plotDiv.appendChild(plot);
  }

  select.addEventListener("change", updatePlot);
  updatePlot();

  return container;
}
```

<div class="grid">
  <div class="card">${resize(width => weeklySignupsByReferrerPlot(width))}</div>
</div>
