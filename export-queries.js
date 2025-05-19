import {csvFormat} from "d3-dsv";
import fs from "fs";
import path from "path";
import {runQuery} from "./utils/google-bigquery.js";

// Ensure target directory exists
const targetDir = "./src/data";
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Create a lock file path to track when queries were last run
const LOCK_FILE_PATH = path.join(targetDir, "last_query_timestamp.json");

// Check if we should run queries based on the lock file
function shouldRunQueries() {
  try {
    if (!fs.existsSync(LOCK_FILE_PATH)) {
      return true; // No lock file exists, so run queries
    }

    const lockFileContent = JSON.parse(fs.readFileSync(LOCK_FILE_PATH, 'utf8'));
    const lastRunTimestamp = new Date(lockFileContent.lastRun);
    const currentDate = new Date();
    
    // Check if the last run was on a different day
    return lastRunTimestamp.toDateString() !== currentDate.toDateString();
  } catch (error) {
    console.error("Error checking query lock file:", error);
    return true; // Run queries on error to be safe
  }
}

// Update the lock file with current timestamp
function updateLockFile() {
  const lockData = {
    lastRun: new Date().toISOString()
  };
  fs.writeFileSync(LOCK_FILE_PATH, JSON.stringify(lockData, null, 2));
}

// Generate sample data for marketing channel performance
function generateChannelPerformance() {
  const channels = ["Organic Search", "Paid Search", "Social Media", "Email", "Referral"];
  const startDate = new Date('2023-12-01');
  const months = 6;
  const data = [];
  
  for (let i = 0; i < months; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i);
    const monthStr = currentDate.toISOString().split('T')[0];
    
    channels.forEach(channel => {
      // Create data with realistic patterns
      const baseUsers = Math.round(500 + Math.random() * 1000);
      const baseRevenue = Math.round(5000 + Math.random() * 10000);
      
      // Add seasonality and growth trends
      const seasonality = 1 + (i % 3) * 0.1;
      const growthFactor = 1 + (i * 0.05);
      
      // Channel-specific multipliers
      let channelFactor = 1;
      if (channel === "Paid Search") channelFactor = 1.5;
      if (channel === "Social Media") channelFactor = 0.8 + (i * 0.1); 
      if (channel === "Email") channelFactor = 1.3 - (i * 0.05);
      
      data.push({
        month: monthStr,
        channel: channel,
        new_users: Math.round(baseUsers * seasonality * growthFactor * channelFactor),
        revenue: Math.round(baseRevenue * seasonality * growthFactor * channelFactor)
      });
    });
  }
  
  return data;
}

// Generate sample data for campaign conversion
function generateCampaignConversion() {
  const campaigns = [
    "Summer Promotion",
    "Product Launch",
    "Retargeting Campaign",
    "Brand Awareness",
    "Holiday Special",
    "Newsletter Subscribers",
    "Competitor Keywords"
  ];
  
  return campaigns.map(campaign => {
    const impressions = Math.round(10000 + Math.random() * 90000);
    const clickRate = 0.01 + Math.random() * 0.06;
    const clicks = Math.round(impressions * clickRate);
    const convRate = 0.02 + Math.random() * 0.08;
    const signups = Math.round(clicks * convRate);
    
    return {
      campaign_name: campaign,
      impressions: impressions,
      clicks: clicks,
      signups: signups,
      ctr: parseFloat((clickRate * 100).toFixed(2)),
      conversion_rate: parseFloat((convRate * 100).toFixed(2))
    };
  });
}

