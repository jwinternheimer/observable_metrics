---
title: Brand Reach Dashboard - Buffer Transparent Metrics
---

# Brand Reach Dashboard

```js
const lastQueryTimestamp = await FileAttachment("data/last_query_timestamp.json").json();
const lastRunDate = new Date(lastQueryTimestamp.lastRun).toLocaleString('en-US', { 
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
});
```

<div style="margin: 20px 0; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #007bff; font-size: 14px; color: #666;">
  <strong>Data current as of:</strong> ${lastRunDate}
</div>

```js
const brandWeeklyReachRaw = await FileAttachment("data/brand_weekly_reach.csv").csv();
function parseWeekString(s) {
  if (!s) return new Date(NaN);
  // If already ISO with time component, use as-is; otherwise add midnight UTC
  return new Date(s.includes('T') ? s : (s + 'T00:00:00Z'));
}
const brandWeeklyReach = brandWeeklyReachRaw.map(d => ({
  week: parseWeekString(String(d.week)),
  source: d.source,
  metric: d.metric,
  value: +d.value
})).sort((a,b) => a.week - b.week);

// Filter to 2025 onwards
const startOf2025 = new Date('2025-01-01T00:00:00Z');
const brandWeeklyReachFiltered = brandWeeklyReach.filter(d => d.week >= startOf2025);

// Load Press/PR mentions weekly reach and merge as a new source "PR"
const pressRaw = await FileAttachment("data/press_reach.csv").csv({typed: false});
function parsePressDate(s) {
  if (!s) return new Date(NaN);
  const m = String(s).trim();
  // Exclude month summary rows like "January", "February", etc.
  if (/^[A-Za-z]+$/.test(m)) return new Date(NaN);
  // Expect formats like 5-Feb-2025, 11-Feb-2025, 3-Apri-2025
  const match = m.match(/^(\d{1,2})-([A-Za-z]{3,9})-(\d{4})$/);
  if (!match) return new Date(NaN);
  const day = parseInt(match[1], 10);
  const monStr = match[2].toLowerCase();
  let year = parseInt(match[3], 10);
  const monthIndexLookup = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const key = monStr.length >= 3 ? monStr.slice(0, 3) : monStr;
  const monthIndex = monthIndexLookup[key] ?? (monStr === 'apri' ? 3 : undefined);
  if (monthIndex == null) return new Date(NaN);
  // Normalize any non-2025 dates to 2025 per dataset constraints
  if (year !== 2025) year = 2025;
  return new Date(Date.UTC(year, monthIndex, day));
}
function toSundayUTC(date) {
  if (!(date instanceof Date) || Number.isNaN(date)) return new Date(NaN);
  const dow = date.getUTCDay();
  const sunday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dow));
  return sunday;
}
function getColumnValue(row, wantedNameLowerTrim) {
  const keys = Object.keys(row);
  for (const k of keys) {
    const norm = String(k).toLowerCase().trim();
    if (norm === wantedNameLowerTrim) return row[k];
  }
  return undefined;
}
function parsePressDateFromRow(row) {
  const keys = Object.keys(row);
  const firstKey = keys[0];
  return parsePressDate(row[firstKey]);
}
const pressWeekly = pressRaw
  .map(r => {
    const parsed = parsePressDateFromRow(r);
    const week = toSundayUTC(parsed);
    const reachCandidate = getColumnValue(r, 'reach');
    const reachRaw = (reachCandidate ?? "").toString().replace(/,/g, '').trim();
    const hasNumber = /^(?:\d+)(?:\.\d+)?$/.test(reachRaw);
    const value = hasNumber ? +reachRaw : NaN;
    return { week, source: "PR", metric: "press_reach", value };
  })
  .filter(d => !Number.isNaN(d.week) && d.week >= startOf2025 && Number.isFinite(d.value));

// Merge PR with existing sources
const brandWeeklyReachAll = brandWeeklyReachFiltered.concat(pressWeekly).sort((a,b) => a.week - b.week);

const colorDomain = ["blog", "buffer_accounts", "buffer_team", "PR"];
const colorRange = ["#1f77b4", "#ff7f0e", "#2ca02c", "#9467bd"];
```

