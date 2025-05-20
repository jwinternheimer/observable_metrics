export default `
select
  date_trunc(date(started_at), month) as month
  , count(distinct session_id) as fts
from dbt_buffer.segment_sessions
where session_id like '1 -%'
    and date_trunc(date(started_at), month) between 
        date_trunc(date_sub(current_date, interval 13 month), month) and
        date_trunc(date_sub(current_date, interval 1 month), month)
group by 1
order by 1 asc
`;
