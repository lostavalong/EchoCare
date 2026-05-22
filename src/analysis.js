const EMOTIONS = [
  {
    id: 'anxious',
    label: '焦虑',
    tone: '需要放慢',
    color: '#7c6be8',
    words: ['焦虑', '担心', '害怕', '紧张', '压力', '慌', '烦', '崩溃', '考试', '展示', 'ddl', 'deadline'],
    stressBase: 72,
  },
  {
    id: 'sad',
    label: '低落',
    tone: '需要陪伴',
    color: '#5d8ac7',
    words: ['难过', '低落', '委屈', '孤独', '失落', '想哭', '没有动力', '沮丧'],
    stressBase: 62,
  },
  {
    id: 'tired',
    label: '疲惫',
    tone: '需要休息',
    color: '#6e8f99',
    words: ['累', '疲惫', '困', '睡不好', '熬夜', '失眠', '没精神', '头疼'],
    stressBase: 58,
  },
  {
    id: 'happy',
    label: '开心',
    tone: '值得保存',
    color: '#ef9f4f',
    words: ['开心', '快乐', '轻松', '顺利', '完成', '喜欢', '满意', '散步', '朋友'],
    stressBase: 24,
  },
  {
    id: 'calm',
    label: '平静',
    tone: '稳定温和',
    color: '#4f9f88',
    words: ['平静', '还好', '稳定', '放松', '安静', '呼吸', '慢慢', '可以接受'],
    stressBase: 35,
  },
];

const KEYWORD_RULES = [
  { label: '学习任务', words: ['作业', '课程', '考试', '论文', '展示', '复习', 'ddl', 'deadline', '学习'] },
  { label: '睡眠', words: ['睡', '失眠', '熬夜', '困', '梦', '早醒'] },
  { label: '人际关系', words: ['朋友', '同学', '家人', '老师', '室友', '聊天', '关系'] },
  { label: '未来规划', words: ['未来', '工作', '实习', '毕业', '选择', '方向'] },
  { label: '身体状态', words: ['身体', '头疼', '胃', '生病', '不舒服', '疲惫'] },
  { label: '自我要求', words: ['必须', '应该', '来不及', '不够好', '失败', '拖延'] },
];

