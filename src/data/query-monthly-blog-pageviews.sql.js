export default `
select
  date_trunc(date(timestamp), month) as month
  , count(distinct id) as blog_pageviews
from dbt_buffer.segment_pages
where date_trunc(date(timestamp), month) between 
  date_trunc(date_sub(current_date, interval 13 month), month) and
  date_trunc(date_sub(current_date, interval 1 month), month)
  and segment_source in ('\`buffer-data\`.\`segment_buffer_resources_blog\`.\`pages\`', '\`buffer-data\`.\`segment_buffer_library_blog\`.\`pages\`')
group by 1
order by 1 asc
`;
