// See https://observablehq.com/framework/config for documentation.
export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "Observable Metrics",

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
        {name: "Marketing Metrics", path: "/marketing-metrics"}
      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options:
  theme: "light", // Light theme for better dashboard appearance
  sidebar: true,  // Show the sidebar
  toc: false,     // Disable the table of contents
  pager: false,   // No need for previous & next links in the footer
};