const PLAYLISTS = {
  anxious: [
    song('anxious-kind-of-blue', 'Blue in Green', 'Miles Davis', '爵士', '松弛', 18, '小号与钢琴留出很多呼吸空间，适合把紧绷感慢慢放低。'),
    song('anxious-clair-de-lune', 'Clair de Lune', 'Claude Debussy', '古典', '月光感', 16, '柔和的印象派钢琴能让注意力从担心回到身体。'),
    song('anxious-weightless', 'Weightless', 'Marconi Union', '氛围', '舒缓', 12, '缓慢铺陈的环境声适合做短暂呼吸练习。'),
    song('anxious-bloom', 'Bloom', 'The Paper Kites', '民谣', '温柔', 24, '轻人声和稳定节奏能降低临场前的不安。'),
    song('anxious-yellow', 'Yellow', 'Coldplay', '流行', '陪伴', 42, '明亮但不过分兴奋，适合在压力里保留一点支持感。'),
    song('anxious-night-sky', '夜空中最亮的星', '逃跑计划', '华语流行', '向前', 48, '在焦虑中补充一点行动感和希望感。'),
    song('anxious-gymnopedie', 'Gymnopedie No.1', 'Erik Satie', '古典', '极简', 14, '重复而克制的旋律适合把脑内杂音降下来。'),
  ],
  sad: [
    song('sad-autumn-leaves', 'Autumn Leaves', 'Cannonball Adderley', '爵士', '陪伴', 28, '温暖的爵士线条适合承接低落，而不是强行振奋。'),
    song('sad-fix-you', 'Fix You', 'Coldplay', '流行', '安慰', 40, '从低处慢慢抬升，适合需要一点托举感的时候。'),
    song('sad-cello-suite', 'Cello Suite No.1 Prelude', 'J. S. Bach', '古典', '沉静', 20, '大提琴音色厚实，能给低落状态一些稳定支撑。'),
    song('sad-better-together', 'Better Together', 'Jack Johnson', '民谣', '轻柔', 32, '轻松木吉他能减少孤独感，让情绪更容易被安放。'),
    song('sad-lucky', '小幸运', '田馥甄', '华语流行', '温暖', 45, '旋律熟悉而柔软，适合把注意力转向被珍惜的关系。'),
    song('sad-ordinary-day', '平凡的一天', '毛不易', '华语民谣', '生活感', 36, '把情绪放回普通日常，减少“只有我这样”的孤立感。'),
    song('sad-misty', 'Misty', 'Erroll Garner', '爵士', '柔和', 24, '钢琴爵士的朦胧质感适合慢慢消化委屈。'),
  ],
  tired: [
    song('tired-nuvole', 'Nuvole Bianche', 'Ludovico Einaudi', '古典', '睡前', 15, '节奏舒展，适合休息前缓慢沉静下来。'),
    song('tired-blue-bossa', 'Blue Bossa', 'Joe Henderson', '爵士', '松弛', 30, '轻微律动但不刺激，适合疲惫时恢复一点弹性。'),
    song('tired-mystery', 'Mystery of Love', 'Sufjan Stevens', '民谣', '轻柔', 24, '声音轻盈，不会增加额外负担。'),
    song('tired-a-walk', 'A Walk', 'Tycho', '电子', '恢复', 34, '稳定律动适合短暂恢复能量。'),
    song('tired-goodnight', '晚安', '颜人中', '华语流行', '睡前', 35, '直接回应疲惫时对休息的需要。'),
    song('tired-moon-river', 'Moon River', 'Audrey Hepburn', '经典流行', '安静', 18, '旋律轻柔，适合把一天温和收束。'),
    song('tired-pavane', 'Pavane pour une infante defunte', 'Maurice Ravel', '古典', '缓慢', 12, '慢速管弦乐能帮助身体进入低唤醒状态。'),
  ],
  happy: [
    song('happy-sun', 'Here Comes the Sun', 'The Beatles', '流行', '明亮', 58, '明亮旋律适合延续积极状态。'),
    song('happy-take-five', 'Take Five', 'The Dave Brubeck Quartet', '爵士', '轻快', 44, '不规则节拍有轻盈的新鲜感，适合快乐时探索。'),
    song('happy-spring', 'Spring I', 'Max Richter', '古典', '清新', 46, '弦乐带来开阔感，适合保存今天的好状态。'),
    song('happy-rice', '稻香', '周杰伦', '华语流行', '轻快', 52, '轻快但不吵闹，适合记录小确幸。'),
    song('happy-best-day', 'Best Day of My Life', 'American Authors', '流行摇滚', '活力', 66, '强化完成感和正向记忆。'),
    song('happy-new-soul', 'New Soul', 'Yael Naim', '独立流行', '清新', 54, '轻盈俏皮，适合愉快散步场景。'),
    song('happy-l-o-v-e', 'L-O-V-E', 'Nat King Cole', '爵士', '甜暖', 45, '温暖人声适合把喜悦分享给别人。'),
  ],
  calm: [
    song('calm-comptine', 'Comptine d’un autre ete', 'Yann Tiersen', '古典', '钢琴', 20, '保持平静，同时给情绪一点细腻出口。'),
    song('calm-waltz-debby', 'Waltz for Debby', 'Bill Evans', '爵士', '温和', 28, '钢琴三重奏柔软克制，适合安静回顾。'),
    song('calm-sunset', 'Sunset Lover', 'Petit Biscuit', '电子', '松弛', 34, '柔和电子声适合平稳收束一天。'),
    song('calm-years', '岁月神偷', '金玟岐', '华语流行', '温和', 36, '温和叙事感，适合安静回顾。'),
    song('calm-banana', 'Banana Pancakes', 'Jack Johnson', '民谣', '日常', 30, '轻松、日常，适合保持稳定心情。'),
    song('calm-air', 'Air on the G String', 'J. S. Bach', '古典', '安定', 14, '舒缓弦乐能帮助维持稳定节奏。'),
    song('calm-dream', 'Dream a Little Dream of Me', 'Ella Fitzgerald', '爵士', '柔软', 26, '温柔人声适合睡前或独处片刻。'),
  ],
};

const BOOKS = {
  anxious: {
    id: 'book-courage-to-be-disliked',
    title: '被讨厌的勇气',
    author: '岸见一郎、古贺史健',
    theme: '边界与勇气',
    reason: '适合在过度担心评价和结果时，重新区分自己能控制的事情。',
    quote: {
      label: '灵感摘句',
      text: '课题分离之后，你只需要负责自己真诚走出的那一步。',
    },
    comfort: '先把自己放回当下。今天不需要一次解决全部问题，只需要把最小的一步完成。',
  },
  sad: {
    id: 'book-toad-therapy',
    title: '蛤蟆先生去看心理医生',
    author: '罗伯特·戴博德',
    theme: '情绪理解',
    reason: '用温和故事讲述情绪理解，适合低落时慢慢恢复自我关照。',
    quote: {
      label: '灵感摘句',
      text: '当你愿意看见悲伤，它就不再只能躲在心里发冷。',
    },
    comfort: '你现在的难过不是软弱，它只是提醒你需要被认真照顾。',
  },
  tired: {
    id: 'book-maybe-talk',
    title: '也许你该找个人聊聊',
    author: '洛莉·戈特利布',
    theme: '修复与支持',
    reason: '适合在疲惫时看见人的脆弱与修复过程，减少独自硬撑的感觉。',
    quote: {
      label: '灵感摘句',
      text: '人不是靠一直坚强才走下去，也靠被理解后的松一口气。',
    },
    comfort: '休息不是退步。允许自己慢下来，才有力气继续走。',
  },
  happy: {
    id: 'book-little-prince',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    theme: '关系与珍惜',
    reason: '适合把今天的明亮时刻保存下来，提醒自己珍惜关系和感受。',
    quote: {
      label: '短摘句',
      text: '重要的东西，用眼睛是看不见的。',
    },
    comfort: '把今天值得开心的片段记下来，它会成为以后支持你的证据。',
  },
  calm: {
    id: 'book-walden',
    title: '瓦尔登湖',
    author: '亨利·戴维·梭罗',
    theme: '独处与平静',
    reason: '适合平静状态下阅读，帮助用户维持简洁、稳定的生活节奏。',
    quote: {
      label: '灵感摘句',
      text: '把生活过得简单一些，心里就会多出能听见自己的地方。',
    },
    comfort: '平静本身就是一种很好的答案。你已经在认真听见自己。',
  },
};

