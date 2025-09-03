export default `
select
  timestamp_trunc(timestamp, week) as week
  , count(distinct id) as blog_pageviews
from dbt_buffer.segment_pages
where timestamp_trunc(timestamp, week) >= '2025-01-01'
  and segment_source in ('\`buffer-data\`.\`segment_buffer_resources_blog\`.\`pages\`', '\`buffer-data\`.\`segment_buffer_library_blog\`.\`pages\`')
group by 1
order by 1 asc
`;