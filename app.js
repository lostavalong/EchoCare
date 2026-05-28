import {
  analyzeEntry,
  buildMusicPreferenceProfile,
  buildReadingPreferenceProfile,
  buildMonthlyMentalReport,
  getWeeklySummary,
  scoreScreening,
  selectRegulationKnowledge,
  SCREENING_FORMS,
  scoreUxSurvey,
} from './src/analysis.js';

const STORAGE_KEY = 'echocare.entries.v1';
const SURVEY_KEY = 'echocare.survey.v1';
const MUSIC_FAVORITES_KEY = 'echocare.musicFavorites.v1';
const BOOK_FAVORITES_KEY = 'echocare.bookFavorites.v1';
const RECENT_SONGS_KEY = 'echocare.recentSongIds.v1';
const RECENT_SONG_LIMIT = 28;
const THEME_KEY = 'echocare.theme.v1';
const MONTHLY_REPORT_KEY = 'echocare.monthlyReport.v1';
const SCREENING_RESULTS_KEY = 'echocare.screeningResults.v1';
const REMOTE_ANALYSIS_URL = '/api/analyze';
const REMOTE_MONTHLY_URL = '/api/monthly-report';

const prompts = [
  '最近作业很多，我有点焦虑，晚上睡不好。',
  '今天和朋友散步聊天，很开心，感觉轻松。',
  '这几天有点累，想早点休息，但还有任务没有完成。',
];

const demoEntries = [
  '最近作业很多，我有点焦虑，晚上睡不好，担心明天的展示。',
  '今天和朋友一起散步聊天，很开心，也完成了计划，感觉轻松。',
  '这几天有点累，晚上总是熬夜，身体也不太舒服。',
];

