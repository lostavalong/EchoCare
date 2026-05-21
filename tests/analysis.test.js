import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeEntry,
  buildMusicPreferenceProfile,
  buildReadingPreferenceProfile,
  getWeeklySummary,
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
