export default `
select
  timestamp_trunc(up.sent_at, week) as week
  , count(distinct up.id) as posts
  , sum(up.total_engagements) as total_engagement
from dbt_buffer.publish_updates as up
inner join dbt_buffer.core_organizations as o
  on o.id = up.organization_id
  and o.is_deleted is not true
inner join dbt_buffer.core_accounts as a
  on a.organization_id = o.id
  and a.is_deleted is not true
  and a.account_role = 'admin'
where date(timestamp_trunc(up.sent_at, week)) between
    date_sub(current_date, interval 52 week) and 
    date_sub(current_date, interval 1 week)
group by 1
order by 1 asc
`;