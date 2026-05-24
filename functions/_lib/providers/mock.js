export async function generateMockReply({ message, requestId, env }) {
  console.log('[generate] Using Mock API', { requestId })

  const trimMsg = (message || '').trim()

  const MOCK_DB = {
    '你工资多少？': [
      { type: '温和可发版', reply: '刚好够花。您今天是以什么身份来做资产尽调的？', styleTag: '绵里藏针', sceneNote: '反击查户口', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '您是打算按我的工资标准给我发零花钱吗？', styleTag: '精准破防', sceneNote: '暗示对方管太宽', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '怎么，你兼职做税务局外包了？', styleTag: '荒谬解构', sceneNote: '把对方当成查税的', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '我日薪一爽，目前在看福布斯排行榜。', styleTag: '极度压迫', sceneNote: '纯属发疯', riskLevel: '特辣' }
    ],
    '你有房吗？': [
      { type: '温和可发版', reply: '有啊，您是来收物业费的还是来推销装修的？', styleTag: '绵里藏针', sceneNote: '反击盘问', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '如果有的话，需要在房产证上加您的名字吗？', styleTag: '精准破防', sceneNote: '讽刺对方算计', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '有啊，我QQ农场里有一套独栋别墅。', styleTag: '荒谬解构', sceneNote: '不正面回答', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '我的龙王神殿马上建好了，要来当门卫吗？', styleTag: '极度压迫', sceneNote: '中二发疯', riskLevel: '特辣' }
    ],
    '你怎么还没结婚？': [
      { type: '温和可发版', reply: '因为我不想随便找个人凑合，比如现在。', styleTag: '绵里藏针', sceneNote: '暗示对方就是凑合', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '您结婚早，是为了抢特价鸡蛋吗？', styleTag: '精准破防', sceneNote: '讽刺对方进度论', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '民政局没给我发通知啊，是要摇号了吗？', styleTag: '荒谬解构', sceneNote: '把结婚当行政指令', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '阎王爷没催我，怎么您先急了？', styleTag: '极度压迫', sceneNote: '极端反击', riskLevel: '特辣' }
    ],
    '女生太强势不好。': [
      { type: '温和可发版', reply: '是不好，容易衬托出男生的软弱。', styleTag: '绵里藏针', sceneNote: '反击爹味说教', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '女生太弱势，容易吸引到想占便宜的爹。', styleTag: '精准破防', sceneNote: '直戳痛点', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '那我改天去营业厅把套餐改成弱势版的。', styleTag: '荒谬解构', sceneNote: '把强势当套餐', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '对对对，我不仅强势，我还能徒手劈砖。', styleTag: '极度压迫', sceneNote: '顺势发疯', riskLevel: '特辣' }
    ],
    '我妈说属羊的不太好。': [
      { type: '温和可发版', reply: '阿姨这么迷信，平时生病是喝符水吗？', styleTag: '绵里藏针', sceneNote: '反击封建迷信', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '确实，属羊的容易克妈宝男。', styleTag: '精准破防', sceneNote: '直击妈宝本质', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '那你赶紧跑，属羊的晚上会变异。', styleTag: '荒谬解构', sceneNote: '恐怖片设定', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '我妈说没断奶的不能出来相亲。', styleTag: '极度压迫', sceneNote: '终极反击', riskLevel: '特辣' }
    ],
    '你要求是不是太高了？': [
      { type: '温和可发版', reply: '还行吧，主要是门槛这东西，低于底线容易绊脚。', styleTag: '绵里藏针', sceneNote: '反击廉价点评', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '您觉得高，可能是因为您刚好在坑底。', styleTag: '精准破防', sceneNote: '嘲讽对方条件差', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '怎么，你这边的及格线是负数吗？', styleTag: '荒谬解构', sceneNote: '数学维度反击', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '是啊，我连地球人都看不上，我等三体人呢。', styleTag: '极度压迫', sceneNote: '发疯回答', riskLevel: '特辣' }
    ],
    '刚抽的，帅吗？': [
      { type: '温和可发版', reply: '挺有精神的，不过我不算外貌协会。', styleTag: '绵里藏针', sceneNote: '冷漠应对自恋', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '帅，很有上世纪八十年代发廊总监的气质。', styleTag: '精准破防', sceneNote: '讽刺土味自恋', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '你是说盲盒刚抽出来的盲盒吗？', styleTag: '荒谬解构', sceneNote: '故意听不懂', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '帅得我闭上了眼睛，并且开始默念大悲咒。', styleTag: '极度压迫', sceneNote: '极端嘲讽', riskLevel: '特辣' }
    ],
    '婚后你能不能多照顾家庭？': [
      { type: '温和可发版', reply: '如果您能包揽开销，我考虑包揽家务。', styleTag: '绵里藏针', sceneNote: '反击免费保姆思维', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '您是来找伴侣的，还是来招无薪护工的？', styleTag: '精准破防', sceneNote: '点破剥削本质', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '我只照顾植物，您是哪种盆栽？', styleTag: '荒谬解构', sceneNote: '物种降级', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '我不仅照顾家庭，我还能单手挑粪！', styleTag: '极度压迫', sceneNote: '彻底发疯', riskLevel: '特辣' }
    ]
  }

  let cards = MOCK_DB[trimMsg]

  if (!cards) {
    cards = [
      { type: '温和可发版', reply: '您这句话的视角还挺独特的。', styleTag: '绵里藏针', sceneNote: '敷衍式回应', riskLevel: '安全' },
      { type: '有刺但不脏版', reply: '您平时跟别人聊天也都这么直白吗？', styleTag: '精准破防', sceneNote: '暗示对方没教养', riskLevel: '微辣' },
      { type: '日常脑回路错位版', reply: '您的系统是不是该升级了，有点听不懂。', styleTag: '荒谬解构', sceneNote: '把对方当机器', riskLevel: '中辣' },
      { type: '抽象整活版', reply: '对对对，你说的都对，地球围着你转。', styleTag: '极度压迫', sceneNote: '直接摆烂', riskLevel: '特辣' }
    ]
  }

  return {
    cards,
    fallback: true,
    message: '当前服务暂不可用，已为您切换到【满级嘴替演示模式】。'
  }
}
