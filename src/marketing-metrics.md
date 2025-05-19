---
title: Marketing Metrics - Buffer Transparent Metrics
---

# Marketing Performance Dashboard

This dashboard tracks key marketing metrics to evaluate channel and campaign performance.

```js
// Load data from CSV files
const channelPerformance = FileAttachment("data/marketing_channel_performance.csv").csv({typed: true});
const campaignConversion = FileAttachment("data/marketing_campaign_conversion.csv").csv({typed: true});
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

## Marketing Channel Performance

Tracking user acquisition and revenue by marketing channel over the last 6 months.

```js
// Prepare data for stacked bar chart - pivot by month
function prepareChannelData() {
  // Get unique months and channels
  const months = [...new Set(channelPerformance.map(d => d.month))].sort();
  const channels = [...new Set(channelPerformance.map(d => d.channel))];
  
  // Create a lookup map for faster access
  const dataMap = new Map();
  channelPerformance.forEach(d => {
    dataMap.set(`${d.month}-${d.channel}`, d);
  });
  
  // Create dataset with one row per month
  return months.map(month => {
    const row = { month };
    channels.forEach(channel => {
      const data = dataMap.get(`${month}-${channel}`);
      row[`${channel}_users`] = data ? data.new_users : 0;
      row[`${channel}_revenue`] = data ? data.revenue : 0;
    });
    return row;
  });
}

const pivotedChannelData = prepareChannelData();

// Stacked bar chart for new users by channel
Plot.plot({
  title: "New Users by Marketing Channel",
  y: {
    grid: true,
    label: "New Users"
  },
  x: {
    label: "Month",
    tickRotate: 45
  },
  color: {
    legend: true
  },
  marks: [
    Plot.barY(channelPerformance, {
      x: "month",
      y: "new_users",
      fill: "channel",
      tip: true,
      stack: true
    }),
    Plot.ruleY([0])
  ],
  width: 900,
  height: 400,
  marginBottom: 70
})
```

## Revenue by Channel

```js
// Line chart for revenue by channel
Plot.plot({
  title: "Revenue by Marketing Channel",
  y: {
    grid: true,
    label: "Revenue ($)",
    transform: d => d / 1000 // Display in thousands
  },
  x: {
    label: "Month",
    tickRotate: 45
  },
  color: {
    legend: true
  },
  marks: [
    Plot.line(channelPerformance, {
      x: "month",
      y: "revenue",
      stroke: "channel",
      strokeWidth: 2,
      marker: "circle",
      tip: true
    }),
    Plot.ruleY([0])
  ],
  width: 900,
  height: 400,
  marginBottom: 70
})
```

## Channel Effectiveness

Comparing new users vs. revenue across different marketing channels.

```js
// Aggregate channel data across all months
function aggregateChannelData() {
  const channels = [...new Set(channelPerformance.map(d => d.channel))];
  const result = [];
  
  channels.forEach(channel => {
    const channelData = channelPerformance.filter(d => d.channel === channel);
    const totalUsers = d3.sum(channelData, d => d.new_users);
    const totalRevenue = d3.sum(channelData, d => d.revenue);
    const averageRevenuePerUser = totalRevenue / totalUsers;
    
    result.push({
      channel,
      total_users: totalUsers,
      total_revenue: totalRevenue,
      revenue_per_user: averageRevenuePerUser
    });
  });
  
  return result.sort((a, b) => b.revenue_per_user - a.revenue_per_user);
}

const aggregatedChannelData = aggregateChannelData();

// Create bubble chart
Plot.plot({
  title: "Channel Effectiveness (Size = Total Revenue)",
  grid: true,
  y: {
    label: "Revenue per User ($)"
  },
  x: {
    label: "Total New Users (thousands)",
    transform: d => d / 1000 // Display in thousands
  },
  marks: [
    Plot.dot(aggregatedChannelData, {
      x: "total_users",
      y: "revenue_per_user",
      r: d => Math.sqrt(d.total_revenue) / 20,
      fill: "channel",
      fillOpacity: 0.7,
      stroke: "black",
      strokeOpacity: 0.3,
      tip: true
    }),
    Plot.text(aggregatedChannelData, {
      x: "total_users",
      y: "revenue_per_user",
      text: "channel",
      dy: -15
    })
  ],
  width: 900,
  height: 500
})
```

## Campaign Conversion Metrics

```js
// Sort campaigns by conversion rate
const sortedCampaigns = [...campaignConversion].sort((a, b) => b.conversion_rate - a.conversion_rate);

// Create bar chart for conversion rates
Plot.plot({
  title: "Campaign Conversion Rates",
  x: {
    grid: true,
    label: "Conversion Rate (%)"
  },
  y: {
    label: ""
  },
  color: {
    range: ["steelblue"]
  },
  marks: [
    Plot.barX(sortedCampaigns, {
      y: "campaign_name",
      x: "conversion_rate",
      fill: "steelblue",
      sort: {y: "-x"}
    }),
    Plot.text(sortedCampaigns, {
      y: "campaign_name",
      x: "conversion_rate",
      text: d => d.conversion_rate + "%",
      dx: 5,
      textAnchor: "start"
    })
  ],
  width: 900,
  height: 400,
  marginLeft: 150
})
```

## Campaign Performance Table

```js
// Calculate derived metrics
const campaignsWithCost = campaignConversion.map(campaign => {
  // Assuming these are calculated from backend data
  const costPerClick = Math.round((campaign.clicks > 0 ? (campaign.impressions * 0.01) / campaign.clicks : 0) * 100) / 100;
  const costPerSignup = Math.round((campaign.signups > 0 ? (campaign.clicks * costPerClick) / campaign.signups : 0) * 100) / 100;
  
  return {
    ...campaign,
    cpc: costPerClick,
    cpa: costPerSignup
  };
});

Inputs.table(campaignsWithCost, {
  columns: [
    "campaign_name",
    "impressions",
    "clicks",
    "signups",
    "ctr",
    "conversion_rate",
    "cpc",
    "cpa"
  ],
  header: {
    campaign_name: "Campaign",
    impressions: "Impressions",
    clicks: "Clicks",
    signups: "Signups",
    ctr: "CTR (%)",
    conversion_rate: "Conv. Rate (%)",
    cpc: "Cost per Click ($)",
    cpa: "Cost per Signup ($)"
  },
  width: {
    campaign_name: 250,
    impressions: 100,
    clicks: 100,
    signups: 100,
    ctr: 90,
    conversion_rate: 120,
    cpc: 120,
    cpa: 150
  },
  format: {
    impressions: d => d.toLocaleString(),
    clicks: d => d.toLocaleString(),
    signups: d => d.toLocaleString()
  }
})
``` 