const DEFAULT_EMOTION = EMOTIONS.find((emotion) => emotion.id === 'calm');

function song(id, title, artist, genre, mood, energy, reason) {
  return { id, title, artist, genre, mood, energy, reason };
}

function countMatches(text, words) {
  const lowerText = text.toLowerCase();
  return words.reduce((count, word) => count + (lowerText.includes(word.toLowerCase()) ? 1 : 0), 0);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function detectEmotion(text) {
  const scored = EMOTIONS.map((emotion) => ({
    ...emotion,
    score: countMatches(text, emotion.words),
  })).sort((a, b) => b.score - a.score || b.stressBase - a.stressBase);

  return scored[0].score > 0 ? scored[0] : DEFAULT_EMOTION;
}

function detectKeywords(text) {
  const keywords = KEYWORD_RULES.filter((rule) => countMatches(text, rule.words) > 0).map((rule) => rule.label);
  return keywords.length > 0 ? keywords : ['自我觉察'];
}

function calculateStress(text, emotion, keywords) {
  const highStressWords = ['非常', '特别', '很', '崩溃', '来不及', '睡不好', '担心', '压力', '焦虑'];
  const positiveWords = ['开心', '轻松', '顺利', '完成', '满意', '平静'];
  const highStressBonus = countMatches(text, highStressWords) * 4;
  const positiveRelief = countMatches(text, positiveWords) * 5;
  const keywordBonus = Math.max(0, keywords.length - 1) * 3;
  return clamp(Math.round(emotion.stressBase + highStressBonus + keywordBonus - positiveRelief), 8, 96);
}

function buildFeedback(emotion, stress, keywords) {
  if (emotion.id === 'happy') {
    return '你今天的表达里有明显的积极体验，' + keywords[0] + '给你带来了支持感。';
  }
  if (emotion.id === 'anxious') {
    return '你提到的' + keywords[0] + '正在占用较多心理能量，当前更适合先降低紧绷感。';
  }
  if (emotion.id === 'tired') {
    return '你现在更像是在透支后的疲惫状态，压力值约为 ' + stress + '，需要给身体一点恢复空间。';
  }
  if (emotion.id === 'sad') {
    return '你的文字里有低落和需要被理解的部分，可以先允许这种感受存在。';
  }
  return '你的状态整体比较平稳，可以继续保持这种清晰而温和的节奏。';
}

function buildSuggestion(emotion) {
  const suggestions = {
    anxious: '做 3 轮 4-6 呼吸，然后只写下明天最重要的一件小事。',
    sad: '给自己倒一杯温水，发一条不需要解释太多的消息给可信任的人。',
    tired: '把今晚任务缩短到 20 分钟以内，优先睡眠和身体恢复。',
    happy: '记录今天最值得保留的一个瞬间，让积极体验被看见。',
    calm: '保持当前节奏，睡前用两句话复盘今天完成的事情。',
  };
  return suggestions[emotion.id];
}

function topCount(counts, fallback) {
  const entries = Object.entries(counts || {}).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries[0][0] : fallback;
}

function increment(map, key, by = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + by;
}

function rankPlaylistForProfile(playlist, profile, emotionId) {
  const genreCounts = profile.genreCounts || {};
  const moodCounts = profile.moodCounts || {};
  const emotionGenreCounts = (profile.emotionGenreCounts || {})[emotionId] || {};
  const topGenre = profile.topGenre;

  return [...playlist]
    .map((item, index) => {
      let score = 100 - index;
      score += (genreCounts[item.genre] || 0) * 8;
      score += (moodCounts[item.mood] || 0) * 4;
      score += (emotionGenreCounts[item.genre] || 0) * 12;
      if (item.genre === topGenre) score += 10;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((ranked) => ranked.item);
}

function playlistFor(emotionId, profile) {
  const base = PLAYLISTS[emotionId].map((item) => ({ ...item, emotionId }));
  return profile && profile.favoriteCount ? rankPlaylistForProfile(base, profile, emotionId) : base;
}

export function buildMusicPreferenceProfile(favorites = []) {
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const genreCounts = {};
  const moodCounts = {};
  const emotionCounts = {};
  const emotionGenreCounts = {};
  const now = Date.now();

  for (const [index, favorite] of safeFavorites.entries()) {
    const savedTime = favorite.savedAt ? Date.parse(favorite.savedAt) : now - index * 86400000;
    const ageDays = Number.isFinite(savedTime) ? Math.max(0, (now - savedTime) / 86400000) : index;
    const recencyWeight = 1 + Math.max(0, 0.35 - ageDays * 0.025);
    const orderWeight = 1 + Math.max(0, (safeFavorites.length - index - 1) * 0.03);
    const weight = round2(recencyWeight * orderWeight);

    increment(genreCounts, favorite.genre, weight);
    increment(moodCounts, favorite.mood, weight);
    increment(emotionCounts, favorite.emotionId, weight);
    if (favorite.emotionId && favorite.genre) {
      emotionGenreCounts[favorite.emotionId] = emotionGenreCounts[favorite.emotionId] || {};
      increment(emotionGenreCounts[favorite.emotionId], favorite.genre, weight);
    }
  }

  const topGenre = topCount(genreCounts, '尚未形成');
  const topMood = topCount(moodCounts, '尚未形成');
  const topEmotion = topCount(emotionCounts, '尚未形成');
  const totalWeight = Object.values(genreCounts).reduce((sum, value) => sum + value, 0);
  const topWeight = genreCounts[topGenre] || 0;
  const confidence = totalWeight ? round2(topWeight / totalWeight) : 0;
  const diversity = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, weight]) => ({ genre, weight: round2(weight), ratio: totalWeight ? round2(weight / totalWeight) : 0 }));
  const secondaryGenre = diversity[1]?.genre;

  return {
    favoriteCount: safeFavorites.length,
    genreCounts,
    moodCounts,
    emotionCounts,
    emotionGenreCounts,
    topGenre,
    topMood,
    topEmotion,
    confidence,
    diversity,
    narrative: safeFavorites.length
      ? '用户的音乐调节偏好呈现' + topGenre + (secondaryGenre ? '与' + secondaryGenre : '') + '的综合色彩，最常保存“' + topMood + '”气质，常在' + emotionLabel(topEmotion) + '状态下收藏。'
      : '收藏歌曲后，EchoCare 会逐步描摹用户在不同情绪下偏好的音乐类型。',
  };
}

