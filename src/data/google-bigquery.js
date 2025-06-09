import "dotenv/config";
import {BigQuery} from "@google-cloud/bigquery";

// Initialize BigQuery client
let bigQueryClient;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // CI environment - use JSON credentials file
  bigQueryClient = new BigQuery();
} else {
  // Local development - use environment variables
  const {BQ_PROJECT_ID, BQ_CLIENT_EMAIL, BQ_PRIVATE_KEY} = process.env;
  
  if (!BQ_PROJECT_ID) throw new Error("missing BQ_PROJECT_ID");
  if (!BQ_CLIENT_EMAIL) throw new Error("missing BQ_CLIENT_EMAIL");
  if (!BQ_PRIVATE_KEY) throw new Error("missing BQ_PRIVATE_KEY");
  
  bigQueryClient = new BigQuery({
    projectId: BQ_PROJECT_ID,
    credentials: {
      client_email: BQ_CLIENT_EMAIL,
      private_key: BQ_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
  });
}

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