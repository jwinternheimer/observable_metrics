export default `
with buffer_channels as (
    select
        ch.id as channel_id
    from dbt_buffer.core_channels as ch
    where ch.organization_id = '58fe27f4c48fce7e6e1f01a8'
    and ch.is_locked is not true
    and ch.is_deleted is not true
)

select 
    timestamp_trunc(up.sent_at, week) as week
    , count(distinct up.id) as posts
    , sum(coalesce(up.reach, up.impressions, up.views)) as total_reach
from buffer_channels as ch
inner join dbt_buffer.publish_updates as up
    on up.profile_id = ch.channel_id
    and timestamp_trunc(up.sent_at, week) >= '2025-01-01'
group by 1
order by 1
`;