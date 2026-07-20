import { ref } from 'vue'

export const thanksData = ref([
  { id: 1, user: '潇洒姐', text: '谢谢你把经验说得这么具体，我突然觉得自己不是一个人在摸索。' },
  { id: 2, user: '匿名用户', text: '感谢你的分享，让我有勇气迈出了转行的第一步。' },
  { id: 3, user: '阿紫', text: '谢谢你在我最迷茫的时候，给了我一盏灯。' },
  { id: 4, user: '柿子椒熊', text: '你的故事让我明白，人和人之间最大的壁垒是信息和认知。' },
  { id: 5, user: '冻冻', text: '谢谢你告诉我，AI 可以让想法变成现实。' },
  { id: 6, user: '晓蕾', text: '从地狱难度副本里爬出来的人，谢谢你让我看到另一种可能。' },
  { id: 7, user: '匿名用户', text: '爱出者爱返，福往者福来。谢谢你。' },
  { id: 8, user: '匿名用户', text: '你的一句话，让我决定不再犹豫。' },
  { id: 9, user: '匿名用户', text: '谢谢你让我知道，人生是旷野不是轨道。' },
  { id: 10, user: '匿名用户', text: '在我最需要方向的时候，看到了你的分享。' },
  { id: 11, user: '匿名用户', text: '原来我不是一个人，谢谢你让我知道。' },
  { id: 12, user: '匿名用户', text: '你的经历让我相信，一切都会好起来的。' },
])

export function addThank(user, text) {
  thanksData.value.unshift({
    id: Date.now(),
    user: user || '匿名用户',
    text,
  })
}
