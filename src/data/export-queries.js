import {csvFormat, csvParse} from "d3-dsv";
import fs from "fs";
import path from "path";
import {runQuery} from "./google-bigquery.js";
import signupsSql from "./query-signups.sql.js";
import subscriptionStartsSql from "./query-subscription-starts.sql.js";
import weeklyActiveUsersSql from "./query-weekly-active-users.sql.js";
import signupsBySourceSql from "./query-signups-by-source.sql.js";
import chartmogulMrrEventsSql from "./query-chartmogul-mrr-events.sql.js";
import monthlySignupsSql from "./query-monthly-signups.sql.js";
import monthlyFtsSql from "./query-monthly-fts.sql.js";
import bufferTeamConsolidatedSql from "./query-buffer-team-consolidated.sql.js";
import bufferTeamMonthlyEngagementSql from "./query-buffer-team-monthly-engagement.sql.js";
import monthlyBlogPageviewsSql from "./query-monthly-blog-pageviews.sql.js";
import blogAssistedSignupsSql from "./query-blog-assisted-signups.sql.js";
import bufferChannelMonthlyPerformanceSql from "./query-buffer-channel-monthly-performance.sql.js";

// Ensure target directory exists
const targetDir = "./src/data";
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Create a lock file path to track when queries were last run
const LOCK_FILE_PATH = path.join(targetDir, "last_query_timestamp.json");

// Check if we should run queries based on the lock file
function shouldRunQueries() {
  // In CI environment, always run queries to ensure fresh data
  if (process.env.CI) {
    return true;
  }

  try {
    if (!fs.existsSync(LOCK_FILE_PATH)) {
      return true; // No lock file exists, so run queries
    }

    const lockFileContent = JSON.parse(fs.readFileSync(LOCK_FILE_PATH, 'utf8'));
    const lastRunTimestamp = new Date(lockFileContent.lastRun);
    const currentDate = new Date();
    
    // Check if the last run was more than 1 day ago (allowing for daily updates)
    const daysSinceLastRun = Math.floor((currentDate - lastRunTimestamp) / (1000 * 60 * 60 * 24));
    return daysSinceLastRun >= 1;
  } catch (error) {
    console.error("Error checking query lock file:", error);
    return true; // Run queries on error to be safe
  }
}

// Load org_teams.csv data
function loadOrgTeams() {
  try {
    const orgTeamsPath = path.join(targetDir, "org_teams.csv");
    if (!fs.existsSync(orgTeamsPath)) {
      console.log("org_teams.csv not found, skipping team assignment");
      return new Map();
    }
    
    const orgTeamsContent = fs.readFileSync(orgTeamsPath, 'utf8');
    const orgTeamsData = csvParse(orgTeamsContent);
    
    // Create a map for quick lookup: organization_id -> team
    const orgTeamsMap = new Map();
    orgTeamsData.forEach(row => {
      if (row.organization_id && row.team) {
        orgTeamsMap.set(row.organization_id, row.team);
      }
    });
    
    console.log(`Loaded ${orgTeamsMap.size} team assignments from org_teams.csv`);
    return orgTeamsMap;
  } catch (error) {
    console.error("Error loading org_teams.csv:", error);
    return new Map();
  }
}

// Join buffer team data with team assignments
function joinWithTeamData(data, orgTeamsMap) {
  return data.map(row => {
    const team = orgTeamsMap.get(row.organization_id) || 'Unknown';
    return {
      ...row,
      team: team
    };
  });
}

// Update the lock file with current timestamp
function updateLockFile() {
  const lockData = {
    lastRun: new Date().toISOString()
  };
  fs.writeFileSync(LOCK_FILE_PATH, JSON.stringify(lockData, null, 2));
}

