# Observable Metrics

This is an [Observable Framework](https://observablehq.com/framework/) app used by Buffer to create interactive dashboards for tracking key business metrics. The application includes visualizations of key metrics like signups, subscriptions, revenue data, and team social performance.

## About This Project

This dashboard serves as Buffer's central hub for monitoring:
- **Company Growth Metrics**: Weekly and monthly signups, subscription starts, and active user counts
- **Revenue Analytics**: ChartMogul MRR events and subscription revenue tracking  
- **Marketing Performance**: Blog pageviews, traffic sources, and first-time session analytics
- **Team Productivity**: Buffer team engagement, posting activity, and collaboration metrics

The application connects to Buffer's Google BigQuery data warehouse to automatically pull fresh data and generate interactive visualizations every day.

## Getting Started

To install the required dependencies, run:

```
npm install
```

Then, to start the local preview server, run:

```
npm run dev
```

Then visit <http://localhost:3000> to preview your app.

For more, see <https://observablehq.com/framework/getting-started>.

## Project structure

A typical Framework project looks like this:

```ini
.
├─ src
│  ├─ components
│  │  ├─ timeline.js           # timeline visualization component
│  │  ├─ trend.js              # trend chart component
│  │  └─ xmr.js                # metric visualization component
│  ├─ data
│  │  ├─ export-queries.js     # main query orchestrator
│  │  ├─ google-bigquery.js    # BigQuery connection handler
│  │  ├─ query-*.sql.js        # BigQuery SQL data loaders (13 queries)
│  │  ├─ *.csv                 # exported metric data files
│  │  ├─ events.json           # static data file
│  │  └─ last_query_timestamp.json # query execution lock file
│  ├─ company-metrics.md       # company growth dashboard page
│  ├─ marketing-metrics.md     # marketing analytics page
│  ├─ monthly-marketing-report.md # monthly marketing report page
│  └─ index.md                 # the home page
├─ .gitignore
├─ observablehq.config.js      # the app config file
├─ package.json
└─ README.md
```

**`src`** - This is the “source root” — where your source files live. Pages go here. Each page is a Markdown file. Observable Framework uses [file-based routing](https://observablehq.com/framework/project-structure#routing), which means that the name of the file controls where the page is served. You can create as many pages as you like. Use folders to organize your pages.

**`src/index.md`** - This is the home page for your app. You can have as many additional pages as you’d like, but you should always have a home page, too.

**`src/data`** - Contains BigQuery data loaders and exported CSV files. The `export-queries.js` script orchestrates data fetching from Buffer's BigQuery warehouse, while individual `query-*.sql.js` files define specific SQL queries for different metrics. Generated CSV files are automatically updated and used by the dashboard pages.

**`src/components`** - Shared JavaScript modules for data visualization components. The `timeline.js`, `trend.js`, and `xmr.js` modules provide reusable charting components used across multiple dashboard pages.

**`observablehq.config.js`** - This is the [app configuration](https://observablehq.com/framework/config) file, such as the pages and sections in the sidebar navigation, and the app’s title.

## Command reference

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `npm install`            | Install or reinstall dependencies                        |
| `npm run dev`        | Start local preview server (automatically runs export-queries first) |
| `npm run build`      | Build your static site, generating `./dist`              |
| `npm run deploy`     | Deploy your app to Observable                            |
| `npm run clean`      | Clear the local data loader cache                        |
| `npm run export-queries` | Manually run BigQuery data export (skipped if run within 24hrs) |
| `npm run observable` | Run commands like `observable help`                      |

## Data Management

The application automatically fetches fresh data from Buffer's BigQuery warehouse. Data queries are executed:
- Automatically when running `npm run dev` 
- Manually with `npm run export-queries`
- Maximum once per day (controlled by `last_query_timestamp.json`)

To force fresh data retrieval, delete the `src/data/last_query_timestamp.json` file before running queries.