```js
// Compute weekly totals across sources (including PR)
const brandWeeklyTotals = (() => {
  const totalsMap = new Map();
  for (const d of brandWeeklyReachAll) {
    const ts = d.week.getTime();
    totalsMap.set(ts, (totalsMap.get(ts) || 0) + (d.value || 0));
  }
  return Array.from(totalsMap, ([ts, total]) => ({ week: new Date(Number(ts)), total })).sort((a,b) => a.week - b.week);
})();

// Controls
const controlsContainer = document.createElement('div');
controlsContainer.style.margin = '0 0 12px 0';
controlsContainer.style.display = 'flex';
controlsContainer.style.gap = '16px';
controlsContainer.style.alignItems = 'center';

const chartTypeSelect = document.createElement('select');
chartTypeSelect.innerHTML = `<option value="line">Line</option><option value="stacked">Stacked Area</option>`;
chartTypeSelect.value = 'line';

const showTotalLabel = document.createElement('label');
showTotalLabel.style.display = 'inline-flex';
showTotalLabel.style.alignItems = 'center';
showTotalLabel.style.gap = '6px';
const showTotalCheckbox = document.createElement('input');
showTotalCheckbox.type = 'checkbox';
showTotalCheckbox.checked = true;
showTotalLabel.appendChild(showTotalCheckbox);
showTotalLabel.appendChild(document.createTextNode('Show total overlay'));

const chartTypeLabel = document.createElement('label');
chartTypeLabel.style.display = 'inline-flex';
chartTypeLabel.style.alignItems = 'center';
chartTypeLabel.style.gap = '6px';
chartTypeLabel.appendChild(document.createTextNode('Chart type'));
chartTypeLabel.appendChild(chartTypeSelect);

controlsContainer.appendChild(chartTypeLabel);
controlsContainer.appendChild(showTotalLabel);

const plotContainer = document.createElement('div');
plotContainer.className = 'card';

function renderBrandReachPlot() {
  plotContainer.innerHTML = '';
  const width = plotContainer.getBoundingClientRect().width || 900;
  const type = chartTypeSelect.value;
  const showTotal = !!showTotalCheckbox.checked;

  const marks = [];
  if (type === 'line') {
    marks.push(
      Plot.line(brandWeeklyReachAll, {
        x: 'week',
        y: 'value',
        stroke: 'source',
        strokeWidth: 2,
        curve: 'natural',
        z: 'source'
      }),
      Plot.dot(brandWeeklyReachAll, {
        x: 'week',
        y: 'value',
        fill: 'source',
        r: 2,
        tip: true,
        z: 'source'
      })
    );
  } else {
    marks.push(
      Plot.areaY(brandWeeklyReachAll, Plot.stackY({
        x: 'week',
        y: 'value',
        fill: 'source',
        tip: true,
        z: 'source'
      }))
    );
  }

  if (showTotal) {
    marks.push(
      Plot.line(brandWeeklyTotals, { x: 'week', y: 'total', stroke: '#111', strokeWidth: 1.5 }),
      Plot.dot(brandWeeklyTotals, { x: 'week', y: 'total', fill: '#111', r: 2, tip: true })
    );
  }

  const plot = Plot.plot({
    title: 'Weekly Brand Reach by Source',
    y: { grid: true, label: 'Reach / Pageviews' },
    x: { label: 'Week', tickRotate: 45 },
    color: { legend: true, label: 'Source', domain: colorDomain, range: colorRange },
    marks: [...marks, Plot.ruleY([0])],
    width: width,
    height: 450,
    marginBottom: 70,
    marginLeft: 60
  });
  plotContainer.appendChild(plot);
}

chartTypeSelect.addEventListener('change', renderBrandReachPlot);
showTotalCheckbox.addEventListener('change', renderBrandReachPlot);

// Render controls and plot
display(html`<div class="card">${controlsContainer}</div>`);
display(plotContainer);
renderBrandReachPlot();
```

```js
// Simple weekly summary table (last 12 weeks)
function buildWeeklyPivot(rows) {
  const weekKey = d => Date.UTC(d.week.getUTCFullYear(), d.week.getUTCMonth(), d.week.getUTCDate());
  const map = new Map();
  for (const d of rows) {
    const k = weekKey(d);
    if (!map.has(k)) map.set(k, { week: new Date(d.week), blog: 0, buffer_accounts: 0, buffer_team: 0, PR: 0, total: 0 });
    const row = map.get(k);
    if (d.source === 'blog') row.blog += d.value || 0;
    else if (d.source === 'buffer_accounts') row.buffer_accounts += d.value || 0;
    else if (d.source === 'buffer_team') row.buffer_team += d.value || 0;
    else if (d.source === 'PR') row.PR += d.value || 0;
    row.total += d.value || 0;
  }
  return Array.from(map.values()).sort((a,b) => a.week - b.week);
}

const weeklyPivot = buildWeeklyPivot(brandWeeklyReachAll);
const last12 = weeklyPivot.slice(Math.max(0, weeklyPivot.length - 12));

function formatNum(n) { return (n || 0).toLocaleString(); }

const table = html`<table>
  <thead>
    <tr>
      <th style="text-align:left;">Week</th>
      <th style="text-align:right;">Blog</th>
      <th style="text-align:right;">Buffer Accounts</th>
      <th style="text-align:right;">Buffer Team</th>
      <th style="text-align:right;">PR</th>
      <th style="text-align:right;">Total</th>
    </tr>
  </thead>
  <tbody>
    ${last12.map(r => html`<tr>
      <td>${r.week.toISOString().slice(0,10)}</td>
      <td style="text-align:right;">${formatNum(r.blog)}</td>
      <td style="text-align:right;">${formatNum(r.buffer_accounts)}</td>
      <td style="text-align:right;">${formatNum(r.buffer_team)}</td>
      <td style="text-align:right;">${formatNum(r.PR)}</td>
      <td style="text-align:right; font-weight:600;">${formatNum(r.total)}</td>
    </tr>`) }
  </tbody>
  </table>`;

display(html`<div class="card">${table}</div>`);
```

<style>
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: white; }
</style>


