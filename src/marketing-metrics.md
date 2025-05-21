---
title: Marketing Metrics - Buffer Transparent Metrics
---

# Marketing Performance Dashboard

This dashboard tracks key marketing metrics to evaluate channel and campaign performance.

```js
// Load data from CSV files
const signupsBySource = FileAttachment("data/signups_by_source.csv").csv({typed: true});
const bufferTeamPosts = FileAttachment("data/buffer_team_posts.csv").csv({typed: true});
```

## Signups by Referrer Source

Tracking how different referrer sources contribute to signups over time.

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

// Create a function for the Buffer team posts plot
function weeklyBufferPostsPlot(width) {
  return Plot.plot({
    title: "Weekly Buffer Team Posts (Last 52 Weeks)",
    y: { grid: true, label: "Number of Posts" },
    x: { label: "Week", tickRotate: 45 },
    marks: [
      Plot.line(bufferTeamPosts, {
        x: "week",
        y: "posts",
        stroke: "#2C7BB6",
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(bufferTeamPosts, {
        x: "week",
        y: "posts",
        fill: "#2C7BB6",
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
}

// Create a function for the Buffer team engagement plot
function weeklyBufferEngagementPlot(width) {
  return Plot.plot({
    title: "Weekly Buffer Team Post Engagements (Last 52 Weeks)",
    y: { grid: true, label: "Total Engagements" },
    x: { label: "Week", tickRotate: 45 },
    marks: [
      Plot.line(bufferTeamPosts, {
        x: "week",
        y: "total_engagement",
        stroke: "#D7301F",
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(bufferTeamPosts, {
        x: "week",
        y: "total_engagement",
        fill: "#D7301F",
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
}
```

## Buffer Team Content Performance

Tracking the volume and engagement metrics for content posted by the Buffer team.

```js
// Display all plots in a two-column grid
display(html`
  <div class="grid grid-cols-2">
    <div class="grid-colspan-2">${resize(width => weeklySignupsByReferrerPlot(width))}</div>
    <div class="card">${resize(width => weeklyBufferPostsPlot(width))}</div>
    <div class="card">${resize(width => weeklyBufferEngagementPlot(width))}</div>
  </div>
`);
```

<style>
.grid {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-colspan-2 {
  grid-column: span 2 / span 2;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>