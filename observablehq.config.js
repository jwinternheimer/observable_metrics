// See https://observablehq.com/framework/config for documentation.
export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "Buffer Metrics",

  // The pages and sections in the sidebar.
  pages: [
    {
      name: "Dashboard Home",
      path: "/"
    },
    {
      name: "Dashboards",
      pages: [
        {name: "Company Metrics", path: "/company-metrics"},
        {name: "Team of Creators", path: "/marketing-metrics"},
        {name: "Monthly Marketing Report", path: "/monthly-marketing-report"},
        {name: "Brand Reach", path: "/brand-reach-dashboard"}
      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: `
    <link rel="icon" href="logo.png" type="image/png" sizes="32x32">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: "JetBrains Mono", monospace !important;
      }
      * {
        font-family: "JetBrains Mono", monospace !important;
      }
    </style>
  `,

  // The path to the source root.
  root: "src",

  // Some additional configuration options:
  theme: ["light", "alt", "wide"], // Light theme for better dashboard appearance
  sidebar: true,  // Show the sidebar
  toc: false,     // Disable the table of contents
  pager: false,   // No need for previous & next links in the footer
};
