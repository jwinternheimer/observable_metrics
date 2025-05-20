---
title: Home
---

# Buffer Transparent Metrics

Welcome to the Buffer Metrics Dashboard. This site includes transparent dashboards displaying key business metrics for Buffer.

<div class="dashboard-links">
  <div class="dashboard-card">
    <h3>Company Metrics</h3>
    <p>High-level metrics including signups, weekly active users, and new customers.</p>
    <a href="/company-metrics" class="dashboard-button">View Dashboard</a>
  </div>
  
  <div class="dashboard-card">
    <h3>Marketing Metrics</h3>
    <p>Marketing metrics including signups by attribution channel and blog visits.</p>
    <a href="/marketing-metrics" class="dashboard-button">View Dashboard</a>
  </div>
</div>

### Data Freshness

The dashboards are powered by data from BigQuery. The data is refreshed once per day and stored as CSV files for efficient access.

<style>
.dashboard-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 30px 0;
}

.dashboard-card {
  flex: 1;
  min-width: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.dashboard-card h3 {
  margin-top: 0;
  color: #333;
}

.dashboard-button {
  display: inline-block;
  background-color: #696969;
  color: white !important;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 10px;
  font-weight: bold;
  transition: background-color 0.2s, color 0.2s;
  text-shadow: 0 1px 1px rgba(0,0,0,0.2);
}

.dashboard-button:hover {
  background-color: rgb(240, 241, 245);
  color: #333 !important;
}
</style>