export function buildReadingPreferenceProfile(favorites = []) {
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const themeCounts = {};
  const emotionCounts = {};

  for (const favorite of safeFavorites) {
    increment(themeCounts, favorite.theme);
    increment(emotionCounts, favorite.emotionId);
  }

  const topTheme = topCount(themeCounts, '尚未形成');
  const topEmotion = topCount(emotionCounts, '尚未形成');

  return {
    favoriteCount: safeFavorites.length,
    themeCounts,
    emotionCounts,
    topTheme,
    topEmotion,
    narrative: safeFavorites.length
      ? '用户更容易被“' + topTheme + '”主题的文字安慰，尤其在' + emotionLabel(topEmotion) + '状态下会保存书摘。'
      : '收藏书籍或摘句后，EchoCare 会形成用户偏好的文字安慰画像。',
  };
}

function emotionLabel(emotionId) {
  const emotion = EMOTIONS.find((item) => item.id === emotionId);
  return emotion ? emotion.label : emotionId;
}

export function analyzeEntry(text, preferenceProfile = {}) {
  const normalizedText = String(text || '').trim();
  const safeText = normalizedText || '今天暂时说不清楚自己的状态，但我愿意停下来感受一下。';
  const emotion = detectEmotion(safeText);
  const keywords = detectKeywords(safeText);
  const stress = calculateStress(safeText, emotion, keywords);
  const book = BOOKS[emotion.id];

  return {
    id: 'entry-' + Date.now() + '-' + Math.random().toString(16).slice(2),
    text: safeText,
    emotion: {
      id: emotion.id,
      label: emotion.label,
      tone: emotion.tone,
      color: emotion.color,
    },
    stress,
    keywords,
    feedback: buildFeedback(emotion, stress, keywords),
    suggestion: buildSuggestion(emotion),
    playlist: playlistFor(emotion.id, preferenceProfile),
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      theme: book.theme,
      reason: book.reason,
      quote: { ...book.quote },
      emotionId: emotion.id,
    },
    comfortText: book.comfort,
    createdAt: new Date().toISOString(),
  };
}

