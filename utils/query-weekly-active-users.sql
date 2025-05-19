select
  date(timestamp_trunc(timestamp, week)) as week
  , count(distinct user_id) as weekly_active_users
from `buffer-data.dbt_buffer.segment_post_sent`
where date(timestamp_trunc(timestamp, week)) between
date_sub(current_date, interval 52 week) and 
date_sub(current_date, interval 1 week)
group by 1
order by 1 asc