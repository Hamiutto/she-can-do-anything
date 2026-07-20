insert into questions (content, author, status, time_type, particle_x, particle_y, color, created_at)
values
  ('如果想从稳定工作转向一个更喜欢的方向，第一步应该怎么判断？', '演示用户', 'pending', 'earning', 0.42, 0.48, '#FFD6A5', now() - interval '5 minutes'),
  ('你在人生低谷的时候，是怎么重新建立行动力的？', '匿名用户', 'pending', 'survival', 0.56, 0.38, '#A8E6CF', now() - interval '4 minutes'),
  ('女性在创业或职场里，怎样找到自己的长期节奏？', 'Chloe', 'pending', 'flow', 0.35, 0.61, '#C9B1FF', now() - interval '3 minutes'),
  ('如果没有很亮眼的学历和背景，还能怎样做出自己的样本？', '小周', 'pending', 'fun', 0.64, 0.55, '#B5D8F7', now() - interval '2 minutes'),
  ('你会建议年轻女生怎样开始建立自己的个人品牌？', 'Demo', 'pending', 'beauty', 0.49, 0.44, '#FFB5A7', now() - interval '1 minute')
on conflict do nothing;
