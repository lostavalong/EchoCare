# EchoCare MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, mobile-first EchoCare PWA prototype for voice-based emotion journaling, stress sensing, music recommendations, book/comfort recommendations, weekly trends, and UX measurement.

**Architecture:** The app is a static web prototype with focused JavaScript modules. `src/analysis.js` handles deterministic fallback emotion analysis and recommendations; `app.js` handles UI state, localStorage persistence, optional browser speech recognition, and page interactions. The DeepSeek integration is represented by an optional API design and prompt shape, while the runnable prototype works without backend secrets.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Node.js built-in test runner, localStorage, optional Web Speech API.

---

### Task 1: Project Skeleton and Test Harness

**Files:**
- Create: `package.json`
- Create: `tests/analysis.test.js`

- [ ] Create `package.json` with `node --test` script and ES module mode.
- [ ] Write tests for emotion analysis, stress scoring, music recommendation, book recommendation, and UX survey scoring.
- [ ] Run `npm test` and verify it fails because `src/analysis.js` does not exist yet.

### Task 2: Core Analysis Module

**Files:**
- Create: `src/analysis.js`

- [ ] Implement `analyzeEntry(text)` returning emotion, stress, keywords, feedback, suggestion, playlist, book, comfortText, and createdAt.
- [ ] Implement `scoreUxSurvey(answers)` returning average usability, voice satisfaction, privacy trust, comfort, and overall score.
- [ ] Run `npm test` and verify all tests pass.

### Task 3: Frontend Shell

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `manifest.webmanifest`

- [ ] Build a mobile-first app shell with Dashboard, Record, Insights, Recommendations, Trends, and UX pages.
- [ ] Style the app with a calm, polished visual language and desktop demo frame.
- [ ] Wire navigation and local demo state.

### Task 4: Interaction and Persistence

**Files:**
- Modify: `app.js`

- [ ] Add text entry, optional SpeechRecognition, sample prompts, save/delete records, localStorage persistence, and dynamic trend rendering.
- [ ] Add UX survey inputs and generated result summary.

### Task 5: Documentation and Verification

**Files:**
- Create: `README.md`

- [ ] Document how to open the static app and how to serve it locally for microphone/PWA behavior.
- [ ] Document the optional DeepSeek backend architecture and why API keys must not be placed in frontend code.
- [ ] Run `npm test`.
- [ ] Run a local static server and check that the app loads.