async function executeQueries() {
  // Check if we should run queries
  if (!shouldRunQueries()) {
    console.log("Queries already run recently. Skipping execution.");
    return;
  }

  const environment = process.env.CI ? "CI" : "local";
  console.log(`Starting query execution in ${environment} environment...`);

  // Load org_teams data for team assignment
  const orgTeamsMap = loadOrgTeams();

  try {
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
      if (row.month instanceof Date) {
        return {
          ...row,
          month: row.month.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.month === 'object') {
        return {
          ...row,
          month: String(row.month.value || JSON.stringify(row.month))
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
    
    // Query 6: Monthly Signups
    console.log("Running monthly signups query...");
    const monthlySignupsRows = await runQuery(monthlySignupsSql);
    
    // Format dates properly
    const formattedMonthlySignupsRows = monthlySignupsRows.map(row => {
      if (row.month instanceof Date) {
        return {
          ...row,
          month: row.month.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.month === 'object') {
        return {
          ...row,
          month: String(row.month.value || JSON.stringify(row.month))
        };
      }
      return row;
    });
    
    const csvMonthlySignups = csvFormat(formattedMonthlySignupsRows);
    fs.writeFileSync(`${targetDir}/company_monthly_signups.csv`, csvMonthlySignups);
    console.log(`Monthly signups query complete, saved ${monthlySignupsRows.length} rows`);
    
    // Query 7: Monthly First-Time Sessions
    console.log("Running monthly first-time sessions query...");
    const monthlyFtsRows = await runQuery(monthlyFtsSql);
    
    // Format dates properly
    const formattedMonthlyFtsRows = monthlyFtsRows.map(row => {
      if (row.month instanceof Date) {
        return {
          ...row,
          month: row.month.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.month === 'object') {
        return {
          ...row,
          month: String(row.month.value || JSON.stringify(row.month))
        };
      }
      return row;
    });
    
    const csvMonthlyFts = csvFormat(formattedMonthlyFtsRows);
    fs.writeFileSync(`${targetDir}/company_monthly_fts.csv`, csvMonthlyFts);
    console.log(`Monthly first-time sessions query complete, saved ${monthlyFtsRows.length} rows`);
    
    // Query 8: Buffer Team Consolidated (replaces 3 separate queries)
    console.log("Running consolidated buffer team query...");
    const bufferTeamConsolidatedRows = await runQuery(bufferTeamConsolidatedSql);
    
    // Format dates properly
    const formattedBufferTeamConsolidatedRows = bufferTeamConsolidatedRows.map(row => {
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
    
    // Generate buffer_team_posts.csv (original metrics)
    const bufferTeamPostsRows = formattedBufferTeamConsolidatedRows.map(row => ({
      week: row.week,
      posts: row.total_posts,
      total_reach: row.total_reach
    }));
    const csvBufferTeamPosts = csvFormat(bufferTeamPostsRows);
    fs.writeFileSync(`${targetDir}/buffer_team_posts.csv`, csvBufferTeamPosts);
    
    // Generate buffer_team_weekly_active_members.csv
    const bufferTeamActiveMembers = formattedBufferTeamConsolidatedRows.map(row => ({
      week: row.week,
      active_team_members: row.active_team_members
    }));
    const csvBufferTeamActiveMembers = csvFormat(bufferTeamActiveMembers);
    fs.writeFileSync(`${targetDir}/buffer_team_weekly_active_members.csv`, csvBufferTeamActiveMembers);
    
    // Generate buffer_team_weekly_median_posts.csv
    const bufferTeamMedianPosts = formattedBufferTeamConsolidatedRows.map(row => ({
      week: row.week,
      median_posts_per_member: row.median_posts_per_member
    }));
    const csvBufferTeamMedianPosts = csvFormat(bufferTeamMedianPosts);
    fs.writeFileSync(`${targetDir}/buffer_team_weekly_median_posts.csv`, csvBufferTeamMedianPosts);
    
    console.log(`Consolidated buffer team query complete, saved ${bufferTeamConsolidatedRows.length} rows to 3 CSV files`);
    
    // Query 9: Buffer Team Monthly Engagement
    console.log("Running buffer team monthly engagement query...");
    const bufferTeamMonthlyEngagementRows = await runQuery(bufferTeamMonthlyEngagementSql);
    
    // Ensure month is formatted as YYYY-MM-DD
    const formattedBufferTeamMonthlyEngagementRows = bufferTeamMonthlyEngagementRows.map(row => {
      if (row.month instanceof Date) {
        return {
          ...row,
          month: row.month.toISOString().split('T')[0]
        };
      } else if (row.month && typeof row.month === 'object') {
        return {
          ...row,
          month: String(row.month.value || JSON.stringify(row.month))
        };
      }
      return row;
    });

    // Join with team data from org_teams.csv
    const bufferTeamMonthlyEngagementWithTeams = joinWithTeamData(formattedBufferTeamMonthlyEngagementRows, orgTeamsMap);

    const csvBufferTeamMonthlyEngagement = csvFormat(bufferTeamMonthlyEngagementWithTeams);
    fs.writeFileSync(`${targetDir}/buffer_team_monthly_engagement.csv`, csvBufferTeamMonthlyEngagement);
    console.log(`Buffer team monthly engagement query complete, saved ${bufferTeamMonthlyEngagementRows.length} rows with team assignments`);
    
    // Query 9: Monthly Blog Pageviews
    console.log("Running monthly blog pageviews query...");
    const monthlyBlogPageviewsRows = await runQuery(monthlyBlogPageviewsSql);
    
    // Format dates properly
    const formattedMonthlyBlogPageviewsRows = monthlyBlogPageviewsRows.map(row => {
      if (row.month instanceof Date) {
        return {
          ...row,
          month: row.month.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.month === 'object') {
        return {
          ...row,
          month: String(row.month.value || JSON.stringify(row.month))
        };
      }
      return row;
    });
    
    const csvMonthlyBlogPageviews = csvFormat(formattedMonthlyBlogPageviewsRows);
    fs.writeFileSync(`${targetDir}/company_monthly_blog_pageviews.csv`, csvMonthlyBlogPageviews);
    console.log(`Monthly blog pageviews query complete, saved ${monthlyBlogPageviewsRows.length} rows`);
    
    // Query 10: Blog Assisted Signups
    console.log("Running blog assisted signups query...");
    const blogAssistedSignupsRows = await runQuery(blogAssistedSignupsSql);
    
    // Format dates properly
    const formattedBlogAssistedSignupsRows = blogAssistedSignupsRows.map(row => {
      if (row.month instanceof Date) {
        return {
          ...row,
          month: row.month.toISOString().split('T')[0] // Convert to YYYY-MM-DD
        };
      } else if (typeof row.month === 'object') {
        return {
          ...row,
          month: String(row.month.value || JSON.stringify(row.month))
        };
      }
      return row;
    });
    
    const csvBlogAssistedSignups = csvFormat(formattedBlogAssistedSignupsRows);
    fs.writeFileSync(`${targetDir}/blog_assisted_signups.csv`, csvBlogAssistedSignups);
    console.log(`Blog assisted signups query complete, saved ${blogAssistedSignupsRows.length} rows`);
    
    // Query 11: Buffer Channel Monthly Performance
    console.log("Running buffer channel monthly performance query...");
    const bufferChannelMonthlyPerformanceRows = await runQuery(bufferChannelMonthlyPerformanceSql);
    
    const csvBufferChannelMonthlyPerformance = csvFormat(bufferChannelMonthlyPerformanceRows);
    fs.writeFileSync(`${targetDir}/buffer-channel-monthly-performance.csv`, csvBufferChannelMonthlyPerformance);
    console.log(`Buffer channel monthly performance query complete, saved ${bufferChannelMonthlyPerformanceRows.length} rows`);
    
    // Update the lock file
    updateLockFile();
    
    console.log("All queries complete.");
  } catch (error) {
    console.error("Error executing queries:", error);
    throw error;
  }
}

executeQueries(); 