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
// Load data and fix date parsing to avoid timezone issues
const monthlySignupsRaw = await FileAttachment("data/company_monthly_signups.csv").csv();
const monthlySignupsData = monthlySignupsRaw.map(d => ({
  ...d,
  month: new Date(d.month + "T00:00:00"),
  signups: +d.signups
}));

const monthlyFtsRaw = await FileAttachment("data/company_monthly_fts.csv").csv();
const monthlyFtsData = monthlyFtsRaw.map(d => ({
  ...d,
  month: new Date(d.month + "T00:00:00"),
  fts: +d.fts
}));

const monthlyBlogPageviewsRaw = await FileAttachment("data/company_monthly_blog_pageviews.csv").csv();
const monthlyBlogPageviewsData = monthlyBlogPageviewsRaw.map(d => ({
  ...d,
  month: new Date(d.month + "T00:00:00"),
  blog_pageviews: +d.blog_pageviews
}));

const blogAssistedSignupsRaw = await FileAttachment("data/blog_assisted_signups.csv").csv();
const blogAssistedSignupsData = blogAssistedSignupsRaw.map(d => ({
  month: new Date(d.month + "T00:00:00"),
  sessions: +d.sessions
}));

const bufferChannelPerformanceRaw = await FileAttachment("data/buffer-channel-monthly-performance.csv").csv();
const bufferChannelPerformance = bufferChannelPerformanceRaw.map(d => ({
  service: d.service,
  name: d.name,
  avatar: d.avatar,
  posts: +d.posts,
  likes: +d.likes,
  reposts: +d.reposts,
  comments_and_replies: +d.comments_and_replies,
  reach: +d.reach,
  impressions: +d.impressions,
  views: +d.views
}));
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