async function executeQueries() {
  // Check if we should run queries today
  if (!shouldRunQueries()) {
    console.log("Queries already run today. Skipping execution.");
    return;
  }

  console.log("Starting query execution...");

  try {
    // Load the SQL queries
    const signupsSql = fs.readFileSync('./utils/query-signups.sql', 'utf8');
    const subscriptionStartsSql = fs.readFileSync('./utils/query-subscription-starts.sql', 'utf8');
    const weeklyActiveUsersSql = fs.readFileSync('./utils/query-weekly-active-users.sql', 'utf8');
    const signupsBySourceSql = fs.readFileSync('./utils/query-signups-by-source.sql', 'utf8');
    const chartmogulMrrEventsSql = fs.readFileSync('./utils/query-chartmogul-mrr-events.sql', 'utf8');
    
    // Query 1: Weekly Signups
    console.log("Running signups query...");
    const signupsRows = await runQuery(signupsSql);
    
    // Format dates properly
    const formattedSignupsRows = signupsRows.map(row => {
      if (row.week instanceof Date) {
        return {
          ...row,
          week: row.week.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.week === 'object') {
        return {
          ...row,
          week: String(row.week.value || JSON.stringify(row.week))
        };
      }
      return row;
    });
    
    const csvSignups = csvFormat(formattedSignupsRows);
    fs.writeFileSync(`${targetDir}/company_weekly_signups.csv`, csvSignups);
    console.log(`Signups query complete, saved ${signupsRows.length} rows`);
    
    // Query 2: Weekly Subscription Starts
    console.log("Running subscription starts query...");
    const subscriptionStartsRows = await runQuery(subscriptionStartsSql);
    
    // Format dates properly
    const formattedSubscriptionStartsRows = subscriptionStartsRows.map(row => {
      if (row.week instanceof Date) {
        return {
          ...row,
          week: row.week.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.week === 'object') {
        return {
          ...row,
          week: String(row.week.value || JSON.stringify(row.week))
        };
      }
      return row;
    });
    
    const csvSubscriptionStarts = csvFormat(formattedSubscriptionStartsRows);
    fs.writeFileSync(`${targetDir}/company_weekly_subscriptions.csv`, csvSubscriptionStarts);
    console.log(`Subscription starts query complete, saved ${subscriptionStartsRows.length} rows`);

    // Query 3: Weekly Active Users
    console.log("Running weekly active users query...");
    const weeklyActiveUsersRows = await runQuery(weeklyActiveUsersSql);
    
    // Format dates properly
    const formattedWeeklyActiveUsersRows = weeklyActiveUsersRows.map(row => {
      if (row.week instanceof Date) {
        return {
          ...row,
          week: row.week.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.week === 'object') {
        return {
          ...row,
          week: String(row.week.value || JSON.stringify(row.week))
        };
      }
      return row;
    });
    
    const csvWeeklyActiveUsers = csvFormat(formattedWeeklyActiveUsersRows);
    fs.writeFileSync(`${targetDir}/company_weekly_active_users.csv`, csvWeeklyActiveUsers);
    console.log(`Weekly active users query complete, saved ${weeklyActiveUsersRows.length} rows`);
    
    // Query 4: Signups by Source
    console.log("Running signups by source query...");
    const signupsBySourceRows = await runQuery(signupsBySourceSql);
    
    // Format dates properly
    const formattedSignupsBySourceRows = signupsBySourceRows.map(row => {
      if (row.week instanceof Date) {
        return {
          ...row,
          week: row.week.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.week === 'object') {
        return {
          ...row,
          week: String(row.week.value || JSON.stringify(row.week))
        };
      }
      return row;
    });
    
    const csvSignupsBySource = csvFormat(formattedSignupsBySourceRows);
    fs.writeFileSync(`${targetDir}/signups_by_source.csv`, csvSignupsBySource);
    console.log(`Signups by source query complete, saved ${signupsBySourceRows.length} rows`);
    
    // Query 5: ChartMogul MRR Events
    console.log("Running ChartMogul MRR events query...");
    const chartmogulMrrEventsRows = await runQuery(chartmogulMrrEventsSql);
    
    // Format dates properly
    const formattedChartmogulMrrEventsRows = chartmogulMrrEventsRows.map(row => {
      if (row.week instanceof Date) {
        return {
          ...row,
          week: row.week.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.week === 'object') {
        return {
          ...row,
          week: String(row.week.value || JSON.stringify(row.week))
        };
      }
      return row;
    });
    
    const csvChartmogulMrrEvents = csvFormat(formattedChartmogulMrrEventsRows);
    fs.writeFileSync(`${targetDir}/chartmogul_mrr_events.csv`, csvChartmogulMrrEvents);
    console.log(`ChartMogul MRR events query complete, saved ${chartmogulMrrEventsRows.length} rows`);
    
    console.log("Generating synthetic data for marketing channel performance...");
    const channelPerformance = generateChannelPerformance();
    const csvChannelPerformance = csvFormat(channelPerformance);
    fs.writeFileSync(`${targetDir}/marketing_channel_performance.csv`, csvChannelPerformance);
    console.log(`Generated synthetic data for channel performance: ${channelPerformance.length} rows`);
    
    console.log("Generating synthetic data for campaign conversion...");
    const campaignConversion = generateCampaignConversion();
    const csvCampaignConversion = csvFormat(campaignConversion);
    fs.writeFileSync(`${targetDir}/marketing_campaign_conversion.csv`, csvCampaignConversion);
    console.log(`Generated synthetic data for campaign conversion: ${campaignConversion.length} rows`);

    // Update lock file to indicate queries have run today
    updateLockFile();
    console.log("All queries completed successfully!");
  } catch (error) {
    console.error("Error executing queries:", error);
  }
}

executeQueries(); 