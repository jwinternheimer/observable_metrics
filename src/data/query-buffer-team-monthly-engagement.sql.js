export default `
with admins as (
    select
        a.email
        , a.avatar
        , a.name
        , o.id as organization_id
        , a.id as account_id
        , s.count as current_streak
    from dbt_buffer.core_accounts a
    inner join dbt_buffer.core_organizations as o
        on a.organization_id = o.id
        and o.is_deleted is not true
        and o.id in (
          '58b45b3c2094efc479720856', '60b8a7b23bf8458ff8109786', '5f1f00e8b69d160d4676f4c5',
          '592752f4dcab3cf176c607d4', '60b8a79a0677fa7577082ada', '57b45291fe35a08103841504',
          '61b5880de5e21457abd03eb7', '645912daf924a7c53bf40cfc', '63c9ad57d39b920d1fb2ca5b',
          '63c7d702964c23a6e58d45fb', '593187638dcc95a84c934dcf', '6021472eec321181f3dc4e83',
          '61024c4289704e3b246ece7b', '57dafcb6b49f3ac46a9d3345',
          '5877921a046bf37835f96b63', '65f202817ffd5edab02270a7',
          '5c38de5f32812a37285dd44a', '60487d143605300f6d8ecd58', '58fd860b7f1d34710553c771',
          '6365436d828433d6f72afc5c', '57a4b626124ba1253bf0f2d6', '580a3526699556f51907e18a',
          '581cce58b8e9d6ad5a7b5b92', '57e1309a9cf964d17d8b456c', '613a06db997ec0e21e03c5d0',
          '60af46fe1251a4b0b73c26d4', '62c44fe9f57622aa48d029f8', '62b370383b9a2513340d8f7b',
          '62879a59e797c614293d941f', '5a09eabaa43056ff2fae744c', '58777d3c0615986a6c3b057b',
          '59396ba18dcc95975e4d8031', '660950bee0c26f680c39e1c7', '57a355ec76b230033277ad10',
          '59faeabf56950875498b5576', '59834416e2a81dd6403e0469', '5c50b399c84eee014562841b',
          '57b7296ecf1746ed7d1e3548', '58767e8fa39c5092711e579d', '64b6b49e25aaa1bc35091188',
          '58459edf8349a53b0d31f6f1', '64da75a8bb6ade26976f5490', '6148ddfed1c2697387365132',
          '66f31838bf7d066587ef9db6', '65779ada2d96f1b5a44f52f8', '5ca764cc12bc7c7f8376a7a5',
          '5a1235d9c3453deb21876a6a', '5cb2d9c23c926320414f48f5', '57ac3c31ab210ad2108b456d',
          '57f3df2f19551d4d03ccdd1d', '57e8d88610045e1360c65121', '60c1ba9c665baabc7249ad24',
          '5b9fdfb50bafc04ea156b95c', '644bf4ed3172f4107d781b24', '5791d4d635e7faeb2d813690',
          '65651a1313179b4f77a7b667', '582320c7d657a28d4c21e521', '58223d50b8a95f2c77fee8bc',
          '648789e5946cabe4c1d700a3', '57ae2300df4e94e30c9cec7f', '61dbcb743bd4f6674df6d013',
          '60dd6c5da74491519a765143', '664b9302790e6ab9db78b364', '621619b1a21d6f11d31086ad',
          '6807a68bca88be80a98f20a8', '660ae0c1e0c26f680ca147db', '5ca1daf11d99bc38db020083'
        )
    inner join dbt_buffer.core_organization_streaks as s
        on o.id = s.organization_id
  )
  
select
    a.avatar
    , a.name
    , a.organization_id
    , a.current_streak
    , count(distinct up.id) as posts
    , coalesce(sum(up.likes), 0) + coalesce(sum(up.reactions), 0) + coalesce(sum(up.favorites), 0)  as likes
    , safe_add(ifnull(sum(up.reposts), 0), ifnull(sum(up.retweets), 0)) as reposts
    , safe_add(ifnull(sum(up.replies), 0), ifnull(sum(up.comments), 0)) as comments_and_replies
    , sum(ifnull(up.reach, 0)) as reach
    , sum(ifnull(up.impressions, 0)) as impressions
    , sum(ifnull(up.views, 0)) as views
from admins as a
left join dbt_buffer.publish_updates as up
    on a.organization_id = up.organization_id
    and date_trunc(date(up.sent_at), month) = date_trunc(current_date(), month)
group by 1,2,3,4
order by 5 desc
`;