const state = {
  entries: loadJson(STORAGE_KEY, []),
  musicFavorites: loadJson(MUSIC_FAVORITES_KEY, []),
  bookFavorites: loadJson(BOOK_FAVORITES_KEY, []),
  recentSongIds: loadJson(RECENT_SONGS_KEY, []),
  monthlyReport: loadJson(MONTHLY_REPORT_KEY, null),
  screeningResults: loadJson(SCREENING_RESULTS_KEY, {}),
  currentEntry: null,
  recognition: null,
  listening: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveEntries() {
  saveJson(STORAGE_KEY, state.entries);
}

function saveMusicFavorites() {
  saveJson(MUSIC_FAVORITES_KEY, state.musicFavorites);
}

function saveBookFavorites() {
  saveJson(BOOK_FAVORITES_KEY, state.bookFavorites);
}

function saveRecentSongIds() {
  saveJson(RECENT_SONGS_KEY, state.recentSongIds);
}

function saveMonthlyReport() {
  saveJson(MONTHLY_REPORT_KEY, state.monthlyReport);
}

function saveScreeningResults() {
  saveJson(SCREENING_RESULTS_KEY, state.screeningResults);
}

function musicProfile() {
  return {
    ...buildMusicPreferenceProfile(state.musicFavorites),
    recentSongIds: Array.isArray(state.recentSongIds) ? state.recentSongIds : [],
  };
}

function rememberRecommendedSongs(entry) {
  const ids = (entry?.playlist || []).map((song) => song.id).filter(Boolean);
  if (!ids.length) return;
  const previous = Array.isArray(state.recentSongIds) ? state.recentSongIds : [];
  state.recentSongIds = [...new Set([...ids, ...previous])].slice(0, RECENT_SONG_LIMIT);
  saveRecentSongIds();
}

function readingProfile() {
  return buildReadingPreferenceProfile(state.bookFavorites);
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function switchView(viewId) {
  $$('.view').forEach((view) => view.classList.toggle('active', view.id === viewId));
  $$('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === viewId));
  renderAll();
}

function latestEntry() {
  return state.currentEntry || state.entries[0] || null;
}

function currentMonthlyReport() {
  if (state.monthlyReport && state.monthlyReport.report) return state.monthlyReport.report;
  return buildMonthlyMentalReport(state.entries);
}

function monthlySourceLabel() {
  const source = state.monthlyReport && state.monthlyReport.source;
  if (source === 'deepseek') return 'DeepSeek AI';
  if (source === 'local') return '本地规则';
  return '本地预览';
}

function listHtml(items, fallback) {
  const safeItems = Array.isArray(items) && items.length ? items : [fallback];
  return '<ul>' + safeItems.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
}

function monthlyColumn(title, items, fallback) {
  return '<article><strong>' + escapeHtml(title) + '</strong>' + listHtml(items, fallback) + '</article>';
}

function renderMonthlyReport() {
  const report = currentMonthlyReport();
  const risk = document.querySelector('#monthlyRisk');
  risk.textContent = report.riskLevel || '低';
  risk.dataset.risk = report.riskLevel || '低';
  document.querySelector('#monthlySource').textContent = monthlySourceLabel();
  document.querySelector('#monthlyPattern').textContent = report.emotionPattern || '完成几次记录后，这里会生成近 30 天情绪模式与调节建议。';
  document.querySelector('#monthlyColumns').innerHTML = monthlyColumn('压力来源', report.pressureSources, '等待更多记录')
    + monthlyColumn('维持因素', report.maintainingFactors, '暂不推断长期模式')
    + monthlyColumn('保护资源', report.protectiveFactors, '愿意记录就是资源');

  const callout = document.querySelector('#screeningCallout');
  callout.hidden = !report.screeningRecommended;
  if (report.screeningRecommended) {
    const action = report.screeningType === 'crisis' ? '查看紧急支持提示' : '填写筛查问卷';
    callout.dataset.risk = report.riskLevel || '关注';
    callout.innerHTML = '<strong>' + escapeHtml(report.riskLevel || '关注') + '</strong><p>' + escapeHtml(report.professionalHelpMessage) + '</p><button class="text-button" type="button" data-open-screening="true">' + action + '</button>';
  }
}

function renderRegulation() {
  const entry = latestEntry();
  const report = currentMonthlyReport();
  const emotionId = entry ? entry.emotion.id : report.dominantEmotion.id;
  const keywords = entry ? entry.keywords : report.topKeywords;
  const cards = selectRegulationKnowledge({ emotionId, keywords, report });
  document.querySelector('#regulationFocus').textContent = (report.dominantEmotion.label || '当前状态') + ' · ' + (report.riskLevel || '低');
  document.querySelector('#regulationIntro').textContent = report.emotionPattern || '完成记录后，EchoCare 会把心理学调节知识匹配到你的当前状态。';
  document.querySelector('#knowledgeCards').innerHTML = cards.map(knowledgeCard).join('');
  renderScreeningPanel(report);
}

function knowledgeCard(card) {
  return '<article class="knowledge-card"><span>' + escapeHtml(card.tag) + '</span><h3>' + escapeHtml(card.title) + '</h3><p>' + escapeHtml(card.principle) + '</p><small>' + escapeHtml(card.appliesTo) + '</small>' + listHtml(card.practice, '先完成一个很小的照顾动作') + '</article>';
}

function screeningTypes(report) {
  if (!report.screeningRecommended) return [];
  if (report.screeningType === 'both') return ['anxiety', 'depression'];
  if (report.screeningType === 'depression') return ['depression'];
  if (report.screeningType === 'crisis') return ['crisis'];
  return ['anxiety'];
}

function renderScreeningPanel(report) {
  const panel = document.querySelector('#screeningPanel');
  const types = screeningTypes(report);
  panel.hidden = types.length === 0;
  if (!types.length) return;

  if (types[0] === 'crisis') {
    panel.innerHTML = '<div class="screening-alert danger"><span>紧急支持</span><h3>请优先保证安全</h3><p>' + escapeHtml(report.professionalHelpMessage) + '</p></div>';
    return;
  }

  panel.innerHTML = '<div class="section-heading"><div><p class="soft-label">Screening</p><h3>风险筛查问卷</h3></div><span class="status-pill">非诊断</span></div>'
    + '<p class="screening-note">问卷只用于课程原型中的自我觉察和风险提示，不替代心理咨询或医疗诊断。</p>'
    + types.map(screeningForm).join('');
}

function screeningForm(type) {
  const form = SCREENING_FORMS[type];
  const result = state.screeningResults[type];
  const questions = form.questions.map((question, index) => screeningQuestion(type, question, index, form.options)).join('');
  const resultHtml = result ? '<div class="screening-result" data-risk="' + escapeHtml(result.riskLevel) + '"><strong>' + result.total + '/' + result.max + ' · ' + escapeHtml(result.level) + '</strong><p>' + escapeHtml(result.recommendation) + '</p></div>' : '';
  return '<form class="screening-form" data-screening-type="' + type + '"><h4>' + escapeHtml(form.title) + '</h4><p>' + escapeHtml(form.subtitle) + '</p>' + questions + '<button class="primary-action" type="submit">生成筛查结果</button>' + resultHtml + '</form>';
}

function screeningQuestion(type, question, index, options) {
  const buttons = options.map((option, value) => '<button class="screen-option' + (value === 0 ? ' active' : '') + '" type="button" data-screening-type="' + type + '" data-question-index="' + index + '" data-screening-value="' + value + '">' + escapeHtml(option) + '</button>').join('');
  return '<div class="screen-question"><label>' + escapeHtml(question) + '</label><input type="hidden" name="q' + index + '" value="0" /><div class="screen-options">' + buttons + '</div></div>';
}

function invalidateMonthlyReport() {
  state.monthlyReport = null;
  localStorage.removeItem(MONTHLY_REPORT_KEY);
}

function renderDashboard() {
  const latest = latestEntry();
  $('#todayLabel').textContent = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date());
  $('#entryCount').textContent = String(state.entries.length);

  if (!latest) {
    $('#currentEmotion').textContent = '暂无';
    $('#currentStress').textContent = '--';
    $('#heroStress').textContent = '--';
    $('#todayMessage').textContent = '用一段语音记录此刻状态，EchoCare 会帮你整理情绪、压力和适合的陪伴内容。';
  } else {
    $('#currentEmotion').textContent = latest.emotion.label;
    $('#currentStress').textContent = String(latest.stress);
    $('#heroStress').textContent = String(latest.stress);
    $('#todayMessage').textContent = latest.feedback;
  }

  const recent = state.entries.slice(0, 3);
  $('#recentEntries').innerHTML = recent.length
    ? recent.map(entryCard).join('')
    : '<article class="entry-item"><strong>还没有记录</strong><p>可以先载入示例，或进入记录页完成一次情绪日记。</p></article>';
  renderMonthlyReport();
}

function entryCard(entry) {
  return '<article class="entry-item">'
    + '<strong>' + escapeHtml(entry.emotion.label) + ' · 压力 ' + entry.stress + '</strong>'
    + '<p>' + escapeHtml(entry.text) + '</p>'
    + '<div class="entry-meta"><span class="pill">' + formatDate(entry.createdAt) + '</span>'
    + entry.keywords.map((keyword) => '<span class="pill">' + escapeHtml(keyword) + '</span>').join('')
    + '</div></article>';
}

function renderInsight() {
  const entry = latestEntry();
  $('#insightEmpty').hidden = Boolean(entry);
  $('#insightResult').hidden = !entry;
  $('#analysisMode').textContent = entry ? analysisModeLabel(entry.analysisSource) : 'Demo AI';

  if (!entry) return;

  $('#resultEmotion').textContent = entry.emotion.label + ' · ' + entry.emotion.tone;
  $('#resultStress').textContent = String(entry.stress);
  $('#stressRing').style.setProperty('--stress-deg', Math.round(entry.stress * 3.6) + 'deg');
  $('#resultFeedback').textContent = entry.feedback;
  $('#resultSuggestion').textContent = entry.suggestion;
  $('#keywordWrap').innerHTML = entry.keywords.map((keyword) => '<span class="pill">' + escapeHtml(keyword) + '</span>').join('');
}

function analysisModeLabel(source) {
  if (source === 'deepseek') return 'DeepSeek AI';
  if (source === 'local') return '本地规则';
  return 'Demo AI';
}

function renderRecommendations() {
  const entry = latestEntry();
  const profile = musicProfile();
  const readProfile = readingProfile();
  renderMusicProfile(profile, readProfile);
  renderFavorites();

  if (!entry) {
    $('#playlistList').innerHTML = '<article class="song-item"><div><strong>等待情绪分析</strong><p>完成记录后会推荐适合当前状态的歌单。</p></div></article>';
    $('#playlistGenreCount').textContent = '多类型';
    $('#bookTitle').textContent = '等待分析';
    $('#bookMeta').textContent = '';
    $('#bookReason').textContent = '完成一次记录后，系统会推荐一本适合当下状态的书。';
    $('#bookQuote').textContent = '完成一次记录后，这里会出现适合当下情绪的一段书籍摘句或灵感摘句。';
    $('#comfortText').textContent = '当你完成一次记录后，这里会生成一段适合当前情绪的原创安慰文字。';
    $('#favoriteBookButton').disabled = true;
    return;
  }

  const genres = new Set(entry.playlist.map((song) => song.genre));
  $('#playlistGenreCount').textContent = genres.size + ' 种风格';
  $('#playlistList').innerHTML = entry.playlist.map(songCard).join('');

  $('#bookTitle').textContent = entry.book.title;
  $('#bookMeta').textContent = entry.book.author + ' · ' + entry.book.theme;
  $('#bookReason').textContent = entry.book.reason;
  $('#bookQuote').innerHTML = '<span>' + escapeHtml(entry.book.quote.label) + '</span>' + escapeHtml(entry.book.quote.text);
  $('#comfortText').textContent = entry.comfortText;
  $('#favoriteBookButton').disabled = false;
  $('#favoriteBookButton').textContent = isBookFavorite(entry.book.id) ? '已收藏这封信' : '收藏这封信';
}

function songCard(song) {
  const query = encodeURIComponent(song.title + ' ' + song.artist);
  const saved = isSongFavorite(song.id);
  return '<article class="song-item">'
    + '<div class="song-main">' + genreArt(song.genre)
    + '<div><strong>' + escapeHtml(song.title) + '</strong>'
    + '<p>' + escapeHtml(song.artist) + ' · ' + escapeHtml(song.reason) + '</p>'
    + '<div class="song-meta"><span class="pill">' + escapeHtml(song.genre) + '</span><span class="pill">' + escapeHtml(song.mood) + '</span><span class="pill">能量 ' + song.energy + '</span></div></div></div>'
    + '<div class="song-actions"><button class="favorite-button' + (saved ? ' saved' : '') + '" type="button" data-song-id="' + escapeHtml(song.id) + '">' + (saved ? '已收藏' : '收藏') + '</button>'
    + '<a class="song-search" href="https://music.163.com/#/search/m/?s=' + query + '" target="_blank" rel="noreferrer">搜索</a></div>'
    + '</article>';
}

function genreArt(genre) {
  const key = genreKey(genre);
  return '<div class="song-cover genre-art genre-' + key + '" aria-label="' + escapeHtml(genre) + '"><i></i><b></b><span></span></div>';
}

function genreKey(genre) {
  if (genre.includes('爵士')) return 'jazz';
  if (genre.includes('古典')) return 'classic';
  if (genre.includes('流行')) return 'pop';
  if (genre.includes('民谣')) return 'folk';
  if (genre.includes('电子')) return 'electronic';
  if (genre.includes('氛围')) return 'ambient';
  return 'soft';
}

function renderMusicProfile(profile, readProfile) {
  const emptyTitle = '等待收藏形成偏好';
  const profileTitle = profile.favoriteCount ? profile.topGenre + ' · ' + profile.topMood : emptyTitle;
  const html = '<span>心理偏好画像</span>'
    + '<strong>' + escapeHtml(profileTitle) + '</strong>'
    + '<p>' + escapeHtml(profile.narrative) + '</p>'
    + '<p>' + escapeHtml(readProfile.narrative) + '</p>';
  $('#musicProfileCard').innerHTML = html;
  const collectionCard = $('#collectionProfileCard');
  if (collectionCard) collectionCard.innerHTML = html;
}

function renderFavorites() {
  $('#favoriteSongs').innerHTML = state.musicFavorites.length
    ? state.musicFavorites.map((song) => {
      const query = encodeURIComponent((song.title || '') + ' ' + (song.artist || ''));
      return '<article class="favorite-item favorite-song">'
        + genreArt(song.genre || '音乐')
        + '<div><strong>' + escapeHtml(song.title) + '</strong><p>' + escapeHtml(song.artist || '') + ' · ' + escapeHtml(song.genre || '') + ' · ' + escapeHtml(song.mood || '') + '</p></div>'
        + '<a class="favorite-search" href="https://music.163.com/#/search/m/?s=' + query + '" target="_blank" rel="noreferrer">搜索</a>'
        + '</article>';
    }).join('')
    : '<article class="favorite-item"><strong>暂无收藏歌曲</strong><p>在情绪歌单里点“收藏”，这里会形成你的私人歌单。</p></article>';

  $('#favoriteBooks').innerHTML = state.bookFavorites.length
    ? state.bookFavorites.map((book) => {
      const query = encodeURIComponent((book.title || '') + ' ' + (book.author || ''));
      return '<article class="favorite-item letter-mini">'
        + '<div><strong>' + escapeHtml(book.title) + '</strong><p>' + escapeHtml(book.quote?.text || '') + '</p></div>'
        + '<a class="favorite-search book-search" href="https://www.douban.com/search?q=' + query + '" target="_blank" rel="noreferrer">搜索</a>'
        + '</article>';
    }).join('')
    : '<article class="favorite-item"><strong>暂无收藏书摘</strong><p>收藏喜欢的书信后，这里会保存你的文字安慰偏好。</p></article>';
}

function renderTrends() {
  const summary = getWeeklySummary(state.entries.slice(0, 7));
  $('#weeklyEmotion').textContent = summary.total ? '主要情绪：' + summary.dominantEmotion.label : '暂无记录';
  $('#weeklyNarrative').textContent = summary.narrative;
  $('#weeklyKeywords').innerHTML = summary.topKeywords.length
    ? summary.topKeywords.map((keyword) => '<span class="pill">' + escapeHtml(keyword) + '</span>').join('')
    : '<span class="pill">等待记录</span>';

  const chartEntries = [...state.entries].slice(0, 7).reverse();
  $('#barChart').innerHTML = chartEntries.length
    ? chartEntries.map((entry, index) => '<div class="bar" title="压力 ' + entry.stress + '" style="height:' + Math.max(12, entry.stress * 1.55) + 'px"><span>' + (index + 1) + '</span></div>').join('')
    : '<p class="hint">暂无趋势数据。载入示例或完成记录后会显示压力柱状图。</p>';
}

function renderSurveyResult() {
  const raw = localStorage.getItem(SURVEY_KEY);
  if (!raw) return;
  const result = JSON.parse(raw);
  $('#surveyResult').innerHTML = '<span>综合评分</span><strong>' + result.overall + '/5</strong><p>' + escapeHtml(result.summary) + '</p>';
}

function setVoiceStatus(message, tone = 'neutral') {
  const status = $('#voiceStatus');
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  $$('.theme-chip').forEach((button) => button.classList.toggle('active', button.dataset.theme === theme));
}

function setupThemes() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'mint');
  $('#themeToggle').addEventListener('click', () => $('#themeDock').classList.toggle('open'));
  $$('.theme-chip').forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(button.dataset.theme);
      $('#themeDock').classList.remove('open');
    });
  });
}

