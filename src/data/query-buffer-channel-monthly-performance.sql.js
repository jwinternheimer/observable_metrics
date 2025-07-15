export default `
with buffer_channels as (
  select
    ch.id as channel_id
    , ch.service_type as service
    , ch.avatar
    , ch.name
  from dbt_buffer.core_channels as ch
  where ch.organization_id = '58fe27f4c48fce7e6e1f01a8'
  and ch.is_locked is not true
  and ch.is_deleted is not true
)

select 
  ch.service
  , ch.name
  , ch.avatar
  , count(distinct up.id) as posts
  , coalesce(sum(up.likes), 0) + coalesce(sum(up.reactions), 0) + coalesce(sum(up.favorites), 0)  as likes
  , safe_add(ifnull(sum(up.reposts), 0), ifnull(sum(up.retweets), 0)) as reposts
  , safe_add(ifnull(sum(up.replies), 0), ifnull(sum(up.comments), 0)) as comments_and_replies
  , sum(ifnull(up.reach, 0)) as reach
  , sum(ifnull(up.impressions, 0)) as impressions
  , sum(ifnull(up.views, 0)) as views
from buffer_channels as ch
inner join dbt_buffer.publish_updates as up
  on up.profile_id = ch.channel_id
  and date_trunc(date(up.sent_at), month) = date_trunc(date_sub(current_date, interval 1 month), month)
group by 1,2,3
`;