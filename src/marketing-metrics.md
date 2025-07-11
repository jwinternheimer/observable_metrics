---
title: Team of Creators Dashboard - Buffer Transparent Metrics
---

# Team of Creators Dashboard

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
// Load data from CSV files - using consolidated query data
const bufferTeamPosts = FileAttachment("data/buffer_team_posts.csv").csv({typed: true});
const bufferTeamMonthlyEngagement = FileAttachment("data/buffer_team_monthly_engagement.csv").csv({typed: true});
const bufferTeamWeeklyActiveMembers = FileAttachment("data/buffer_team_weekly_active_members.csv").csv({typed: true});
const bufferTeamWeeklyMedianPosts = FileAttachment("data/buffer_team_weekly_median_posts.csv").csv({typed: true});
```

```js
// Create a function for the weekly active team members plot
function activeTeamMembersPlot(width) {
  return Plot.plot({
    title: "Active Team Members",
    y: { grid: true, label: "Number of Active Members" },
    x: { label: "Week", tickRotate: 45 },
    marks: [
      Plot.line(bufferTeamWeeklyActiveMembers, {
        x: "week",
        y: "active_team_members",
        stroke: "#2ECC71",
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(bufferTeamWeeklyActiveMembers, {
        x: "week",
        y: "active_team_members",
        fill: "#2ECC71",
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

// Create a function for the Buffer team posts plot
function totalTeamPostsPlot(width) {
  return Plot.plot({
    title: "Total Team Posts",
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

// Create a function for the median posts per team member plot
function medianPostsPerMemberPlot(width) {
  return Plot.plot({
    title: "Median Posts Per Team Member",
    y: { grid: true, label: "Median Posts per Member" },
    x: { label: "Week", tickRotate: 45 },
    marks: [
      Plot.line(bufferTeamWeeklyMedianPosts, {
        x: "week",
        y: "median_posts_per_member",
        stroke: "#9B59B6",
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(bufferTeamWeeklyMedianPosts, {
        x: "week",
        y: "median_posts_per_member",
        fill: "#9B59B6",
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

// Create a function for the Buffer team reach plot
function totalTeamReachPlot(width) {
  return Plot.plot({
    title: "Total Team Reach",
    y: { grid: true, label: "Total Reach" },
    x: { label: "Week", tickRotate: 45 },
    marks: [
      Plot.line(bufferTeamPosts, {
        x: "week",
        y: "total_reach",
        stroke: "#D7301F",
        strokeWidth: 2,
        curve: "natural"
      }),
      Plot.dot(bufferTeamPosts, {
        x: "week",
        y: "total_reach",
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
    <div class="card">${resize(width => activeTeamMembersPlot(width))}</div>
    <div class="card">${resize(width => totalTeamPostsPlot(width))}</div>
    <div class="card">${resize(width => medianPostsPerMemberPlot(width))}</div>
    <div class="card">${resize(width => totalTeamReachPlot(width))}</div>
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
    views: acc.views + (d.views || 0),
    current_streak_sum: acc.current_streak_sum + (d.current_streak || 0),
    count: acc.count + 1
  }), {
    posts: 0,
    likes: 0,
    reposts: 0,
    comments_and_replies: 0,
    reach: 0,
    impressions: 0,
    views: 0,
    current_streak_sum: 0,
    count: 0
  });
  
  // Calculate average streak for totals row
  totals.current_streak_avg = totals.count > 0 ? Math.round(totals.current_streak_sum / totals.count) : 0;

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
            <th class="metric-header sortable" data-column="current_streak">
              Current Streak ${getSortIcon('current_streak')}
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
              <td class="metric-cell">${d.current_streak.toLocaleString()}</td>
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
            <td class="metric-cell"><strong>${totals.current_streak_avg} (avg)</strong></td>
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
  padding: 12px 8px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  box-sizing: border-box;
}

.engagement-table .metric-header,
.engagement-table .metric-cell {
  padding-left: 8px !important;
  padding-right: 8px !important;
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
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}

.metric-header {
  text-align: right;
  width: 125px !important;
  min-width: 125px !important;
  max-width: 125px !important;
}

.engagement-table tbody tr:hover {
  background-color: #f8f9fa;
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

.metric-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  width: 125px !important;
  min-width: 125px !important;
  max-width: 125px !important;
  white-space: nowrap;
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