function renderAll() {
  renderDashboard();
  renderInsight();
  renderRecommendations();
  renderRegulation();
  renderTrends();
  renderSurveyResult();
}

async function requestRemoteAnalysis(text) {
  if (!['http:', 'https:'].includes(location.protocol)) return null;

  try {
    const response = await fetch(REMOTE_ANALYSIS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, preferenceProfile: musicProfile() }),
    });
    if (!response.ok) return null;

    const result = await response.json();
    if (!result?.entry?.emotion || !Array.isArray(result.entry.keywords)) return null;
    return {
      ...result,
      entry: {
        ...result.entry,
        analysisSource: result.source || result.entry.analysisSource || 'deepseek',
      },
    };
  } catch {
    return null;
  }
}

async function requestRemoteMonthlyReport() {
  if (!['http:', 'https:'].includes(location.protocol)) return null;

  try {
    const response = await fetch(REMOTE_MONTHLY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: state.entries }),
    });
    if (!response.ok) return null;

    const result = await response.json();
    if (!result || !result.report || !result.report.riskLevel) return null;
    return result;
  } catch {
    return null;
  }
}

function setMonthlyGenerating(isGenerating) {
  const button = document.querySelector('#generateMonthlyReport');
  button.disabled = isGenerating;
  button.textContent = isGenerating ? '生成中...' : '生成 30 天专业分析';
}

