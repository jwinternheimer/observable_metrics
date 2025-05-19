import "dotenv/config";
import {BigQuery} from "@google-cloud/bigquery";

// Get BigQuery credentials from environment variables
const {BQ_PROJECT_ID, BQ_CLIENT_EMAIL, BQ_PRIVATE_KEY} = process.env;

// Validate that required credentials are present
if (!BQ_PROJECT_ID) throw new Error("missing BQ_PROJECT_ID");
if (!BQ_CLIENT_EMAIL) throw new Error("missing BQ_CLIENT_EMAIL");
if (!BQ_PRIVATE_KEY) throw new Error("missing BQ_PRIVATE_KEY");

// Initialize BigQuery client
const bigQueryClient = new BigQuery({
  projectId: BQ_PROJECT_ID,
  credentials: {
    client_email: BQ_CLIENT_EMAIL,
    private_key: BQ_PRIVATE_KEY
  }
});

/**
 * Run a SQL query against BigQuery
 * @param {string} query - SQL query to execute
 * @returns {Promise<Array>} - First element of the query result array
 */
export async function runQuery(query) {
  console.log("Executing BigQuery query...");
  try {
    const result = await bigQueryClient.query({query});
    console.log(`Query completed successfully. Returned ${result[0].length} rows.`);
    return result[0];
  } catch (error) {
    console.error("Error executing BigQuery query:", error);
    throw error;
  }
} 