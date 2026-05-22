import { analyzeEntry, buildMonthlyMentalReport } from "../src/analysis.js";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";
const KNOWN_EMOTIONS = {
  anxious: { label: "焦虑", tone: "需要放慢", color: "#7c6be8" },
  sad: { label: "低落", tone: "需要陪伴", color: "#5d8ac7" },
  tired: { label: "疲惫", tone: "需要休息", color: "#6e8f99" },
  happy: { label: "开心", tone: "值得保存", color: "#ef9f4f" },
  calm: { label: "平静", tone: "稳定温和", color: "#4f9f88" },
};

const SYSTEM_PRESET = [
  "你是 EchoCare 的情绪分析助手，采用类似角色卡预设的稳定人格与知识注入方式工作。",
  "你的专业视角综合心理动力学、认知行为、情绪调节、压力管理、人本主义倾听和大学生学习压力场景。",
  "你需要像一位温和、克制、专业的心理学助教：先共情，再解释可能机制，最后给出可执行建议。",
  "安全边界：不做诊断，不声称替代心理咨询或医疗服务，不使用吓人的病名，不给药物建议，不评价用户脆弱。",
  "当文本出现自伤、伤人、极端绝望等风险时，应温和建议立即联系可信任的人、学校心理中心或当地紧急服务。",
  "你只返回 json 对象，不输出 Markdown，不输出额外解释。",
].join("\n");

const KNOWLEDGE_ENTRIES = [
  {
    label: "任务压力",
    pattern: /(作业|课程|论文|考试|展示|ddl|deadline|复习|来不及|任务|项目)/i,
    text: "任务压力常见机制：压力不只来自任务数量，也来自对失败、评价和失控的预期。分析时区分现实任务、想象后果和自我要求。建议要帮助用户把任务拆成可完成的最小行动。",
  },
  {
    label: "睡眠-压力循环",
    pattern: /(睡不好|失眠|熬夜|困|早醒|睡眠|睡不着|梦)/i,
    text: "睡眠-压力循环：睡不好会放大焦虑和负面解释，焦虑又会让入睡更难。建议优先降低今晚唤醒水平，而不是继续用意志力硬撑。",
  },
  {
    label: "人际与评价敏感",
    pattern: /(朋友|同学|老师|室友|家人|关系|评价|被讨厌|尴尬|冲突)/i,
    text: "人际压力常包含被接纳、被评价和边界感议题。分析时避免替用户断定他人想法，可引导用户辨认事实、猜测和需要。",
  },
  {
    label: "疲惫与耗竭",
    pattern: /(累|疲惫|没精神|头疼|身体|不舒服|撑不住|透支)/i,
    text: "疲惫并不等于懒散，可能是长期紧绷后的恢复需求。建议应降低任务强度，给出休息和恢复的正当性。",
  },
  {
    label: "积极经验巩固",
    pattern: /(开心|顺利|完成|轻松|喜欢|满意|散步|快乐|朋友)/i,
    text: "积极情绪也值得分析。帮助用户把支持性关系、完成感和自我效能保存下来，形成可回看的心理资源。",
  },
  {
    label: "危机安全提示",
    pattern: /(不想活|自杀|自残|伤害自己|伤害别人|活不下去|结束生命)/i,
    text: "危机安全：不要深入解释原因，先承认痛苦，再建议立刻联系身边可信任的人、学校心理中心或当地紧急服务。",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function safeText(value, maxLength = 900) {
  return String(value || "").trim().slice(0, maxLength);
}

function safeKeywords(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => safeText(item, 18)).filter(Boolean).slice(0, 5);
}

function parseJsonContent(content) {
  const raw = String(content || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const objectMatch = candidate.match(/\{[\s\S]*\}/);
  if (!objectMatch) throw new Error("missing_json_object");
  return JSON.parse(objectMatch[0]);
}

function selectKnowledgeEntries(text) {
  const safe = String(text || "");
  const matched = KNOWLEDGE_ENTRIES.filter((entry) => entry.pattern.test(safe)).slice(0, 3);
  if (matched.length) return matched;
  return [{
    label: "一般情绪觉察",
    text: "一般情绪觉察：先帮助用户命名情绪，再连接压力来源、身体感受、真实需要和一个可执行的小行动。",
  }];
}

function buildPrompt({ text, preferenceProfile = {} }) {
  const profileHint = preferenceProfile.favoriteCount
    ? "用户音乐偏好：" + preferenceProfile.topGenre + "，常保存“" + preferenceProfile.topMood + "”气质。后续建议可顺带照顾这种调节偏好。"
    : "用户还没有形成稳定音乐偏好，不要假设其偏好。";
  const knowledge = selectKnowledgeEntries(text)
    .map((entry) => "- " + entry.label + "：" + entry.text)
    .join("\n");

  return [
    "【任务】请分析这段中文情绪日记，返回 json。",
    "【角色预设】你是 EchoCare 的心理学分析助手，输出应像一位受过训练的倾听者，而不是普通聊天机器人。",
    "【分析框架】",
    "1. 情绪命名：识别主要情绪和压力水平。",
    "2. 心理动力学视角：温和指出可能的内在冲突、评价焦虑、自我要求或被理解的需要，但不能过度解释。",
    "3. 认知行为视角：区分事实、自动想法、灾难化预期和可行动部分。",
    "4. 身体与压力视角：如果涉及睡眠、疲惫、躯体不适，要把身体恢复写进建议。",
    "5. 支持性建议：给出低门槛、具体、今天就能做的小步骤。",
    "【触发知识条目】",
    knowledge,
    "【用户偏好画像】" + profileHint,
    "【输出要求】只输出一个 JSON 对象，必须是合法 json，不要 Markdown。",
    "字段要求：",
    "- emotionId: anxious | sad | tired | happy | calm。",
    "- emotionLabel: 2-6 个汉字。",
    "- stress: 0 到 100 的整数。",
    "- keywords: 2-5 个关键词。",
    "- feedback: 120-180 个中文字符，分成 2-3 句，包含情绪、压力来源、可能需要，不要空泛。",
    "- suggestion: 140-240 个中文字符，给出 3 个编号建议，必须具体到今天能做什么。",
    "- comfortText: 100-180 个中文字符，像一段温柔但不油腻的安慰，承认困难并给用户一点稳定感。",
    "【禁止】不要说教，不要只写一句话，不要使用“加油”“别想太多”这种泛泛表达，不要做医学诊断。",
    "【日记内容】" + safeText(text, 1800),
  ].join("\n");
}

function safeList(value, maxItems = 5, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => safeText(item, maxLength)).filter(Boolean).slice(0, maxItems);
}

function normalizeEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry && typeof entry === 'object')
    .slice(0, 60);
}