async function generateMonthlyReport() {
  setMonthlyGenerating(true);
  try {
    const remote = state.entries.length ? await requestRemoteMonthlyReport() : null;
    state.monthlyReport = remote || { source: 'local', report: buildMonthlyMentalReport(state.entries) };
    saveMonthlyReport();
    renderAll();
    if (state.monthlyReport.report.screeningRecommended) switchView('dashboard');
  } finally {
    setMonthlyGenerating(false);
  }
}

function setAnalyzing(isAnalyzing) {
  const button = $("#analyzeButton");
  button.disabled = isAnalyzing;
  button.textContent = isAnalyzing ? '生成中...' : '生成情绪分析';
}

async function analyzeCurrentText() {
  const text = $("#journalText").value.trim();
  if (!text) {
    $("#journalText").focus();
    setVoiceStatus('先输入或说出一段今天的状态', 'warn');
    return;
  }

  setAnalyzing(true);
  try {
    const remote = await requestRemoteAnalysis(text);
    const entry = remote?.entry || { ...analyzeEntry(text, musicProfile()), analysisSource: 'local' };
    state.currentEntry = entry;
    state.entries = [entry, ...state.entries].slice(0, 21);
    rememberRecommendedSongs(entry);
    saveEntries();
    invalidateMonthlyReport();
    renderAll();
    switchView('insight');
  } finally {
    setAnalyzing(false);
  }
}

