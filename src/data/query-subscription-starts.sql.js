export default `
select
  date(timestamp_trunc(timestamp, week)) as week
  , count(distinct user_id) as new_customers
from \`buffer-data.dbt_buffer.segment_subscription_starts\`
where date(timestamp_trunc(timestamp, week)) between
date_trunc(date('2024-01-01'), week) and 
date_sub(current_date, interval 1 week)
group by 1 
order by 1 asc
`; 