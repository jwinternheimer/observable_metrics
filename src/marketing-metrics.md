---
title: Marketing Metrics - Buffer Transparent Metrics
---

# Marketing Performance Dashboard

This dashboard tracks key marketing metrics to evaluate channel and campaign performance.

```js
// Load data from CSV files
const signupsBySource = FileAttachment("data/signups_by_source.csv").csv({typed: true});
```

## Signups by Referrer Source

Tracking how different referrer sources contribute to signups over time.

```js
(() => {
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
      width: 900,
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
})()
```