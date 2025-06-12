export default `
with admins as (
    select
        a.email
        , a.avatar
        , u.name
        , u.id as publish_user_id
        , a.id as account_id
    from dbt_buffer.core_accounts a
    inner join dbt_buffer.publish_users as u
        on a.publish_user_id = u.id 
    where a.is_deleted is not true
    and (u.role = 'admin' 
            or a.id in ('64195847e05614e23680fa18','626a09140c7dc67219132e21','5f1f00e8b73dcc2f63797106','5ca1d41e905a7a394986a738'))
  )
  
select
    a.avatar
    , a.name
    , a.account_id
    , count(distinct up.id) as posts
    , ifnull(sum(up.likes), 0) as likes
    , safe_add(ifnull(sum(up.reposts), 0), ifnull(sum(up.retweets), 0)) as reposts
    , safe_add(ifnull(sum(up.replies), 0), ifnull(sum(up.comments), 0)) as comments_and_replies
    , ifnull(sum(up.reach), 0) as reach
    , ifnull(sum(up.impressions), 0) as impressions
    , ifnull(sum(up.views), 0) as views
from admins as a
inner join dbt_buffer.publish_updates as up
    on a.account_id = up.account_id
    and date_trunc(date(up.sent_at), month) = date_trunc(current_date(), month)
group by 1,2,3
order by 5 desc
`;