export function getWeeklySummary(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  if (safeEntries.length === 0) {
    return {
      total: 0,
      averageStress: 0,
      dominantEmotion: { id: 'calm', label: '暂无记录' },
      topKeywords: [],
      narrative: '还没有记录。完成一次语音日记后，这里会生成一周情绪概览。',
    };
  }

  const averageStress = Math.round(safeEntries.reduce((sum, entry) => sum + entry.stress, 0) / safeEntries.length);
  const emotionCounts = new Map();
  const keywordCounts = new Map();

  for (const entry of safeEntries) {
    const emotionKey = entry.emotion.id;
    emotionCounts.set(emotionKey, {
      emotion: entry.emotion,
      count: (emotionCounts.get(emotionKey)?.count || 0) + 1,
    });
    for (const keyword of entry.keywords) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    }
  }

  const dominantEmotion = [...emotionCounts.values()].sort((a, b) => b.count - a.count)[0].emotion;
  const topKeywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([keyword]) => keyword);

  return {
    total: safeEntries.length,
    averageStress,
    dominantEmotion,
    topKeywords,
    narrative: '本周共记录 ' + safeEntries.length + ' 次，主要情绪是' + dominantEmotion.label + '，平均压力指数为 ' + averageStress + '。',
  };
}

const CRISIS_PATTERN = /(不想活|自杀|自残|伤害自己|伤害别人|活不下去|结束生命|撑不住了)/i;

const REGULATION_CARDS = [
  {
    id: 'anxiety-loop',
    title: '焦虑循环：先降唤醒，再处理问题',
    tag: '焦虑调节',
    emotions: ['anxious'],
    keywords: ['学习任务', '睡眠', '自我要求'],
    principle: '焦虑常由身体唤醒、灾难化想法和回避行为互相加强。先让身体慢下来，问题才更容易被拆开。',
    appliesTo: '适合反复担心结果、脑内停不下来、睡前更紧绷的时候。',
    practice: ['把担心写成一句具体预测，而不是一团感受。', '做 3 轮 4-6 呼吸，让呼气比吸气更长。', '写下一个 10 分钟内能开始的小动作。'],
  },
  {
    id: 'task-splitting',
    title: '任务切片：把压力从“全部”变成“下一步”',
    tag: '学习压力',
    emotions: ['anxious', 'tired'],
    keywords: ['学习任务', '自我要求'],
    principle: '大任务会让大脑把困难误读成危险。切成最小可执行动作，可以恢复控制感。',
    appliesTo: '适合 ddl、展示、论文、考试复习和拖延后的慌张。',
    practice: ['列出所有任务，只圈出今天必须推进的一件。', '把它改写成 20 分钟内能完成的动作。', '完成后只复盘下一步，不评价整个人。'],
  },
  {
    id: 'sleep-pressure-loop',
    title: '睡眠-压力循环：今晚先保护恢复',
    tag: '睡眠压力',
    emotions: ['anxious', 'tired'],
    keywords: ['睡眠', '身体状态'],
    principle: '睡眠不足会放大负面解释，压力又会让入睡更难。打断循环时，优先降低晚间唤醒水平。',
    appliesTo: '适合熬夜、早醒、睡不着、白天疲惫但晚上停不下来的状态。',
    practice: ['睡前 30 分钟把未完成事项写到明天清单。', '把屏幕和学习材料移出床边。', '用身体扫描替代反复思考问题。'],
  },
  {
    id: 'cognitive-reframing',
    title: '认知重评：区分事实、猜测和需要',
    tag: '认知行为',
    emotions: ['anxious', 'sad'],
    keywords: ['人际关系', '自我要求', '未来规划'],
    principle: '情绪不是错误，但自动想法可能把事实、猜测和自我评价混在一起。分开它们能减少被想法推着走。',
    appliesTo: '适合担心被评价、反复想失败、觉得自己不够好的时候。',
    practice: ['写下一个最刺痛你的想法。', '标出其中哪些是事实，哪些只是推测。', '把自我批评改写成一个可照顾的需要。'],
  },
  {
    id: 'emotion-acceptance',
    title: '情绪接纳：允许低落被看见',
    tag: '情绪理解',
    emotions: ['sad'],
    keywords: ['人际关系', '自我觉察'],
    principle: '低落常提示关系、意义或休息的需要。接纳不是放任，而是停止把情绪当成敌人。',
    appliesTo: '适合委屈、孤独、想哭、没有动力但仍想被理解的时候。',
    practice: ['给此刻情绪命名，不急着解释原因。', '写一句“我其实需要……”。', '联系一个不需要过度解释的人或空间。'],
  },
  {
    id: 'recovery-budget',
    title: '恢复预算：给身体留出心理电量',
    tag: '耗竭修复',
    emotions: ['tired'],
    keywords: ['身体状态', '睡眠'],
    principle: '疲惫不是意志力不足，而可能是持续消耗后的信号。恢复也需要被安排进计划。',
    appliesTo: '适合头疼、困倦、没精神、一直硬撑或效率明显下降。',
    practice: ['把今晚任务减到最低可交付版本。', '安排一段没有输入的休息时间。', '记录一个身体已经发出的提醒。'],
  },
  {
    id: 'positive-savoring',
    title: '积极巩固：把好状态存成资源',
    tag: '积极心理',
    emotions: ['happy', 'calm'],
    keywords: ['人际关系', '自我觉察'],
    principle: '积极体验需要被重复看见，才会变成以后可调用的心理资源。',
    appliesTo: '适合完成任务、关系支持、散步放松或平静稳定的时候。',
    practice: ['写下今天一个具体的好片段。', '标出它来自能力、关系还是环境支持。', '把这个片段收藏成下次低落时的证据。'],
  },
];

