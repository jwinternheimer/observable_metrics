export default `
select
    date_trunc(date(s.started_at), week) as week
    , s.referrer_domain_grouped as referrer
    , count(distinct s.session_id) as signups
from dbt_buffer.segment_sessions as s
where s.signup_session
    and date(timestamp_trunc(s.started_at, week)) between
        date_sub(current_date, interval 52 week) and 
        date_sub(current_date, interval 1 week)
group by 1,2
order by 1 asc
`; 