function setupPrompts() {
  $('#promptRow').innerHTML = prompts.map((prompt) => '<button class="prompt-chip" type="button">' + escapeHtml(prompt) + '</button>').join('');
  $$('#promptRow .prompt-chip').forEach((button) => {
    button.addEventListener('click', () => {
      $('#journalText').value = button.textContent;
    });
  });
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setVoiceStatus('当前浏览器不支持语音识别，可使用文字输入', 'info');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = true;
  recognition.continuous = false;
  state.recognition = recognition;

  recognition.addEventListener('start', () => setListening(true, '正在倾听，说完后会自动填入文本。'));
  recognition.addEventListener('end', () => setListening(false, '语音输入已结束，可以修改文本后生成分析。'));
  recognition.addEventListener('error', () => setListening(false, '语音识别暂时不可用，可以使用文字输入继续。'));
  recognition.addEventListener('result', (event) => {
    const transcript = [...event.results].map((result) => result[0].transcript).join('');
    $('#journalText').value = transcript;
  });
}

function setListening(isListening, message) {
  state.listening = isListening;
  $('#voiceButton').classList.toggle('listening', isListening);
  $('.record-panel').classList.toggle('is-listening', isListening);
  setVoiceStatus(message, isListening ? 'live' : 'ready');
}

function seedDemoEntries() {
  const now = Date.now();
  state.recentSongIds = [];
  state.entries = demoEntries.map((text, index) => {
    const entry = analyzeEntry(text, musicProfile());
    entry.createdAt = new Date(now - index * 24 * 60 * 60 * 1000).toISOString();
    entry.id = 'demo-' + index;
    return entry;
  });
  state.currentEntry = state.entries[0];
  state.entries.forEach(rememberRecommendedSongs);
  saveEntries();
  invalidateMonthlyReport();
  renderAll();
}