function buildMonthlyPrompt({ entries, localReport }) {
  const records = normalizeEntries(entries).slice(0, 30).map((entry, index) => {
    const emotion = entry.emotion?.label || entry.emotion?.id || '未知';
    const keywords = Array.isArray(entry.keywords) ? entry.keywords.join('、') : '无';
    return String(index + 1) + '. ' + (entry.createdAt || 'unknown') + ' | 情绪:' + emotion + ' | 压力:' + (entry.stress ?? '未知') + ' | 主题:' + keywords + ' | 内容:' + safeText(entry.text, 260);
  }).join('\n');

  return [
    '【任务】你是 EchoCare 的月度心理画像分析助手。请基于近 30 天情绪记录输出结构化 json。',
    '【安全边界】不做诊断，不使用“确诊”“患有”等措辞；只能给出筛查提示、风险提示和建议专业评估。',
    '【专业视角】综合心理动力学、认知行为、压力-睡眠循环、情绪调节、人本主义支持和大学生学习压力场景。',
    '【本地初筛参考】' + JSON.stringify(localReport),
    '【近 30 天记录】',
    records || '暂无记录',
    '【输出要求】只输出合法 JSON 对象，不要 Markdown。字段必须包含：',
    '- riskLevel: 低 | 关注 | 建议专业评估 | 需要尽快求助。',
    '- emotionPattern: 160-240 个中文字符，说明近 30 天模式，不做诊断。',
    '- pressureSources: 2-5 个压力来源数组。',
    '- maintainingFactors: 2-5 个维持因素数组，结合心理机制。',
    '- protectiveFactors: 1-4 个保护性因素数组。',
    '- recommendations: 3-5 个具体建议数组，必须可执行。',
    '- screeningRecommended: boolean。',
    '- screeningType: anxiety | depression | both | crisis | none。',
    '- professionalHelpMessage: 80-160 个中文字符，说明这不是诊断，并在风险高时建议学校心理中心、心理咨询师或医生做专业评估。',
    '如果出现自伤、伤人或极端绝望风险，riskLevel 必须是“需要尽快求助”，screeningType 必须是 crisis，并建议立即联系可信任的人、学校心理中心或当地紧急服务。',
  ].join('\n');
}

function mergeMonthlyReport(localReport, ai) {
  const riskLevels = ['低', '关注', '建议专业评估', '需要尽快求助'];
  const screeningTypes = ['anxiety', 'depression', 'both', 'crisis', 'none'];
  const riskLevel = riskLevels.includes(ai?.riskLevel) ? ai.riskLevel : localReport.riskLevel;
  const screeningType = screeningTypes.includes(ai?.screeningType) ? ai.screeningType : localReport.screeningType;

  return {
    ...localReport,
    riskLevel,
    emotionPattern: safeText(ai?.emotionPattern, 360) || localReport.emotionPattern,
    pressureSources: safeList(ai?.pressureSources, 5, 40).length ? safeList(ai?.pressureSources, 5, 40) : localReport.pressureSources,
    maintainingFactors: safeList(ai?.maintainingFactors, 5, 90).length ? safeList(ai?.maintainingFactors, 5, 90) : localReport.maintainingFactors,
    protectiveFactors: safeList(ai?.protectiveFactors, 4, 90).length ? safeList(ai?.protectiveFactors, 4, 90) : localReport.protectiveFactors,
    recommendations: safeList(ai?.recommendations, 5, 100).length ? safeList(ai?.recommendations, 5, 100) : localReport.recommendations,
    screeningRecommended: typeof ai?.screeningRecommended === 'boolean' ? ai.screeningRecommended : localReport.screeningRecommended,
    screeningType,
    professionalHelpMessage: safeText(ai?.professionalHelpMessage, 220) || localReport.professionalHelpMessage,
    source: 'deepseek',
  };
}

