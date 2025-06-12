---
title: Marketing Metrics - Buffer Transparent Metrics
---

# Marketing Performance Dashboard

This dashboard tracks key marketing metrics to evaluate channel and campaign performance.

```js
// Load data from CSV files
const signupsBySource = FileAttachment("data/signups_by_source.csv").csv({typed: true});
const bufferTeamPosts = FileAttachment("data/buffer_team_posts.csv").csv({typed: true});
const bufferTeamMonthlyEngagement = FileAttachment("data/buffer_team_monthly_engagement.csv").csv({typed: true});
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

```js
// Get current month and year for the title
const currentDate = new Date();
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentMonth = monthNames[currentDate.getMonth()];
const currentYear = currentDate.getFullYear();
```

<div class="section-header">
  <h2>Buffer Team Monthly Engagement - ${currentMonth} ${currentYear}</h2>
</div>

```js
function bufferTeamEngagementTable() {
  // Sort state
  let sortColumn = 'likes'; // Default sort by likes
  let sortDirection = 'desc'; // Default to descending
  
  // Calculate totals
  const totals = bufferTeamMonthlyEngagement.reduce((acc, d) => ({
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
      
      if (column === 'name') {
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
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
    const sortedData = sortData(bufferTeamMonthlyEngagement, sortColumn, sortDirection);
    
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
              Team Member ${getSortIcon('name')}
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
          sortDirection = column === 'name' ? 'asc' : 'desc'; // Default to asc for names, desc for numbers
        }
        render();
      });
    });
  }
  
  render();
  return container;
}

display(bufferTeamEngagementTable());
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

.engagement-table {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.engagement-table table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  margin: 0;
  table-layout: fixed;
}

.engagement-table table thead,
.engagement-table table tbody,
.engagement-table table tfoot {
  display: table-header-group;
}

.engagement-table table tbody {
  display: table-row-group;
}

.engagement-table table tfoot {
  display: table-footer-group;
}

.engagement-table th,
.engagement-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
}

.engagement-table thead {
  display: table-header-group;
}

.engagement-table tfoot {
  display: table-footer-group;
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

.engagement-table th.sortable:active {
  background-color: #dee2e6;
}

.team-member-header {
  text-align: left;
  width: 250px;
  min-width: 250px;
}

.metric-header {
  text-align: right;
  width: 100px;
  min-width: 100px;
}

.engagement-table tbody tr:hover {
  background-color: #f8f9fa;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  width: 250px;
  min-width: 250px;
}

.metric-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  width: 100px;
  min-width: 100px;
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

.name {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-header {
  margin: 2rem 0 1rem 0;
}

.section-header h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.section-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
</style>