function resetDemo() {
  state.entries = [];
  state.musicFavorites = [];
  state.bookFavorites = [];
  state.recentSongIds = [];
  state.monthlyReport = null;
  state.screeningResults = {};
  state.currentEntry = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SURVEY_KEY);
  localStorage.removeItem(MUSIC_FAVORITES_KEY);
  localStorage.removeItem(BOOK_FAVORITES_KEY);
  localStorage.removeItem(RECENT_SONGS_KEY);
  localStorage.removeItem(MONTHLY_REPORT_KEY);
  localStorage.removeItem(SCREENING_RESULTS_KEY);
  $('#journalText').value = '';
  $('#surveyResult').innerHTML = '<span>综合评分</span><strong>--</strong><p>提交问卷后生成用户体验测量摘要。</p>';
  renderAll();
  switchView('dashboard');
}

function setupSurvey() {
  $('#surveyForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const answers = Object.fromEntries(form.entries());
    const result = scoreUxSurvey(answers);
    localStorage.setItem(SURVEY_KEY, JSON.stringify(result));
    renderSurveyResult();
  });
}

function isSongFavorite(songId) {
  return state.musicFavorites.some((song) => song.id === songId);
}

function isBookFavorite(bookId) {
  return state.bookFavorites.some((book) => book.id === bookId);
}

