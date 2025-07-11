export default `
select
    format_date('%Y-%m-01', date_trunc(date(s.started_at), month)) as month
    , s.referrer_domain_grouped as referrer
    , count(distinct s.session_id) as signups
from dbt_buffer.segment_sessions as s
where s.signup_session
    and date_trunc(date(s.started_at), month) >= date_trunc(date_sub(current_date(), interval 12 month), month)
    and date_trunc(date(s.started_at), month) < date_trunc(current_date(), month)
group by 1,2
order by 1 asc
`; 