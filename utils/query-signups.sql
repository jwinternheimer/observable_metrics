select
  date(timestamp_trunc(timestamp, week)) as week
  , count(distinct user_id) as signups
from `buffer-data.dbt_buffer.segment_accounts_created`
where date(timestamp_trunc(timestamp, week)) between
date_sub(current_date, interval 52 week) and 
date_sub(current_date, interval 1 week)
group by 1
order by 1 asc 