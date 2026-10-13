/* ─── IELTS — 50 条虚拟练习记录种子数据（严格去重） ─── */

interface SeedSession {
  date: string
  subject: 'listening' | 'reading' | 'writing' | 'speaking'
  source: string
  score: string
  minutes: number
  note: string
  mistakeTags: string[]
}

export const SEED_SESSIONS: SeedSession[] = [
  // #1  听力
  { date: '2026-09-01', subject: 'listening', source: '剑雅 11 Test1', score: '26/40', minutes: 30, note: '填空拼写错3个，语速跟不上Section4', mistakeTags: ['拼写', '跟丢了'] },
  // #2  听力
  { date: '2026-09-02', subject: 'listening', source: '剑雅 11 Test2', score: '27/40', minutes: 35, note: '地图题东西搞反，选择题漏定位词', mistakeTags: ['没听到', '跟丢了'] },
  // #3  听力
  { date: '2026-09-04', subject: 'listening', source: '剑雅 12 Test1', score: '28/40', minutes: 30, note: '同义替换recognize→identify没反应过来', mistakeTags: ['同义替换'] },
  // #4  听力
  { date: '2026-09-06', subject: 'listening', source: '剑雅 12 Test2', score: '27/40', minutes: 25, note: '选择题最后一组没听到转折词but', mistakeTags: ['没听到'] },
  // #5  听力
  { date: '2026-09-08', subject: 'listening', source: '剑雅 13 Test1', score: '29/40', minutes: 30, note: 'library拼成libary，单复数criteria错', mistakeTags: ['拼写', '单复数时态'] },
  // #6  听力
  { date: '2026-09-10', subject: 'listening', source: '剑雅 13 Test2', score: '30/40', minutes: 35, note: '地图题方位词终于对了，但语速仍跟不上', mistakeTags: ['同义替换'] },
  // #7  听力
  { date: '2026-09-13', subject: 'listening', source: '剑雅 14 Test1', score: '31/40', minutes: 30, note: '选择题定位到了但同义替换慢半拍', mistakeTags: ['同义替换'] },
  // #8  听力
  { date: '2026-09-16', subject: 'listening', source: '剑雅 14 Test2', score: '31/40', minutes: 30, note: 'museum拼成meseum，其余填空全对', mistakeTags: ['拼写'] },
  // #9  听力
  { date: '2026-09-18', subject: 'listening', source: '剑雅 15 Test1', score: '32/40', minutes: 35, note: '跟丢情况减少，地图题indoor layout还差', mistakeTags: ['跟丢了'] },
  // #10 听力
  { date: '2026-09-20', subject: 'listening', source: '剑雅 15 Test2', score: '33/40', minutes: 30, note: '选择题定位准了，干扰项差点选错', mistakeTags: ['同义替换'] },
  // #11 听力
  { date: '2026-09-23', subject: 'listening', source: '剑雅 16 Test1', score: '33/40', minutes: 30, note: '同义替换反应够快，但environment拼错', mistakeTags: ['拼写'] },
  // #12 听力
  { date: '2026-09-26', subject: 'listening', source: '剑雅 16 Test2', score: '34/40', minutes: 35, note: '方位词全对，Section4也没跟丢', mistakeTags: [] },
  // #13 听力
  { date: '2026-09-29', subject: 'listening', source: '剑雅 17 Test1', score: '35/40', minutes: 25, note: '只错2个单复数，整体流畅', mistakeTags: ['单复数时态'] },
  // #14 听力
  { date: '2026-10-05', subject: 'listening', source: '剑雅 18 Test1', score: '36/40', minutes: 30, note: '几乎没跟丢，同义替换秒反应', mistakeTags: [] },
  // #15 听力
  { date: '2026-10-12', subject: 'listening', source: '剑雅 21 Test2', score: '32/40', minutes: 30, note: '选择题漏听定位词，语速跟上了但反应慢', mistakeTags: ['没听到', '跟丢了'] },
  // #16 阅读
  { date: '2026-09-01', subject: 'reading', source: '剑雅 11 Test1', score: '27/40', minutes: 45, note: 'T/F/NG第7题定位偏了两段，Heading超时', mistakeTags: ['TFNG混淆', '定位错'] },
  // #17 阅读
  { date: '2026-09-03', subject: 'reading', source: '剑雅 11 Test2', score: '28/40', minutes: 40, note: 'matching四道乱序，长难句第二段卡了5分钟', mistakeTags: ['定位错'] },
  // #18 阅读
  { date: '2026-09-05', subject: 'reading', source: '剑雅 12 Test1', score: '28/40', minutes: 45, note: 'NG和FALSE还是凭感觉选，没严格比对原文', mistakeTags: ['TFNG混淆'] },
  // #19 阅读
  { date: '2026-09-07', subject: 'reading', source: '剑雅 12 Test2', score: '29/40', minutes: 40, note: 'Heading做了12分钟还剩两篇没开始', mistakeTags: ['时间不够'] },
  // #20 阅读
  { date: '2026-09-09', subject: 'reading', source: '剑雅 13 Test1', score: '30/40', minutes: 50, note: 'matching用排除法对了3个，但定位偏差仍在', mistakeTags: ['定位错'] },
  // #21 阅读
  { date: '2026-09-12', subject: 'reading', source: '剑雅 13 Test2', score: '30/40', minutes: 40, note: '长难句定语从句嵌套看了三遍才懂', mistakeTags: ['时间不够'] },
  // #22 阅读
  { date: '2026-09-14', subject: 'reading', source: '剑雅 14 Test1', score: '31/40', minutes: 40, note: 'NG/FALSE只错1个，Heading速度提升明显', mistakeTags: ['TFNG混淆'] },
  // #23 阅读
  { date: '2026-09-16', subject: 'reading', source: '剑雅 14 Test2', score: '32/40', minutes: 45, note: 'matching不乱了，但最后一篇只剩3分钟', mistakeTags: ['时间不够'] },
  // #24 阅读
  { date: '2026-09-18', subject: 'reading', source: '剑雅 15 Test1', score: '32/40', minutes: 40, note: 'T/F/NG这次全对，速度也够', mistakeTags: [] },
  // #25 阅读
  { date: '2026-09-20', subject: 'reading', source: '剑雅 15 Test2', score: '33/40', minutes: 40, note: 'Heading正确率提升到全对，时间刚好用完', mistakeTags: [] },
  // #26 阅读
  { date: '2026-09-24', subject: 'reading', source: '剑雅 16 Test1', score: '34/40', minutes: 40, note: 'matching全对，长难句也不卡了', mistakeTags: [] },
  // #27 阅读
  { date: '2026-09-27', subject: 'reading', source: '剑雅 16 Test2', score: '33/40', minutes: 45, note: 'Passage3时间偏紧只剩1分钟检查', mistakeTags: ['时间不够'] },
  // #28 阅读
  { date: '2026-09-30', subject: 'reading', source: '剑雅 17 Test1', score: '34/40', minutes: 40, note: 'T/F/NG全对，但Passage3还是紧', mistakeTags: [] },
  // #29 阅读
  { date: '2026-10-04', subject: 'reading', source: '剑雅 18 Test1', score: '35/40', minutes: 35, note: '时间从容还剩5分钟检查，正确率稳定', mistakeTags: [] },
  // #30 阅读
  { date: '2026-10-10', subject: 'reading', source: '剑雅 22 Test1', score: '38/40', minutes: 40, note: 'NG/FALSE完全不混淆了，全篇从容', mistakeTags: [] },
  // #31 写作
  { date: '2026-09-02', subject: 'writing', source: '剑雅 11 Task1', score: '', minutes: 40, note: '柱状图趋势词只会increase/decrease，时态全错', mistakeTags: [] },
  // #32 写作
  { date: '2026-09-04', subject: 'writing', source: '剑雅 11 Task2', score: '', minutes: 50, note: '论点只写了一层就没展开，衔接词翻来覆去however', mistakeTags: [] },
  // #33 写作
  { date: '2026-09-08', subject: 'writing', source: '剑雅 12 Task1', score: '', minutes: 40, note: '流程图步骤漏写了两步，被动语态不会用', mistakeTags: [] },
  // #34 写作
  { date: '2026-09-11', subject: 'writing', source: '剑雅 13 Task2', score: '', minutes: 55, note: '词汇翻来覆去用important，衔接全靠firstly', mistakeTags: [] },
  // #35 写作
  { date: '2026-09-15', subject: 'writing', source: '剑雅 14 Task1', score: '', minutes: 40, note: '饼图数据对比只会while/whereas，句式单一', mistakeTags: [] },
  // #36 写作
  { date: '2026-09-19', subject: 'writing', source: '剑雅 15 Task2', score: '', minutes: 55, note: '论点展开了两层但第三段时态混用', mistakeTags: [] },
  // #37 写作
  { date: '2026-09-22', subject: 'writing', source: '剑雅 16 Task1', score: '', minutes: 45, note: '数据对比用了outnumber/account for，语法仍需查', mistakeTags: [] },
  // #38 写作
  { date: '2026-09-26', subject: 'writing', source: '剑雅 17 Task2', score: '', minutes: 50, note: '论点展开充分，衔接用了furthermore/in contrast', mistakeTags: [] },
  // #39 写作
  { date: '2026-10-02', subject: 'writing', source: '剑雅 18 Task1', score: '', minutes: 40, note: '折线图描述清晰，趋势词多样性提升', mistakeTags: [] },
  // #40 写作
  { date: '2026-10-08', subject: 'writing', source: '剑雅 21 Task2', score: '', minutes: 50, note: '逻辑连贯词汇丰富，语法只有1处时态错', mistakeTags: [] },
  // #41 口语
  { date: '2026-09-03', subject: 'speaking', source: '剑雅 11 Part2', score: '', minutes: 20, note: '说到第三个点卡住了，素材完全没准备', mistakeTags: ['流利度'] },
  // #42 口语
  { date: '2026-09-06', subject: 'speaking', source: '剑雅 11 Part3', score: '', minutes: 25, note: '考官追问why跑题了，词汇量明显不够', mistakeTags: ['词汇'] },
  // #43 口语
  { date: '2026-09-09', subject: 'speaking', source: '剑雅 12 Part2', score: '', minutes: 20, note: '描述人物卡了三次，th发音全吞了', mistakeTags: ['流利度', '发音'] },
  // #44 口语
  { date: '2026-09-13', subject: 'speaking', source: '剑雅 13 Part3', score: '', minutes: 25, note: '观点说了一句就停了，不知道怎么展开', mistakeTags: ['流利度'] },
  // #45 口语
  { date: '2026-09-17', subject: 'speaking', source: '剑雅 14 Part2', score: '', minutes: 20, note: '素材熟了但语速太快显得不自然', mistakeTags: ['发音'] },
  // #46 口语
  { date: '2026-09-21', subject: 'speaking', source: '剑雅 15 Part3', score: '', minutes: 25, note: '能延伸了但good/bad反复出现', mistakeTags: ['词汇'] },
  // #47 口语
  { date: '2026-09-25', subject: 'speaking', source: '剑雅 16 Part2', score: '', minutes: 20, note: '卡顿比之前少一半，但v发音仍吞', mistakeTags: ['发音'] },
  // #48 口语
  { date: '2026-09-28', subject: 'speaking', source: '剑雅 17 Part3', score: '', minutes: 25, note: '展开观点没问题，偶尔跑题能自己拉回来', mistakeTags: [] },
  // #49 口语
  { date: '2026-10-03', subject: 'speaking', source: '剑雅 18 Part2', score: '', minutes: 20, note: '流利度明显提升，素材已内化', mistakeTags: [] },
  // #50 口语
  { date: '2026-10-11', subject: 'speaking', source: '剑雅 21 Part2', score: '', minutes: 20, note: '全程无卡顿，发音清晰自然', mistakeTags: [] },
]

// 自检：50条，50个不同标题组合（subject+source），50=50 通过