function toggleSongFavorite(songId) {
  const entry = latestEntry();
  if (!entry) return;
  const song = entry.playlist.find((item) => item.id === songId);
  if (!song) return;

  if (isSongFavorite(songId)) {
    state.musicFavorites = state.musicFavorites.filter((item) => item.id !== songId);
  } else {
    state.musicFavorites = [{ ...song, savedAt: new Date().toISOString() }, ...state.musicFavorites].slice(0, 40);
  }
  saveMusicFavorites();
  state.currentEntry = analyzeEntry(entry.text, musicProfile());
  renderAll();
}

function toggleBookFavorite() {
  const entry = latestEntry();
  if (!entry) return;
  const book = entry.book;
  if (isBookFavorite(book.id)) {
    state.bookFavorites = state.bookFavorites.filter((item) => item.id !== book.id);
  } else {
    state.bookFavorites = [{ ...book, savedAt: new Date().toISOString() }, ...state.bookFavorites].slice(0, 30);
  }
  saveBookFavorites();
  renderAll();
}

function handleScreeningOption(event) {
  const button = event.target.closest('[data-screening-value]');
  if (!button) return;
  const question = button.closest('.screen-question');
  const input = question.querySelector('input');
  input.value = button.dataset.screeningValue;
  question.querySelectorAll('.screen-option').forEach((item) => item.classList.toggle('active', item === button));
}

function handleScreeningSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const type = form.dataset.screeningType;
  const source = SCREENING_FORMS[type];
  const data = new FormData(form);
  const answers = source.questions.map((question, index) => Number(data.get('q' + index)) || 0);
  state.screeningResults = { ...state.screeningResults, [type]: scoreScreening(type, answers) };
  saveScreeningResults();
  renderRegulation();
  renderMonthlyReport();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupNavigation() {
  $$('.tab').forEach((tab) => tab.addEventListener('click', () => switchView(tab.dataset.view)));
  $$('[data-view-target]').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.viewTarget));
  });
}

function setupEvents() {
  $('#analyzeButton').addEventListener('click', analyzeCurrentText);
  $('#seedDemo').addEventListener('click', seedDemoEntries);
  $('#resetDemo').addEventListener('click', resetDemo);
  document.querySelector('#generateMonthlyReport').addEventListener('click', generateMonthlyReport);
  document.querySelector('#screeningCallout').addEventListener('click', (event) => {
    if (event.target.closest('[data-open-screening]')) switchView('regulation');
  });
  document.querySelector('#screeningPanel').addEventListener('click', handleScreeningOption);
  document.querySelector('#screeningPanel').addEventListener('submit', handleScreeningSubmit);
  $('#playlistList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-song-id]');
    if (button) toggleSongFavorite(button.dataset.songId);
  });
  $('#favoriteBookButton').addEventListener('click', toggleBookFavorite);
  $('#clearSongFavorites').addEventListener('click', () => {
    state.musicFavorites = [];
    saveMusicFavorites();
    renderAll();
  });
  $('#clearBookFavorites').addEventListener('click', () => {
    state.bookFavorites = [];
    saveBookFavorites();
    renderAll();
  });
  $('#voiceButton').addEventListener('click', () => {
    if (!state.recognition) {
      setVoiceStatus('当前浏览器不支持语音识别，请使用文字输入', 'info');
      return;
    }
    if (state.listening) {
      state.recognition.stop();
    } else {
      state.recognition.start();
    }
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  }
}

function init() {
  state.currentEntry = state.entries[0] || null;
  setupNavigation();
  setupThemes();
  setupPrompts();
  setupSpeechRecognition();
  setupSurvey();
  setupEvents();
  renderAll();
  registerServiceWorker();
}

init();
