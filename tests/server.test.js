import test from 'node:test';
import assert from 'node:assert/strict';

import { createAnalyzer, createApiHandler } from '../server/deepseek.js';
import { analyzeEntry as analyzeEntryForServer } from '../src/analysis.js';

test('createAnalyzer falls back to local analysis when no API key is configured', async () => {
  const analyzer = createAnalyzer({ apiKey: '' });

  const result = await analyzer.analyze({ text: '最近作业很多，我很焦虑，睡不好。' });

  assert.equal(result.source, 'local');
  assert.equal(result.entry.emotion.id, 'anxious');
  assert.ok(result.entry.stress >= 70);
  assert.ok(result.entry.playlist.length >= 6);
});

test('createAnalyzer calls DeepSeek-compatible endpoint and merges safe AI fields', async () => {
  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotionId: 'sad',
              emotionLabel: '低落',
              stress: 61,
              keywords: ['学习任务', '睡眠'],
              feedback: '你现在像是同时背着任务和疲惫感，可以先降低对自己的要求。',
              suggestion: '先写下最小任务，再给自己十分钟休息。',
              comfortText: '你不是做得不够好，只是已经撑了一段时间。',
            }),
          },
        },
      ],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const analyzer = createAnalyzer({ apiKey: 'test-key', fetchImpl: fakeFetch, model: 'deepseek-chat' });

  const result = await analyzer.analyze({ text: '作业很多，有点难过，也睡不好。' });

  assert.equal(result.source, 'deepseek');
  assert.equal(result.entry.emotion.id, 'sad');
  assert.equal(result.entry.stress, 61);
  assert.equal(result.entry.feedback, '你现在像是同时背着任务和疲惫感，可以先降低对自己的要求。');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.deepseek.com/chat/completions');
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-key');
  assert.equal(JSON.parse(requests[0].options.body).response_format.type, 'json_object');
});

test('createAnalyzer falls back to local monthly report when no API key is configured', async () => {
  const analyzer = createAnalyzer({ apiKey: '' });
  const entry = analyzeEntryForServer('最近作业很多，我很焦虑，睡不好。');

  const result = await analyzer.analyzeMonthly({ entries: [entry] });

  assert.equal(result.source, 'local');
  assert.equal(result.report.dominantEmotion.id, 'anxious');
  assert.ok(result.report.professionalHelpMessage.includes('筛查'));
});

test('createAnalyzer calls DeepSeek-compatible endpoint for monthly report and keeps safety boundaries', async () => {
  let body;
  const fakeFetch = async (url, options) => {
    body = JSON.parse(options.body);
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            riskLevel: '建议专业评估',
            emotionPattern: '近一个月焦虑和睡眠压力反复出现。',
            pressureSources: ['学习任务'],
            maintainingFactors: ['睡眠不足放大担心'],
            protectiveFactors: ['愿意记录情绪'],
            recommendations: ['把任务拆成 20 分钟以内的小步'],
            screeningRecommended: true,
            screeningType: 'anxiety',
            professionalHelpMessage: '这不是诊断。筛查结果若持续偏高，建议预约学校心理中心或专业人员评估。',
          }),
        },
      }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const analyzer = createAnalyzer({ apiKey: 'test-key', fetchImpl: fakeFetch, model: 'deepseek-chat' });

  const result = await analyzer.analyzeMonthly({ entries: [analyzeEntryForServer('作业很多，我焦虑到睡不好。')] });

  assert.equal(result.source, 'deepseek');
  assert.equal(result.report.riskLevel, '建议专业评估');
  assert.equal(result.report.screeningType, 'anxiety');
  assert.match(body.messages[0].content, /不做诊断/);
  assert.match(body.messages[1].content, /近 30 天/);
  assert.match(body.messages[1].content, /screeningRecommended/);
  assert.ok(body.max_tokens >= 1600);
});

test('createApiHandler returns JSON for POST /api/monthly-report', async () => {
  const handler = createApiHandler({
    analyzer: {
      analyzeMonthly: async () => ({ source: 'local', report: { riskLevel: '低', total: 1 } }),
    },
  });
  const response = await handler(new Request('http://localhost/api/monthly-report', {
    method: 'POST',
    body: JSON.stringify({ entries: [{ text: '今天还算平静。' }] }),
    headers: { 'content-type': 'application/json' },
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { source: 'local', report: { riskLevel: '低', total: 1 } });
});

test('createApiHandler returns JSON for POST /api/analyze', async () => {
  const handler = createApiHandler({ analyzer: { analyze: async () => ({ source: 'local', entry: { emotion: { id: 'calm' }, stress: 35 } }) } });
  const response = await handler(new Request('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ text: '今天还算平静。' }),
    headers: { 'content-type': 'application/json' },
  }));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.deepEqual(await response.json(), { source: 'local', entry: { emotion: { id: 'calm' }, stress: 35 } });
});


test("createAnalyzer injects expert preset, psychology frame, and triggered knowledge into prompt", async () => {
  let body;
  const fakeFetch = async (url, options) => {
    body = JSON.parse(options.body);
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ emotionId: "anxious", stress: 76 }) } }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const analyzer = createAnalyzer({ apiKey: "test-key", fetchImpl: fakeFetch });

  await analyzer.analyze({ text: "作业很多，我很焦虑，晚上睡不好，担心明天展示。" });

  const systemPrompt = body.messages[0].content;
  const userPrompt = body.messages[1].content;
  assert.match(systemPrompt, /心理动力学/);
  assert.match(systemPrompt, /认知行为/);
  assert.match(systemPrompt, /不做诊断/);
  assert.match(userPrompt, /任务压力/);
  assert.match(userPrompt, /睡眠-压力循环/);
  assert.match(userPrompt, /feedback.*120-180/);
  assert.match(userPrompt, /suggestion.*140-240/);
  assert.match(userPrompt, /comfortText.*100-180/);
  assert.ok(body.max_tokens >= 1200);
});

test("createAnalyzer extracts JSON from fenced or prefaced model content", async () => {
  const fakeFetch = async () => new Response(JSON.stringify({
    choices: [
      {
        message: {
          content: "下面是结果：\n```json\n{\"emotionId\":\"tired\",\"stress\":64,\"keywords\":[\"睡眠\"],\"feedback\":\"你现在的疲惫并不只是懒散，而像是持续紧绷之后身体发出的提醒。\",\"suggestion\":\"今晚先把任务缩到最小版本，再给身体一段不被打扰的恢复时间。\",\"comfortText\":\"你不需要靠一直硬撑来证明自己认真，能停下来照顾自己也是一种负责。\"}\n```",
        },
      },
    ],
  }), { status: 200, headers: { "content-type": "application/json" } });
  const analyzer = createAnalyzer({ apiKey: "test-key", fetchImpl: fakeFetch });

  const result = await analyzer.analyze({ text: "我很累，昨晚又睡不好。" });

  assert.equal(result.source, "deepseek");
  assert.equal(result.entry.emotion.id, "tired");
  assert.equal(result.entry.stress, 64);
  assert.equal(result.entry.keywords[0], "睡眠");
});
