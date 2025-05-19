import {csvFormat} from "d3-dsv";
import {runQuery} from "./data/google-bigquery.js";

console.log("Starting test-bigquery.js");
console.log("Checking for environment variables:");
console.log("BQ_PROJECT_ID exists:", process.env.BQ_PROJECT_ID ? "YES" : "NO");
console.log("BQ_CLIENT_EMAIL exists:", process.env.BQ_CLIENT_EMAIL ? "YES" : "NO");
console.log("BQ_PRIVATE_KEY exists:", process.env.BQ_PRIVATE_KEY ? "YES" : "NO (but it might be secret)");

try {
  console.log("Running BigQuery query...");
  const rows = await runQuery(`
    SELECT
      FORMAT_TIMESTAMP('%Y-%m-%d', date) as date,
      confirmed_cases
    FROM
      \`bigquery-public-data.covid19_italy.data_by_province\`
    WHERE
      name = "Lombardia"
      AND province_name = "Lecco"
      AND date BETWEEN '2020-05-01 00:00:00 UTC' AND '2020-05-15 00:00:00 UTC'
    GROUP BY 1,2
    ORDER BY 1 ASC;
  `);
  
  console.log("Query successful! Rows returned:", rows.length);
  console.log("First few rows:", JSON.stringify(rows.slice(0, 3), null, 2));
  
  const csvOutput = csvFormat(rows);
  console.log("CSV output sample:", csvOutput.substring(0, 200) + "...");
} catch (error) {
  console.error("Error running query:", error);
} 