export const SCREENING_FORMS = {
  anxiety: {
    title: '焦虑风险筛查',
    subtitle: '回想最近两周，这些体验出现的频率。结果只用于自我觉察，不构成诊断。',
    options: ['完全没有', '几天', '一半以上天数', '几乎每天'],
    questions: ['紧张、不安或难以放松', '无法停止或控制担心', '对许多事情过度担心', '很难让自己安静下来', '坐立不安或身体紧绷', '容易烦躁或被小事触发', '担心会发生糟糕的事情'],
  },
  depression: {
    title: '低落风险筛查',
    subtitle: '回想最近两周，这些体验出现的频率。结果只用于自我觉察，不构成诊断。',
    options: ['完全没有', '几天', '一半以上天数', '几乎每天'],
    questions: ['对事情缺少兴趣或愉快感', '情绪低落、沮丧或无望', '睡眠变差或睡太多', '疲惫或缺少精力', '食欲明显变化', '对自己失望或自责', '难以集中注意力', '动作或说话变慢，或明显坐立不安', '出现伤害自己的想法'],
  },
};

function parseEntryDate(entry, fallbackNow) {
  const time = Date.parse(entry?.createdAt);
  return Number.isFinite(time) ? time : fallbackNow.getTime();
}

function monthlyWindowEntries(entries, now) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  return safeEntries.filter((entry) => parseEntryDate(entry, now) >= startTime && parseEntryDate(entry, now) <= now.getTime());
}

function countListValues(entries, selector) {
  const counts = {};
  for (const entry of entries) {
    const values = selector(entry);
    for (const value of Array.isArray(values) ? values : [values]) increment(counts, value);
  }
  return counts;
}

