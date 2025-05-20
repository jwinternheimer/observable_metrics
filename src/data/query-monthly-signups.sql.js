export default `
select
  date_trunc(date(timestamp), month) as month
  , count(distinct user_id) as signups
from dbt_buffer.segment_accounts_created
where date_trunc(date(timestamp), month) between 
  date_trunc(date_sub(current_date, interval 13 month), month) and
  date_trunc(date_sub(current_date, interval 1 month), month)
group by 1
order by 1 asc
`;
