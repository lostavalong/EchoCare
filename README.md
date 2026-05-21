# EchoCare

EchoCare 是一个课程作业用的移动端优先 PWA 原型，主题是“基于语音输入的情绪记录与压力感知助手”。当前主版本已经迁移为“静态前端 + Node 后端代理”结构：前端负责交互和展示，后端负责保护 DeepSeek API Key 并转发情绪分析请求。

## 当前结构

```text
EchoCare/
  index.html              # 前端页面
  styles.css              # UI 和主题样式
  app.js                  # 前端交互，优先请求 /api/analyze
  src/analysis.js         # 本地规则分析与推荐 fallback
  server/deepseek.js      # DeepSeek 代理与本地回退逻辑
  server/index.js         # Node 静态服务 + API 服务
  tests/                  # 本地规则和后端代理测试
  releases/v0.1-demo/     # 迁移前纯前端 Demo 快照
  .env.example            # 环境变量模板
```

## 运行方式

安装依赖这一步目前不需要，因为后端只使用 Node 内置模块。建议使用 Node 18 或更高版本。

```bash
npm test
npm run serve
```

然后在浏览器打开：

```text
http://127.0.0.1:4173
```

如果 4173 端口已经被之前的 Python 静态服务占用，可以换端口：

```bash
PORT=4174 npm run serve
```

如果只想运行迁移前的纯前端 Demo，可以进入 `releases/v0.1-demo/`，或在主目录使用：

```bash
npm run serve:demo
```

## DeepSeek 配置

复制环境变量模板：

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
HOST=127.0.0.1
PORT=4173
```

不要把真实 API Key 写进 `app.js`、`index.html` 或任何前端文件。前端只请求自己的 `/api/analyze`，后端再携带 Key 调用 DeepSeek。

## 分析流程

1. 用户在记录页输入或语音转文字。
2. 前端调用 `POST /api/analyze`，请求体包含文本和当前收藏形成的音乐偏好画像。
3. 后端如果检测到 `DEEPSEEK_API_KEY`，会调用 DeepSeek Chat Completions 兼容接口，并要求返回 JSON。
4. 后端会校验并合并 AI 结果，保留本地歌单、书籍、收藏画像等稳定能力。
5. 如果没有 Key、网络失败、接口异常或 JSON 不合法，系统自动使用 `src/analysis.js` 的本地规则分析。

`/api/analyze` 返回示例：

```json
{
  "source": "deepseek",
  "entry": {
    "emotion": { "id": "anxious", "label": "焦虑", "tone": "需要放慢", "color": "#7c6be8" },
    "stress": 72,
    "keywords": ["学习任务", "睡眠"],
    "feedback": "你提到的学习任务正在占用较多心理能量。",
    "suggestion": "做 3 轮 4-6 呼吸，然后只写下明天最重要的一件小事。",
    "analysisSource": "deepseek"
  }
}
```

## 已实现功能

- 移动端 App 风格界面，桌面端自动显示为演示设备框。
- 语音输入入口：浏览器支持 `SpeechRecognition` 时可尝试识别，不支持时自动回退到文字输入。
- DeepSeek 后端代理：保护 API Key，前端不暴露密钥。
- 本地规则 fallback：没有网络或 Key 时仍能稳定演示。
- 情绪分析：识别焦虑、低落、疲惫、开心、平静。
- 压力指数：输出 0-100 分压力值。
- 关键词识别：学习任务、睡眠、人际关系、未来规划、身体状态、自我要求。
- 情绪歌单：覆盖古典、爵士、流行、民谣、电子、氛围等类型。
- 收藏歌单和收藏书摘：形成用户音乐偏好和文字安慰偏好画像。
- 每日书信、书摘和安慰语。
- 一周趋势和用户体验测量。
- 多主题切换，包括夜间模式。

## 作业汇报角度

这个原型可以被描述为一个独立运行的情绪陪伴模块，也可以嵌入校园心理健康平台或个人健康管理 App。课程汇报可重点展示：用户画像、语音记录任务流程、情绪反馈设计、陪伴推荐设计、隐私与密钥保护、AI 失败回退设计、SUS/满意度/信任感测量和一周趋势反馈。
