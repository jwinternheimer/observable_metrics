select
    date_trunc(date, week) as week
    , movement_type
    , count(distinct customer_uuid) as customers
from dbt_buffer.chartmogul_mrr_movements
where date(timestamp_trunc(date, week)) between
        date_sub(current_date, interval 52 week) and 
        date_sub(current_date, interval 1 week)
        and movement_type in ('new_biz','churn','contraction','expansion','reactivation')
group by 1,2
order by 1 asc