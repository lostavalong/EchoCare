import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeEntry,
  buildMusicPreferenceProfile,
  buildReadingPreferenceProfile,
  buildMonthlyMentalReport,
  getWeeklySummary,
  scoreScreening,
  selectRegulationKnowledge,
  scoreUxSurvey,
} from '../src/analysis.js';

test('analyzeEntry detects anxiety, high stress, keywords, and broad recommendations', () => {
  const result = analyzeEntry('最近作业很多，我有点焦虑，晚上睡不好，担心明天的展示。');

  assert.equal(result.emotion.id, 'anxious');
  assert.equal(result.emotion.label, '焦虑');
  assert.ok(result.stress >= 70, `expected high stress, got ${result.stress}`);
  assert.ok(result.keywords.includes('学习任务'));
  assert.ok(result.keywords.includes('睡眠'));
  assert.ok(result.playlist.length >= 6);
  assert.ok(result.playlist.every((song) => song.id && song.title && song.artist && song.reason && song.genre));
  assert.ok(new Set(result.playlist.map((song) => song.genre)).has('古典'));
  assert.ok(new Set(result.playlist.map((song) => song.genre)).has('爵士'));
  assert.ok(new Set(result.playlist.map((song) => song.genre)).has('流行'));
  assert.equal(result.book.title, '被讨厌的勇气');
  assert.ok(result.book.quote.text.length > 0);
  assert.ok(result.comfortText.includes('先把自己放回当下'));
});

test('analyzeEntry handles positive entries with lower stress and bright recommendations', () => {
  const result = analyzeEntry('今天和朋友一起散步聊天，很开心，也完成了计划，感觉轻松。');

  assert.equal(result.emotion.id, 'happy');
  assert.ok(result.stress <= 35, `expected low stress, got ${result.stress}`);
  assert.ok(result.keywords.includes('人际关系'));
  assert.ok(result.feedback.includes('积极'));
  assert.equal(result.playlist[0].mood, '明亮');
});

test('music favorites build a profile and influence recommendation ranking', () => {
  const favorites = [
    { id: 'anxious-kind-of-blue', title: 'Blue in Green', genre: '爵士', mood: '松弛', emotionId: 'anxious' },
    { id: 'sad-autumn-leaves', title: 'Autumn Leaves', genre: '爵士', mood: '陪伴', emotionId: 'sad' },
    { id: 'calm-clair-de-lune', title: 'Clair de Lune', genre: '古典', mood: '月光感', emotionId: 'calm' },
  ];

  const profile = buildMusicPreferenceProfile(favorites);
  const result = analyzeEntry('我很焦虑，担心明天展示，压力很大。', profile);

  assert.equal(profile.topGenre, '爵士');
  assert.equal(profile.favoriteCount, 3);
  assert.ok(profile.narrative.includes('爵士'));
  assert.equal(result.playlist[0].genre, '爵士');
});



test('music profile uses weighted aggregate instead of only the latest favorite', () => {
  const favorites = [
    { id: 'a', title: 'Blue in Green', genre: '爵士', mood: '松弛', emotionId: 'anxious', savedAt: '2026-05-18T00:00:00.000Z' },
    { id: 'b', title: 'Autumn Leaves', genre: '爵士', mood: '陪伴', emotionId: 'sad', savedAt: '2026-05-19T00:00:00.000Z' },
    { id: 'c', title: 'Yellow', genre: '流行', mood: '陪伴', emotionId: 'anxious', savedAt: '2026-05-20T00:00:00.000Z' },
  ];

  const profile = buildMusicPreferenceProfile(favorites);

  assert.equal(profile.topGenre, '爵士');
  assert.equal(profile.favoriteCount, 3);
  assert.ok(profile.confidence > 0.6);
  assert.ok(profile.diversity.length >= 2);
  assert.ok(profile.narrative.includes('综合色彩'));
});

test('reading favorites build a reflective profile', () => {
  const profile = buildReadingPreferenceProfile([
    { title: '瓦尔登湖', emotionId: 'calm', theme: '独处与平静' },
    { title: '被讨厌的勇气', emotionId: 'anxious', theme: '边界与勇气' },
  ]);

  assert.equal(profile.favoriteCount, 2);
  assert.equal(profile.topTheme, '独处与平静');
  assert.ok(profile.narrative.includes('文字安慰'));
});