function blogAssistedSignupsPlot(width) {
  return Plot.plot({
    title: "Monthly Blog Assisted Signups (Last 13 Months)",
    y: {
      grid: true,
      label: "Sessions"
    },
    x: {
      label: "Month",
      tickRotate: 45
    },
    marks: [
      Plot.line(blogAssistedSignupsData, {
        x: "month",
        y: "sessions",
        stroke: "darkgreen",
        strokeWidth: 3,
        curve: "natural"
      }),
      Plot.dot(blogAssistedSignupsData, {
        x: "month",
        y: "sessions",
        fill: "darkgreen",
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

<div class="grid grid-cols-3">
  <div class="card">${resize(width => monthlyFtsPlot(width))}</div>
  <div class="card">${resize(width => monthlyBlogPageviewsPlot(width))}</div>
  <div class="card">${resize(width => blogAssistedSignupsPlot(width))}</div>
</div>

```js
// Load signups by source data
const signupsBySourceRaw = await FileAttachment("data/signups_by_source.csv").csv();
const signupsBySource = signupsBySourceRaw.map(d => ({
  month: new Date(d.month + "T00:00:00"), // Parse as local date to avoid timezone shift
  referrer: d.referrer,
  signups: +d.signups
}));
```

## Signups by Attribution Source

```js
// Create a function to generate the monthly signups by referrer plot
function monthlySignupsByReferrerPlot(width) {
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
      title: `Monthly Signups by Referrer Source (Last 13 Months)`,
      y: { grid: true, label: "Signups" },
      x: { label: "Month", tickRotate: 45 },
      color: { legend: true },
      marks: [
        Plot.line(filtered, {
          x: "month",
          y: "signups",
          stroke: "referrer",
          strokeWidth: 2,
          curve: "natural"
        }),
        Plot.dot(filtered, {
          x: "month",
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

function bufferChannelPerformanceTable() {
  // Sort state
  let sortColumn = 'likes'; // Default sort by likes
  let sortDirection = 'desc'; // Default to descending
  
  // Calculate totals
  const totals = bufferChannelPerformance.reduce((acc, d) => ({
    posts: acc.posts + (d.posts || 0),
    likes: acc.likes + (d.likes || 0),
    reposts: acc.reposts + (d.reposts || 0),
    comments_and_replies: acc.comments_and_replies + (d.comments_and_replies || 0),
    reach: acc.reach + (d.reach || 0),
    impressions: acc.impressions + (d.impressions || 0),
    views: acc.views + (d.views || 0)
  }), {
    posts: 0,
    likes: 0,
    reposts: 0,
    comments_and_replies: 0,
    reach: 0,
    impressions: 0,
    views: 0
  });

  // Sort function
  function sortData(data, column, direction) {
    return [...data].sort((a, b) => {
      let aVal, bVal;
      
      if (column === 'name' || column === 'service') {
        aVal = (a[column] || '').toLowerCase();
        bVal = (b[column] || '').toLowerCase();
      } else {
        aVal = a[column] || 0;
        bVal = b[column] || 0;
      }
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }

  // Create container div
  const container = document.createElement("div");
  container.className = "engagement-table";

  function render() {
    const sortedData = sortData(bufferChannelPerformance, sortColumn, sortDirection);
    
    const getSortIcon = (column) => {
      if (sortColumn !== column) return '↕️';
      return sortDirection === 'asc' ? '↑' : '↓';
    };

    container.innerHTML = '';
    const table = html`
      <table>
        <thead>
          <tr>
            <th class="team-member-header sortable" data-column="name">
              Channel ${getSortIcon('name')}
            </th>
            <th class="metric-header sortable" data-column="service">
              Service ${getSortIcon('service')}
            </th>
            <th class="metric-header sortable" data-column="posts">
              Posts ${getSortIcon('posts')}
            </th>
            <th class="metric-header sortable" data-column="likes">
              Likes ${getSortIcon('likes')}
            </th>
            <th class="metric-header sortable" data-column="reposts">
              Reposts ${getSortIcon('reposts')}
            </th>
            <th class="metric-header sortable" data-column="comments_and_replies">
              Comments & Replies ${getSortIcon('comments_and_replies')}
            </th>
            <th class="metric-header sortable" data-column="reach">
              Reach ${getSortIcon('reach')}
            </th>
            <th class="metric-header sortable" data-column="impressions">
              Impressions ${getSortIcon('impressions')}
            </th>
            <th class="metric-header sortable" data-column="views">
              Views ${getSortIcon('views')}
            </th>
          </tr>
        </thead>
        <tbody>
          ${sortedData.map(d => html`
            <tr>
              <td class="team-member">
                ${d.avatar ? html`<img src="${d.avatar}" alt="${d.name}" class="avatar">` : html`<div class="avatar-placeholder">${d.name ? d.name.charAt(0).toUpperCase() : '?'}</div>`}
                <span class="name">${d.name}</span>
              </td>
              <td class="metric-cell">${d.service}</td>
              <td class="metric-cell">${d.posts.toLocaleString()}</td>
              <td class="metric-cell">${d.likes.toLocaleString()}</td>
              <td class="metric-cell">${d.reposts.toLocaleString()}</td>
              <td class="metric-cell">${d.comments_and_replies.toLocaleString()}</td>
              <td class="metric-cell">${d.reach.toLocaleString()}</td>
              <td class="metric-cell">${d.impressions.toLocaleString()}</td>
              <td class="metric-cell">${d.views.toLocaleString()}</td>
            </tr>
          `)}
        </tbody>
        <tfoot>
          <tr class="totals-row">
            <td class="team-member"><strong>TOTALS</strong></td>
            <td class="metric-cell"><strong>All Channels</strong></td>
            <td class="metric-cell"><strong>${totals.posts.toLocaleString()}</strong></td>
            <td class="metric-cell"><strong>${totals.likes.toLocaleString()}</strong></td>
            <td class="metric-cell"><strong>${totals.reposts.toLocaleString()}</strong></td>
            <td class="metric-cell"><strong>${totals.comments_and_replies.toLocaleString()}</strong></td>
            <td class="metric-cell"><strong>${totals.reach.toLocaleString()}</strong></td>
            <td class="metric-cell"><strong>${totals.impressions.toLocaleString()}</strong></td>
            <td class="metric-cell"><strong>${totals.views.toLocaleString()}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;
    
    container.appendChild(table);
    
    // Add click handlers to sortable headers
    container.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => {
        const column = header.dataset.column;
        if (sortColumn === column) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = column;
          sortDirection = (column === 'name' || column === 'service') ? 'asc' : 'desc'; // Default to asc for text, desc for numbers
        }
        render();
      });
    });
  }
  
  render();
  return container;
}
```

<div class="grid">
  <div class="card">${resize(width => monthlySignupsByReferrerPlot(width))}</div>
</div>

## Buffer Channel Monthly Performance

<style>
.engagement-table {
  margin: 1rem 0;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.engagement-table table {
  width: 100%;
  min-width: 1075px;
  border-collapse: collapse;
  background-color: white;
  margin: 0;
  table-layout: fixed;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}

.team-member-header {
  text-align: left;
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}

.name {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  width: 125px !important;
  min-width: 125px !important;
  max-width: 125px !important;
  white-space: nowrap;
}

.metric-header {
  text-align: right;
  width: 125px !important;
  min-width: 125px !important;
  max-width: 125px !important;
}

.engagement-table .metric-header,
.engagement-table .metric-cell {
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.engagement-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
}

.engagement-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.engagement-table th.sortable:hover {
  background-color: #e9ecef;
}

.engagement-table tbody tr:hover {
  background-color: #f8f9fa;
}

.engagement-table th,
.engagement-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  box-sizing: border-box;
}

.totals-row {
  background-color: #f8f9fa !important;
  border-top: 2px solid #dee2e6 !important;
}

.totals-row td {
  border-bottom: none !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  font-weight: bold;
}
</style>

<div class="grid">
  <div class="card" style="overflow-x: auto;">
    ${bufferChannelPerformanceTable()}
  </div>
</div>