function localMonthlyResult(entries, reason) {
  return {
    source: 'local',
    reason,
    report: buildMonthlyMentalReport(entries),
  };
}

function mergeAiFields(baseEntry, ai) {
  const emotionId = KNOWN_EMOTIONS[ai?.emotionId] ? ai.emotionId : baseEntry.emotion.id;
  const emotionMeta = KNOWN_EMOTIONS[emotionId] || baseEntry.emotion;
  const stress = Number.isFinite(Number(ai?.stress)) ? clamp(Math.round(Number(ai.stress)), 0, 100) : baseEntry.stress;
  const keywords = safeKeywords(ai?.keywords);

  return {
    ...baseEntry,
    emotion: {
      id: emotionId,
      label: safeText(ai?.emotionLabel, 12) || emotionMeta.label,
      tone: emotionMeta.tone,
      color: emotionMeta.color,
    },
    stress,
    keywords: keywords.length ? keywords : baseEntry.keywords,
    feedback: safeText(ai?.feedback) || baseEntry.feedback,
    suggestion: safeText(ai?.suggestion) || baseEntry.suggestion,
    comfortText: safeText(ai?.comfortText) || baseEntry.comfortText,
    analysisSource: "deepseek",
  };
}

function localResult(text, preferenceProfile, reason) {
  return {
    source: "local",
    reason,
    entry: {
      ...analyzeEntry(text, preferenceProfile),
      analysisSource: "local",
    },
  };
}

export function createAnalyzer(options = {}) {
  const apiKey = options.apiKey ?? process.env.DEEPSEEK_API_KEY ?? "";
  const model = options.model ?? process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  return {
    async analyze({ text, preferenceProfile = {} } = {}) {
      if (!apiKey || typeof fetchImpl !== "function") {
        return localResult(text, preferenceProfile, "missing_api_key");
      }

      const baseEntry = analyzeEntry(text, preferenceProfile);
      try {
        const response = await fetchImpl(baseUrl + "/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PRESET },
              { role: "user", content: buildPrompt({ text, preferenceProfile }) },
            ],
            response_format: { type: "json_object" },
            thinking: { type: "disabled" },
            temperature: 0.55,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          return localResult(text, preferenceProfile, "deepseek_http_" + response.status);
        }

        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content;
        const ai = parseJsonContent(content);
        return { source: "deepseek", entry: mergeAiFields(baseEntry, ai) };
      } catch (error) {
        return localResult(text, preferenceProfile, "deepseek_error");
      }
    },

    async analyzeMonthly({ entries = [] } = {}) {
      const safeEntries = normalizeEntries(entries);
      if (!apiKey || typeof fetchImpl !== 'function') {
        return localMonthlyResult(safeEntries, 'missing_api_key');
      }

      const localReport = buildMonthlyMentalReport(safeEntries);
      try {
        const response = await fetchImpl(baseUrl + '/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PRESET },
              { role: 'user', content: buildMonthlyPrompt({ entries: safeEntries, localReport }) },
            ],
            response_format: { type: 'json_object' },
            thinking: { type: 'disabled' },
            temperature: 0.45,
            max_tokens: 1800,
          }),
        });

        if (!response.ok) {
          return localMonthlyResult(safeEntries, 'deepseek_http_' + response.status);
        }

        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content;
        const ai = parseJsonContent(content);
        return { source: 'deepseek', report: mergeMonthlyReport(localReport, ai) };
      } catch (error) {
        return localMonthlyResult(safeEntries, 'deepseek_error');
      }
    },
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function createApiHandler({ analyzer = createAnalyzer() } = {}) {
  return async function handleApi(request) {
    const url = new URL(request.url);
    if (!['/api/analyze', '/api/monthly-report'].includes(url.pathname)) return null;

    if (request.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "invalid_json" }, 400);
    }

    if (url.pathname === '/api/monthly-report') {
      const entries = normalizeEntries(body && body.entries);
      const result = await analyzer.analyzeMonthly({ entries });
      return jsonResponse(result);
    }

    const text = safeText(body?.text, 4000);
    if (!text) {
      return jsonResponse({ error: "empty_text" }, 400);
    }

    const result = await analyzer.analyze({
      text,
      preferenceProfile: body?.preferenceProfile || {},
    });
    return jsonResponse(result);
  };
}