function sortedKeys(counts, limit = 3) {
  return Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function reportRecommendations(riskLevel, topKeywords) {
  const recommendations = [];
  if (topKeywords.includes('学习任务')) recommendations.push('把本周最重的任务拆成 20 分钟行动，先完成能启动的一步。');
  if (topKeywords.includes('睡眠')) recommendations.push('连续三晚优先做睡前降唤醒：写明日清单、减少屏幕、固定上床时间。');
  if (topKeywords.includes('人际关系')) recommendations.push('把人际压力分成事实、猜测和需要，先表达一个具体请求。');
  if (riskLevel === '建议专业评估') recommendations.push('如果高压状态持续两周以上，建议预约学校心理中心或专业人员做进一步评估。');
  if (riskLevel === '需要尽快求助') recommendations.push('如果有伤害自己的想法或计划，请立即联系身边可信任的人、学校心理中心或当地紧急服务。');
  if (!recommendations.length) recommendations.push('保持记录频率，每周回看一次最常出现的情绪和支持资源。');
  return recommendations.slice(0, 4);
}

export function buildMonthlyMentalReport(entries = [], options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const monthEntries = monthlyWindowEntries(entries, now);
  if (monthEntries.length === 0) {
    return {
      total: 0,
      averageStress: 0,
      dominantEmotion: { id: 'calm', label: '暂无记录' },
      topKeywords: [],
      riskLevel: '低',
      emotionPattern: '近 30 天还没有足够记录。完成几次记录后，这里会形成更稳定的心理画像。',
      pressureSources: [],
      maintainingFactors: ['记录不足，暂时不推断长期模式。'],
      protectiveFactors: ['愿意开始记录本身就是重要资源。'],
      recommendations: ['先完成一次真实记录，再回到概览生成近 30 天分析。'],
      screeningRecommended: false,
      screeningType: 'none',
      professionalHelpMessage: '当前信息不足，不进行诊断。EchoCare 只提供自我觉察和筛查提示。',
    };
  }

  const averageStress = Math.round(monthEntries.reduce((sum, entry) => sum + (Number(entry.stress) || 0), 0) / monthEntries.length);
  const emotionCounts = countListValues(monthEntries, (entry) => entry.emotion?.id || 'calm');
  const keywordCounts = countListValues(monthEntries, (entry) => entry.keywords || []);
  const dominantEmotionId = topCount(emotionCounts, 'calm');
  const dominantEmotion = EMOTIONS.find((emotion) => emotion.id === dominantEmotionId) || DEFAULT_EMOTION;
  const topKeywords = sortedKeys(keywordCounts, 4);
  const text = monthEntries.map((entry) => entry.text || '').join(' ');
  const crisis = monthEntries.some((entry) => CRISIS_PATTERN.test(entry.text || ''));
  const highStressCount = monthEntries.filter((entry) => Number(entry.stress) >= 70).length;
  const anxietySignal = (emotionCounts.anxious || 0) >= 2 || (topKeywords.includes('学习任务') && averageStress >= 60);
  const depressionSignal = (emotionCounts.sad || 0) >= 2 || countMatches(text, ['低落', '无望', '没动力', '想哭']) >= 2;
  const fatigueSignal = (emotionCounts.tired || 0) >= 2 || topKeywords.includes('睡眠');
  const sustainedDistress = highStressCount >= 3 || (averageStress >= 70 && monthEntries.length >= 2);

  let riskLevel = '低';
  if (crisis) riskLevel = '需要尽快求助';
  else if (sustainedDistress && (anxietySignal || depressionSignal || fatigueSignal)) riskLevel = '建议专业评估';
  else if (averageStress >= 55 || anxietySignal || depressionSignal || fatigueSignal) riskLevel = '关注';

  let screeningType = 'none';
  if (crisis) screeningType = 'crisis';
  else if (riskLevel === '建议专业评估' || riskLevel === '关注') {
    if (anxietySignal && depressionSignal) screeningType = 'both';
    else if (depressionSignal) screeningType = 'depression';
    else if (anxietySignal || fatigueSignal) screeningType = 'anxiety';
  }

  const pressureSources = topKeywords.length ? topKeywords : ['自我觉察'];
  const maintainingFactors = [];
  if (topKeywords.includes('睡眠')) maintainingFactors.push('睡眠不足可能放大担心和低落，让白天更难恢复。');
  if (topKeywords.includes('学习任务')) maintainingFactors.push('任务堆叠会让大脑把“还没完成”误读成持续威胁。');
  if (topKeywords.includes('自我要求')) maintainingFactors.push('过高自我要求可能让休息也带着负罪感。');
  if (topKeywords.includes('人际关系')) maintainingFactors.push('人际评价和边界不清会持续占用心理能量。');
  if (!maintainingFactors.length) maintainingFactors.push('当前压力来源较分散，建议继续记录以观察稳定模式。');

  const protectiveFactors = ['你已经在持续记录，这说明你仍在尝试理解和照顾自己。'];
  if ((emotionCounts.happy || 0) + (emotionCounts.calm || 0) > 0) protectiveFactors.push('记录中仍有平静或积极片段，可作为恢复时的心理资源。');
  if (monthEntries.some((entry) => (entry.keywords || []).includes('人际关系'))) protectiveFactors.push('关系线索反复出现，可信任的人可能是重要支持资源。');

  const emotionPattern = '近 30 天共记录 ' + monthEntries.length + ' 次，主要情绪是' + dominantEmotion.label + '，平均压力指数为 ' + averageStress + '。'
    + (riskLevel === '低' ? '整体暂未显示持续高风险，但仍建议保留规律记录。' : '压力信号已经值得认真对待，适合结合调节练习和筛查结果进一步观察。');
  const professionalHelpMessage = riskLevel === '需要尽快求助'
    ? '这不是诊断。若你正在担心自己会伤害自己或他人，请立即联系身边可信任的人、学校心理中心或当地紧急服务。'
    : riskLevel === '建议专业评估'
      ? '这不是诊断。当前记录提示持续高压风险，建议完成筛查；如果筛查分数偏高或状态持续影响学习、睡眠、人际，请预约学校心理中心、心理咨询师或医生做专业评估。'
      : '这不是诊断。EchoCare 只提供自我觉察和筛查提示；如果痛苦持续加重，仍建议寻求专业支持。';

  return {
    total: monthEntries.length,
    averageStress,
    dominantEmotion: { id: dominantEmotion.id, label: dominantEmotion.label },
    topKeywords,
    riskLevel,
    emotionPattern,
    pressureSources,
    maintainingFactors: maintainingFactors.slice(0, 4),
    protectiveFactors: protectiveFactors.slice(0, 3),
    recommendations: reportRecommendations(riskLevel, topKeywords),
    screeningRecommended: screeningType !== 'none',
    screeningType,
    professionalHelpMessage,
    source: 'local',
  };
}

function contextHasKeyword(context, keyword) {
  return (context.keywords || []).includes(keyword) || (context.report?.topKeywords || []).includes(keyword);
}

export function selectRegulationKnowledge(context = {}) {
  const emotionId = context.emotionId || context.report?.dominantEmotion?.id || 'calm';
  const matched = REGULATION_CARDS.filter((card) => {
    const emotionMatch = card.emotions.includes(emotionId);
    const keywordMatch = card.keywords.some((keyword) => contextHasKeyword(context, keyword));
    return emotionMatch || keywordMatch;
  });
  const required = [];
  if (emotionId === 'anxious') required.push('anxiety-loop');
  if (contextHasKeyword(context, '学习任务')) required.push('task-splitting');
  if (contextHasKeyword(context, '睡眠')) required.push('sleep-pressure-loop');

  const ordered = [];
  for (const id of required) {
    const card = REGULATION_CARDS.find((item) => item.id === id);
    if (card && !ordered.some((item) => item.id === id)) ordered.push(card);
  }
  for (const card of matched) {
    if (!ordered.some((item) => item.id === card.id)) ordered.push(card);
  }
  if (ordered.length < 3) {
    for (const card of REGULATION_CARDS) {
      if (!ordered.some((item) => item.id === card.id)) ordered.push(card);
      if (ordered.length >= 3) break;
    }
  }
  return ordered.slice(0, 5).map((card) => ({ ...card, practice: [...card.practice] }));
}

function screeningLevel(type, total) {
  const anxietyLevels = [
    { max: 4, level: '轻微焦虑风险', riskLevel: '低' },
    { max: 9, level: '轻度焦虑风险', riskLevel: '关注' },
    { max: 14, level: '中度焦虑风险', riskLevel: '关注' },
    { max: 21, level: '重度焦虑风险', riskLevel: '建议专业评估' },
  ];
  const depressionLevels = [
    { max: 4, level: '轻微低落风险', riskLevel: '低' },
    { max: 9, level: '轻度低落风险', riskLevel: '关注' },
    { max: 14, level: '中度低落风险', riskLevel: '建议专业评估' },
    { max: 19, level: '中重度低落风险', riskLevel: '建议专业评估' },
    { max: 27, level: '重度低落风险', riskLevel: '建议专业评估' },
  ];
  const levels = type === 'depression' ? depressionLevels : anxietyLevels;
  return levels.find((item) => total <= item.max) || levels[levels.length - 1];
}

export function scoreScreening(type, answers = []) {
  const form = SCREENING_FORMS[type] || SCREENING_FORMS.anxiety;
  const values = Array.from({ length: form.questions.length }, (_, index) => clamp(Math.round(Number(answers[index]) || 0), 0, 3));
  const total = values.reduce((sum, value) => sum + value, 0);
  const level = screeningLevel(type, total);
  const crisis = type === 'depression' && values[8] >= 2;
  const riskLevel = crisis ? '需要尽快求助' : level.riskLevel;
  const recommendation = crisis
    ? '筛查显示你近期出现较强自我伤害想法。请立即联系身边可信任的人、学校心理中心或当地紧急服务；不要独自承受。'
    : riskLevel === '建议专业评估'
      ? '筛查分数提示风险偏高，这不是诊断，但建议尽快预约学校心理中心、心理咨询师或医生做专业评估。'
      : riskLevel === '关注'
        ? '筛查分数提示需要关注。建议连续一周记录睡眠、压力和触发事件，并使用调节练习观察变化。'
        : '当前筛查分数较低。继续保持记录，把有效的支持方式保存下来。';

  return {
    type: SCREENING_FORMS[type] ? type : 'anxiety',
    total,
    max: form.questions.length * 3,
    level: crisis ? '危机风险提示' : level.level,
    riskLevel,
    recommendation,
    answers: values,
  };
}

export function scoreUxSurvey(answers) {
  const value = (key) => clamp(Number(answers?.[key]) || 0, 1, 5);
  const rawScores = [
    value('easyToUse'),
    value('clearFeedback'),
    value('voiceNatural'),
    value('recognitionAcceptable'),
    value('privacyTrust'),
    value('emotionalComfort'),
  ];
  const usability = round2((value('easyToUse') + value('clearFeedback')) / 2);
  const voiceSatisfaction = round2((value('voiceNatural') + value('recognitionAcceptable')) / 2);
  const privacyTrust = round2(value('privacyTrust'));
  const emotionalComfort = round2(value('emotionalComfort'));
  const overall = round2(rawScores.reduce((sum, score) => sum + score, 0) / rawScores.length);

  return {
    usability,
    voiceSatisfaction,
    privacyTrust,
    emotionalComfort,
    overall,
    summary: '整体体验评分为 ' + overall + '/5，其中可用性 ' + usability + '/5，语音满意度 ' + voiceSatisfaction + '/5，隐私信任 ' + privacyTrust + '/5，情绪表达舒适度 ' + emotionalComfort + '/5。',
  };
}
