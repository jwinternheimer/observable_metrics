export default `
select
    format_date('%Y-%m-01', date_trunc(date(s.started_at), month)) as month
    , count(distinct s.session_id) as sessions
from dbt_buffer.segment_sessions as s
where s.signup_session
    and blog_assisted
    and date_trunc(date(s.started_at), month) >= date_trunc(date_sub(current_date(), interval 12 month), month)
    and date_trunc(date(s.started_at), month) < date_trunc(current_date(), month)
group by 1
order by 1 asc
`;