test('getWeeklySummary summarizes dominant emotion, average stress, and top keywords', () => {
  const entries = [
    analyzeEntry('作业很多很焦虑，晚上睡不好。'),
    analyzeEntry('考试临近，压力很大，有点担心。'),
    analyzeEntry('今天散步以后平静了一些。'),
  ];

  const summary = getWeeklySummary(entries);

  assert.equal(summary.total, 3);
  assert.equal(summary.dominantEmotion.id, 'anxious');
  assert.ok(summary.averageStress >= 55);
  assert.ok(summary.topKeywords.includes('学习任务'));
  assert.ok(summary.narrative.includes('本周'));
});

test('buildMonthlyMentalReport flags sustained anxiety as screening need without diagnosing', () => {
  const now = new Date('2026-05-22T12:00:00.000Z');
  const entries = [
    analyzeEntry('最近作业和展示很多，我很焦虑，晚上睡不好，担心自己来不及。'),
    analyzeEntry('考试临近，压力很大，脑子里一直在想失败怎么办。'),
    analyzeEntry('又熬夜了，心里很慌，明天还有论文和展示。'),
    analyzeEntry('今天散步以后平静了一些。'),
  ].map((entry, index) => ({
    ...entry,
    createdAt: new Date(now.getTime() - index * 5 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const report = buildMonthlyMentalReport(entries, { now });

  assert.equal(report.total, 4);
  assert.equal(report.riskLevel, '建议专业评估');
  assert.equal(report.screeningRecommended, true);
  assert.equal(report.screeningType, 'anxiety');
  assert.ok(report.emotionPattern.includes('焦虑'));
  assert.ok(report.maintainingFactors.some((item) => item.includes('睡眠') || item.includes('任务')));
  assert.ok(report.professionalHelpMessage.includes('筛查'));
  assert.doesNotMatch(report.professionalHelpMessage, /确诊|诊断为/);
});

test('buildMonthlyMentalReport treats crisis language as urgent support need', () => {
  const entry = analyzeEntry('我真的撑不住了，有时会想伤害自己，不想活了。');
  const report = buildMonthlyMentalReport([entry], { now: new Date(entry.createdAt) });

  assert.equal(report.riskLevel, '需要尽快求助');
  assert.equal(report.screeningRecommended, true);
  assert.equal(report.screeningType, 'crisis');
  assert.ok(report.professionalHelpMessage.includes('立即'));
});

test('selectRegulationKnowledge returns practical psychology cards matched to risk and emotion', () => {
  const report = buildMonthlyMentalReport([
    analyzeEntry('任务太多了，我焦虑到睡不好，担心自己失败。'),
    analyzeEntry('ddl 快到了，我一直在拖延又很慌。'),
  ]);

  const cards = selectRegulationKnowledge({ emotionId: 'anxious', keywords: ['学习任务', '睡眠'], report });

  assert.ok(cards.length >= 3);
  assert.ok(cards.some((card) => card.id === 'anxiety-loop'));
  assert.ok(cards.some((card) => card.id === 'task-splitting'));
  assert.ok(cards.every((card) => card.title && card.principle && card.practice.length === 3));
});

test('scoreScreening scores anxiety and depression screeners with risk guidance', () => {
  const anxiety = scoreScreening('anxiety', [3, 2, 2, 2, 2, 2, 2]);
  const depression = scoreScreening('depression', [2, 2, 2, 2, 2, 1, 1, 1, 0]);
  const crisis = scoreScreening('depression', [1, 1, 1, 1, 1, 1, 1, 1, 2]);

  assert.equal(anxiety.total, 15);
  assert.equal(anxiety.level, '重度焦虑风险');
  assert.ok(anxiety.recommendation.includes('专业评估'));
  assert.equal(depression.total, 13);
  assert.equal(depression.level, '中度低落风险');
  assert.equal(crisis.riskLevel, '需要尽快求助');
  assert.ok(crisis.recommendation.includes('立即'));
});

test('scoreUxSurvey returns section averages and an overall score', () => {
  const result = scoreUxSurvey({
    easyToUse: 5,
    clearFeedback: 4,
    voiceNatural: 4,
    recognitionAcceptable: 3,
    privacyTrust: 4,
    emotionalComfort: 5,
  });

  assert.equal(result.usability, 4.5);
  assert.equal(result.voiceSatisfaction, 3.5);
  assert.equal(result.privacyTrust, 4);
  assert.equal(result.emotionalComfort, 5);
  assert.equal(result.overall, 4.17);
  assert.ok(result.summary.includes('整体体验'));
});
