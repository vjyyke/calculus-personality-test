# Calculus Personality Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React/Vite website for the high-math personality test with branching questions, accurate scoring, a certificate-style result page, and saveable share images.

**Architecture:** The app is a client-only single-page React app. Test content and results live in structured data modules, scoring is isolated in pure functions with unit tests, and the UI is composed from focused components for home, quiz, certificate, report, and share actions.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, `html-to-image`, CSS modules or plain CSS.

---

## File Structure

- Create `package.json`: scripts and dependencies for Vite, React, tests, and image export.
- Create `index.html`: Vite HTML entry.
- Create `src/main.tsx`: React root bootstrap.
- Create `src/App.tsx`: app state machine for home, quiz, and result.
- Create `src/styles.css`: global responsive visual system.
- Create `src/data/testData.ts`: structured questions, dynamic prompts, scoring tags, tie-break metadata, result definitions, and image paths.
- Create `src/lib/scoring.ts`: pure scoring and result resolution functions.
- Create `src/lib/scoring.test.ts`: unit tests for scoring, tie-breaks, and result image mapping.
- Create `src/lib/quizFlow.ts`: answer update helpers that clear downstream answers.
- Create `src/lib/quizFlow.test.ts`: unit tests for answer replacement and branch reset behavior.
- Create `src/lib/shareImage.ts`: save image and copy fallback helpers.
- Create `src/components/Home.tsx`: notebook-opening landing view.
- Create `src/components/QuizCard.tsx`: one-question focused card.
- Create `src/components/ResultCertificate.tsx`: compact certificate view and hidden/exportable compact card target.
- Create `src/components/ReportDetails.tsx`: full report and hidden/exportable full report target.
- Create `src/components/ShareActions.tsx`: save compact card, save full report, copy fallback.
- Create `src/App.test.tsx`: integration tests for the 8-question path and result reveal.
- Create `vite.config.ts`: Vite and Vitest config.
- Create `tsconfig.json` and `tsconfig.node.json`: TypeScript config.

---

### Task 1: Scaffold React/Vite App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create package and config files**

Create `package.json`:

```json
{
  "name": "calculus-personality-test",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "html-to-image": "^1.11.11",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.8",
    "jsdom": "^25.0.1"
  }
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true
  }
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>高数解题人格测试</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create minimal app bootstrap**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="appShell">
      <section className="notebookHero">
        <p className="eyebrow">Calculus Persona</p>
        <h1>高数解题人格测试</h1>
        <p className="heroCopy">
          8 道题，看你面对复杂问题时如何进入、判断、推进和取舍。
        </p>
        <button className="primaryButton" type="button">
          开始测试
        </button>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #292836;
  background: #f7f5f1;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button {
  font: inherit;
}

.appShell {
  min-height: 100vh;
  padding: 32px;
}

.notebookHero {
  max-width: 1120px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  display: grid;
  align-content: center;
}

.eyebrow {
  margin: 0 0 12px;
  color: #706f7e;
  font-size: 0.9rem;
}

h1 {
  margin: 0;
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  line-height: 1.05;
}

.heroCopy {
  max-width: 620px;
  margin: 20px 0 28px;
  color: #454453;
  font-size: 1.08rem;
  line-height: 1.8;
}

.primaryButton {
  width: fit-content;
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  color: #ffffff;
  background: #7f6bb2;
  cursor: pointer;
}

@media (max-width: 720px) {
  .appShell {
    padding: 20px;
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules/` and `package-lock.json` are created with no install errors.

- [ ] **Step 4: Verify scaffold builds**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass, and `dist/` is created.

- [ ] **Step 5: Commit scaffold**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json src/main.tsx src/App.tsx src/styles.css
git commit -m "feat: scaffold calculus personality app"
```

---

### Task 2: Add Structured Test Data

**Files:**
- Create: `src/data/testData.ts`

- [ ] **Step 1: Define types and constants**

Create `src/data/testData.ts` with:

```ts
export type ScoreTag = "景" | "式" | "判" | "构" | "拆" | "统" | "稳" | "巧";
export type LetterCode = "C" | "L" | "R" | "X" | "P" | "W" | "B" | "F";
export type QuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8";
export type BranchKey = "T" | "M" | "K" | "F" | "P" | "R" | "G";

export type AnswerOption = {
  id: "A" | "B" | "C" | "D";
  text: string;
  scores: ScoreTag[];
  set?: Partial<Record<BranchKey, string>>;
};

export type Question = {
  id: QuestionId;
  title: string;
  prompt: string | ((state: Partial<Record<BranchKey, string>>) => string);
  options: AnswerOption[] | ((state: Partial<Record<BranchKey, string>>) => AnswerOption[]);
};

export type PersonalityResult = {
  code: string;
  chineseCode: string;
  typeName: string;
  shortName: string;
  description: string;
  shortDescription: string;
  image: string;
};

export const scoreLabels: Record<ScoreTag, LetterCode> = {
  景: "C",
  式: "L",
  判: "R",
  构: "X",
  拆: "P",
  统: "W",
  稳: "B",
  巧: "F"
};

export const dimensionPairs = [
  { left: "景", right: "式", leftLetter: "C", rightLetter: "L", name: "信息入口" },
  { left: "判", right: "构", leftLetter: "R", rightLetter: "X", name: "决策依据" },
  { left: "拆", right: "统", leftLetter: "P", rightLetter: "W", name: "处理方式" },
  { left: "稳", right: "巧", leftLetter: "B", rightLetter: "F", name: "行动偏好" }
] as const;

export const tieBreakRules: Record<string, QuestionId[]> = {
  "景/式": ["q1", "q7"],
  "判/构": ["q2", "q8"],
  "拆/统": ["q4", "q7"],
  "稳/巧": ["q6", "q8"]
};
```

- [ ] **Step 2: Add all questions from source Markdown**

Append the complete `questions` array from `高数解题人格测试.md`. Use the exact scoring tags and branch variable values from the Markdown. Use functions for dynamic prompts and Q2 dynamic options.

The implementation must include all eight questions:

```ts
export const questions: Question[] = [
  {
    id: "q1",
    title: "你第一眼最想做哪道题？",
    prompt: "四道题难度相近，你会优先选哪一道？",
    options: [
      { id: "A", text: "判断一个含有阶乘、指数和幂的正项级数是否收敛。", scores: ["式", "判"], set: { T: "级数" } },
      { id: "B", text: "计算一个由球面、圆锥面和坐标面围成区域上的三重积分。", scores: ["景", "统"], set: { T: "三重积分" } },
      { id: "C", text: "计算一个含根式、三角函数和有理式混合的一元积分。", scores: ["式", "构"], set: { T: "一元积分" } },
      { id: "D", text: "求一个多元函数在约束条件下的最大值和最小值。", scores: ["判", "稳"], set: { T: "条件极值" } }
    ]
  }
];
```

Continue by adding Q2 through Q8 with the same data from the source files. Do not expose internal score labels in UI text.

- [ ] **Step 3: Add all 16 personality results**

Append `results` as a `Record<string, PersonalityResult>` keyed by `C-R-P-B` style code. Include all 16 results from `高数解题人格测试.md` and map each to the matching image file under `/personality_characters_d_route/`.

Example entry:

```ts
export const results: Record<string, PersonalityResult> = {
  "C-R-P-B": {
    code: "C-R-P-B",
    chineseCode: "景-判-拆-稳",
    typeName: "谨慎观察型",
    shortName: "守序者",
    description: "你通常会先观察局面，再按可靠规则一步步处理。你重视边界、细节和责任感，不太喜欢在信息不全时贸然决定。别人会觉得你稳、细、值得托付；但你有时也会因为想确认得更完整，而比别人更晚行动。",
    shortDescription: "先观察局面，再按可靠规则一步步处理。",
    image: "/personality_characters_d_route/01_C-R-P-B_shouxuzhe.png"
  }
};
```

Continue with all 16 image paths from the folder.

- [ ] **Step 4: Run type check**

Run:

```bash
npm run build
```

Expected: build passes with no TypeScript errors.

- [ ] **Step 5: Commit data module**

```bash
git add src/data/testData.ts
git commit -m "feat: add structured quiz data"
```

---

### Task 3: Implement Scoring With Tests

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/lib/scoring.ts`
- Create: `src/lib/scoring.test.ts`

- [ ] **Step 1: Add test setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing scoring tests**

Create `src/lib/scoring.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { questions, results } from "../data/testData";
import { resolveResult, scoreAnswers } from "./scoring";

describe("scoreAnswers", () => {
  it("scores a known L-X-W-F path", () => {
    const answers = {
      q1: "C",
      q2: "B",
      q3: "D",
      q4: "C",
      q5: "D",
      q6: "D",
      q7: "D",
      q8: "C"
    } as const;

    const scored = scoreAnswers(answers, questions);
    expect(scored.scores.式).toBeGreaterThan(scored.scores.景);
    expect(scored.scores.构).toBeGreaterThan(scored.scores.判);
    expect(scored.scores.统).toBeGreaterThan(scored.scores.拆);
    expect(scored.scores.巧).toBeGreaterThan(scored.scores.稳);
    expect(scored.code).toBe("L-X-W-F");
  });

  it("uses tie breakers when a dimension is tied", () => {
    const answers = {
      q1: "A",
      q2: "A",
      q3: "D",
      q4: "B",
      q5: "A",
      q6: "B",
      q7: "A",
      q8: "D"
    } as const;

    const scored = scoreAnswers(answers, questions);
    expect(scored.code.split("-")[0]).toBe("L");
  });

  it("resolves every result code to a result and image", () => {
    for (const result of Object.values(results)) {
      expect(resolveResult(result.code, results).image).toContain(result.code);
    }
  });
});
```

- [ ] **Step 3: Run tests and verify failure**

Run:

```bash
npm test -- src/lib/scoring.test.ts
```

Expected: FAIL because `src/lib/scoring.ts` does not exist.

- [ ] **Step 4: Implement scoring**

Create `src/lib/scoring.ts`:

```ts
import { dimensionPairs, questions as defaultQuestions, results as defaultResults, tieBreakRules } from "../data/testData";
import type { AnswerOption, PersonalityResult, Question, QuestionId, ScoreTag } from "../data/testData";

export type Answers = Partial<Record<QuestionId, AnswerOption["id"]>>;

export type ScoredResult = {
  scores: Record<ScoreTag, number>;
  code: string;
  chineseCode: string;
};

const initialScores: Record<ScoreTag, number> = {
  景: 0,
  式: 0,
  判: 0,
  构: 0,
  拆: 0,
  统: 0,
  稳: 0,
  巧: 0
};

export function getQuestionOptions(question: Question, state: Record<string, string>) {
  return typeof question.options === "function" ? question.options(state) : question.options;
}

export function buildStateFromAnswers(answers: Answers, questions: Question[] = defaultQuestions) {
  const state: Record<string, string> = {};

  for (const question of questions) {
    const answerId = answers[question.id];
    if (!answerId) continue;
    const option = getQuestionOptions(question, state).find((item) => item.id === answerId);
    if (option?.set) Object.assign(state, option.set);
  }

  return state;
}

export function scoreAnswers(answers: Answers, questions: Question[] = defaultQuestions): ScoredResult {
  const scores = { ...initialScores };
  const selectedByQuestion = new Map<QuestionId, AnswerOption>();
  const state: Record<string, string> = {};

  for (const question of questions) {
    const answerId = answers[question.id];
    if (!answerId) continue;

    const option = getQuestionOptions(question, state).find((item) => item.id === answerId);
    if (!option) continue;

    selectedByQuestion.set(question.id, option);
    for (const tag of option.scores) scores[tag] += 1;
    if (option.set) Object.assign(state, option.set);
  }

  const codeParts: string[] = [];
  const chineseParts: string[] = [];

  for (const pair of dimensionPairs) {
    const leftScore = scores[pair.left];
    const rightScore = scores[pair.right];
    let useLeft = leftScore >= rightScore;

    if (leftScore === rightScore) {
      const ruleKey = `${pair.left}/${pair.right}`;
      useLeft = breakTie(ruleKey, pair.left, pair.right, selectedByQuestion);
    }

    codeParts.push(useLeft ? pair.leftLetter : pair.rightLetter);
    chineseParts.push(useLeft ? pair.left : pair.right);
  }

  return {
    scores,
    code: codeParts.join("-"),
    chineseCode: chineseParts.join("-")
  };
}

function breakTie(
  ruleKey: string,
  left: ScoreTag,
  right: ScoreTag,
  selectedByQuestion: Map<QuestionId, AnswerOption>
) {
  const questionsForTie = tieBreakRules[ruleKey] ?? [];

  for (const questionId of questionsForTie) {
    const option = selectedByQuestion.get(questionId);
    if (!option) continue;
    const hasLeft = option.scores.includes(left);
    const hasRight = option.scores.includes(right);
    if (hasLeft && !hasRight) return true;
    if (hasRight && !hasLeft) return false;
  }

  return true;
}

export function resolveResult(
  code: string,
  results: Record<string, PersonalityResult> = defaultResults
) {
  const result = results[code];
  if (!result) throw new Error(`Unknown personality result code: ${code}`);
  return result;
}
```

- [ ] **Step 5: Run scoring tests**

Run:

```bash
npm test -- src/lib/scoring.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit scoring**

```bash
git add src/test/setup.ts src/lib/scoring.ts src/lib/scoring.test.ts
git commit -m "feat: implement personality scoring"
```

---

### Task 4: Implement Quiz Flow State

**Files:**
- Create: `src/lib/quizFlow.ts`
- Create: `src/lib/quizFlow.test.ts`

- [ ] **Step 1: Write failing quiz flow tests**

Create `src/lib/quizFlow.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { answerQuestion, getNextQuestionIndex } from "./quizFlow";

describe("quizFlow", () => {
  it("stores an answer and keeps earlier answers", () => {
    const answers = answerQuestion({ q1: "A" }, "q2", "C");
    expect(answers).toEqual({ q1: "A", q2: "C" });
  });

  it("clears downstream answers when an earlier answer changes", () => {
    const answers = answerQuestion(
      { q1: "A", q2: "B", q3: "C", q4: "D" },
      "q2",
      "A"
    );
    expect(answers).toEqual({ q1: "A", q2: "A" });
  });

  it("calculates next question index", () => {
    expect(getNextQuestionIndex(0, 8)).toBe(1);
    expect(getNextQuestionIndex(7, 8)).toBe(7);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- src/lib/quizFlow.test.ts
```

Expected: FAIL because `src/lib/quizFlow.ts` does not exist.

- [ ] **Step 3: Implement quiz flow helpers**

Create `src/lib/quizFlow.ts`:

```ts
import type { AnswerOption, QuestionId } from "../data/testData";

const questionOrder: QuestionId[] = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

export type QuizAnswers = Partial<Record<QuestionId, AnswerOption["id"]>>;

export function answerQuestion(
  current: QuizAnswers,
  questionId: QuestionId,
  answerId: AnswerOption["id"]
): QuizAnswers {
  const changedIndex = questionOrder.indexOf(questionId);
  const nextAnswers: QuizAnswers = {};

  for (const id of questionOrder.slice(0, changedIndex)) {
    if (current[id]) nextAnswers[id] = current[id];
  }

  nextAnswers[questionId] = answerId;
  return nextAnswers;
}

export function getNextQuestionIndex(currentIndex: number, total: number) {
  return Math.min(currentIndex + 1, total - 1);
}

export function getPreviousQuestionIndex(currentIndex: number) {
  return Math.max(currentIndex - 1, 0);
}
```

- [ ] **Step 4: Run quiz flow tests**

Run:

```bash
npm test -- src/lib/quizFlow.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit quiz flow**

```bash
git add src/lib/quizFlow.ts src/lib/quizFlow.test.ts
git commit -m "feat: add quiz flow state helpers"
```

---

### Task 5: Build Core UI Components

**Files:**
- Create: `src/components/Home.tsx`
- Create: `src/components/QuizCard.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write failing integration test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("starts the quiz and reaches a result after 8 answers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));
    expect(screen.getByText("你第一眼最想做哪道题？")).toBeInTheDocument();

    for (let i = 0; i < 8; i += 1) {
      const options = screen.getAllByRole("button").filter((button) =>
        /^[ABCD]\./.test(button.textContent ?? "")
      );
      await user.click(options[0]);
    }

    expect(screen.getByText("人格判定证书")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run integration test and verify failure**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because app does not implement quiz flow.

- [ ] **Step 3: Implement Home component**

Create `src/components/Home.tsx`:

```tsx
type HomeProps = {
  onStart: () => void;
};

export function Home({ onStart }: HomeProps) {
  return (
    <section className="homePage">
      <div className="heroText">
        <p className="eyebrow">Calculus Persona</p>
        <h1>高数解题人格测试</h1>
        <p className="heroCopy">
          这不是数学能力测试，而是看你面对复杂问题时如何进入、判断、推进和取舍。
        </p>
        <button className="primaryButton" type="button" onClick={onStart}>
          开始测试
        </button>
      </div>
      <div className="heroNotebook" aria-hidden="true">
        <img
          src="/personality_characters_d_route/00_contact_sheet_16_characters.png"
          alt=""
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement QuizCard component**

Create `src/components/QuizCard.tsx`:

```tsx
import type { AnswerOption, Question } from "../data/testData";

type QuizCardProps = {
  question: Question;
  prompt: string;
  options: AnswerOption[];
  index: number;
  total: number;
  selected?: AnswerOption["id"];
  canGoBack: boolean;
  onAnswer: (answerId: AnswerOption["id"]) => void;
  onBack: () => void;
};

export function QuizCard({
  question,
  prompt,
  options,
  index,
  total,
  selected,
  canGoBack,
  onAnswer,
  onBack
}: QuizCardProps) {
  return (
    <section className="quizPage">
      <div className="progressRow">
        <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <div className="progressTrack">
          <div className="progressFill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>
      <article className="questionCard">
        <p className="questionKicker">{question.title}</p>
        <h2>{prompt}</h2>
        <div className="answerGrid">
          {options.map((option) => (
            <button
              className={option.id === selected ? "answerOption isSelected" : "answerOption"}
              key={option.id}
              type="button"
              onClick={() => onAnswer(option.id)}
            >
              <span className="answerLetter">{option.id}.</span>
              <span>{option.text}</span>
            </button>
          ))}
        </div>
      </article>
      <button className="ghostButton" type="button" onClick={onBack} disabled={!canGoBack}>
        上一题
      </button>
    </section>
  );
}
```

- [ ] **Step 5: Wire App state**

Replace `src/App.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { Home } from "./components/Home";
import { QuizCard } from "./components/QuizCard";
import { questions, results } from "./data/testData";
import { buildStateFromAnswers, getQuestionOptions, resolveResult, scoreAnswers } from "./lib/scoring";
import { answerQuestion, getNextQuestionIndex, getPreviousQuestionIndex, type QuizAnswers } from "./lib/quizFlow";

export default function App() {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const state = useMemo(() => buildStateFromAnswers(answers, questions), [answers]);
  const currentQuestion = questions[questionIndex];
  const prompt = typeof currentQuestion.prompt === "function" ? currentQuestion.prompt(state) : currentQuestion.prompt;
  const options = getQuestionOptions(currentQuestion, state);
  const complete = questions.every((question) => answers[question.id]);

  if (!started) return <Home onStart={() => setStarted(true)} />;

  if (complete) {
    const scored = scoreAnswers(answers, questions);
    const result = resolveResult(scored.code, results);
    return (
      <main className="appShell">
        <section className="resultHero">
          <article className="questionCard">
            <p className="questionKicker">人格判定证书</p>
            <h2>{result.typeName}｜{result.shortName}</h2>
            <p className="resultCode">{scored.chineseCode} / {scored.code}</p>
            <p className="resultShort">{result.shortDescription}</p>
            <button
              className="primaryButton"
              type="button"
              onClick={() => {
                setAnswers({});
                setQuestionIndex(0);
                setStarted(false);
              }}
            >
              重新测试
            </button>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <QuizCard
        question={currentQuestion}
        prompt={prompt}
        options={options}
        index={questionIndex}
        total={questions.length}
        selected={answers[currentQuestion.id]}
        canGoBack={questionIndex > 0}
        onBack={() => setQuestionIndex((index) => getPreviousQuestionIndex(index))}
        onAnswer={(answerId) => {
          setAnswers((current) => answerQuestion(current, currentQuestion.id, answerId));
          setQuestionIndex((index) => getNextQuestionIndex(index, questions.length));
        }}
      />
    </main>
  );
}
```

- [ ] **Step 6: Add responsive core styles**

Extend `src/styles.css` with:

```css
.homePage {
  max-width: 1120px;
  min-height: calc(100vh - 64px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  gap: 48px;
  align-items: center;
}

.heroNotebook {
  padding: 18px;
  border: 1px solid #d6d1cc;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(41, 40, 54, 0.12);
}

.heroNotebook img {
  display: block;
  width: 100%;
  border-radius: 8px;
}

.quizPage {
  max-width: 820px;
  min-height: calc(100vh - 64px);
  margin: 0 auto;
  display: grid;
  align-content: center;
  gap: 18px;
}

.progressRow {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  color: #706f7e;
}

.progressTrack {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6e1da;
}

.progressFill {
  height: 100%;
  border-radius: inherit;
  background: #b39ad2;
}

.questionCard {
  padding: 28px;
  border: 1px solid #d6d1cc;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(41, 40, 54, 0.1);
}

.questionKicker {
  margin: 0 0 10px;
  color: #706f7e;
}

.questionCard h2 {
  margin: 0;
  font-size: clamp(1.45rem, 4vw, 2.25rem);
  line-height: 1.28;
}

.answerGrid {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.answerOption {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  width: 100%;
  padding: 15px 16px;
  border: 1px solid #d6d1cc;
  border-radius: 10px;
  color: #292836;
  background: #fff;
  text-align: left;
  line-height: 1.55;
  cursor: pointer;
}

.answerOption.isSelected,
.answerOption:hover {
  border-color: #b39ad2;
  background: #eee8f6;
}

.answerLetter {
  font-weight: 800;
  color: #7f6bb2;
}

.ghostButton {
  width: fit-content;
  border: 1px solid #d6d1cc;
  border-radius: 999px;
  padding: 10px 16px;
  color: #454453;
  background: #fff;
}

.ghostButton:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 760px) {
  .homePage {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .questionCard {
    padding: 20px;
  }
}
```

- [ ] **Step 7: Run integration test and commit core UI**

Run:

```bash
npm test -- src/App.test.tsx
npm run build
git add src/App.tsx src/App.test.tsx src/components/Home.tsx src/components/QuizCard.tsx src/styles.css
git commit -m "feat: build core quiz interface"
```

Expected: the app starts the quiz, answers eight questions, and reaches the basic result certificate.

---

### Task 6: Build Result Certificate and Report

**Files:**
- Create: `src/components/ResultCertificate.tsx`
- Create: `src/components/ReportDetails.tsx`
- Create: `src/components/ShareActions.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement compact result certificate**

Create `src/components/ResultCertificate.tsx`:

```tsx
import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";

type ResultCertificateProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ResultCertificate({ result, scored }: ResultCertificateProps) {
  const dimensions = scored.chineseCode.split("-");

  return (
    <section className="resultHero">
      <div className="certificateCard" id="compact-certificate">
        <div className="certificateMeta">
          <span>人格判定证书</span>
          <span>No. {result.code}</span>
        </div>
        <div className="certificateBody">
          <img className="resultCharacter" src={result.image} alt={`${result.shortName} 角色图`} />
          <div>
            <p className="eyebrow">你的思维人格是</p>
            <h2>{result.typeName}｜{result.shortName}</h2>
            <p className="resultCode">{result.chineseCode} / {result.code}</p>
            <p className="resultShort">{result.shortDescription}</p>
          </div>
        </div>
        <div className="dimensionChips">
          <span>信息入口：{dimensions[0]}</span>
          <span>决策依据：{dimensions[1]}</span>
          <span>处理方式：{dimensions[2]}</span>
          <span>行动偏好：{dimensions[3]}</span>
        </div>
        <p className="certificateFooter">高数解题人格测试</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implement full report**

Create `src/components/ReportDetails.tsx`:

```tsx
import type { PersonalityResult, ScoreTag } from "../data/testData";
import { dimensionPairs } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";
import { ShareActions } from "./ShareActions";

type ReportDetailsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
  onRestart: () => void;
};

export function ReportDetails({ result, scored, onRestart }: ReportDetailsProps) {
  return (
    <section className="reportSection" id="full-report">
      <div className="reportText">
        <h2>完整解读</h2>
        <p>{result.description}</p>
      </div>
      <div className="scoreGrid">
        {dimensionPairs.map((pair) => (
          <div className="scorePanel" key={pair.name}>
            <h3>{pair.name}</h3>
            <p>
              {pair.left} {scored.scores[pair.left as ScoreTag]} / {pair.right} {scored.scores[pair.right as ScoreTag]}
            </p>
          </div>
        ))}
      </div>
      <ShareActions result={result} scored={scored} />
      <button className="ghostButton" type="button" onClick={onRestart}>
        重新测试
      </button>
    </section>
  );
}
```

- [ ] **Step 3: Add initial ShareActions component**

Create `src/components/ShareActions.tsx`:

```tsx
import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";

type ShareActionsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ShareActions({ result, scored }: ShareActionsProps) {
  return (
    <div className="shareActions">
      <button type="button" className="primaryButton">
        保存精简证书卡
      </button>
      <button type="button" className="ghostButton">
        保存完整报告图
      </button>
      <button
        type="button"
        className="ghostButton"
        onClick={() => navigator.clipboard?.writeText(`${result.typeName}｜${result.shortName} ${scored.chineseCode} / ${scored.code}`)}
      >
        复制结果文字
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Wire full result components into App**

Update the complete-state block in `src/App.tsx` to:

```tsx
  if (complete) {
    const scored = scoreAnswers(answers, questions);
    const result = resolveResult(scored.code, results);
    return (
      <main className="appShell">
        <ResultCertificate result={result} scored={scored} />
        <ReportDetails
          result={result}
          scored={scored}
          onRestart={() => {
            setAnswers({});
            setQuestionIndex(0);
            setStarted(false);
          }}
        />
      </main>
    );
  }
```

Add these imports to `src/App.tsx`:

```tsx
import { ResultCertificate } from "./components/ResultCertificate";
import { ReportDetails } from "./components/ReportDetails";
```

- [ ] **Step 5: Add result styles**

Append to `src/styles.css`:

```css
.resultHero,
.reportSection {
  max-width: 960px;
  margin: 0 auto;
}

.certificateCard {
  padding: 22px;
  border: 1px solid #d6d1cc;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(41, 40, 54, 0.12);
}

.certificateMeta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #706f7e;
  font-size: 0.82rem;
}

.certificateBody {
  display: grid;
  grid-template-columns: minmax(180px, 280px) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
  margin-top: 20px;
}

.resultCharacter {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
}

.certificateBody h2 {
  margin: 0;
  font-size: clamp(2rem, 6vw, 4rem);
  line-height: 1.08;
}

.resultCode {
  color: #7f6bb2;
  font-weight: 700;
}

.resultShort {
  max-width: 520px;
  color: #454453;
  line-height: 1.75;
}

.dimensionChips {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.dimensionChips span,
.scorePanel {
  padding: 12px;
  border-radius: 10px;
  background: #eee8f6;
}

.certificateFooter {
  margin: 18px 0 0;
  color: #706f7e;
  font-size: 0.86rem;
}

.reportSection {
  display: grid;
  gap: 20px;
  margin-top: 28px;
}

.reportText,
.scoreGrid {
  padding: 22px;
  border: 1px solid #d6d1cc;
  border-radius: 12px;
  background: #ffffff;
}

.reportText p {
  color: #454453;
  line-height: 1.85;
}

.scoreGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.scorePanel h3,
.scorePanel p {
  margin: 0;
}

.scorePanel p {
  margin-top: 8px;
  color: #454453;
}

.shareActions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 760px) {
  .certificateBody,
  .dimensionChips,
  .scoreGrid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass, build passes.

- [ ] **Step 7: Commit result components**

```bash
git add src/components/ResultCertificate.tsx src/components/ReportDetails.tsx src/components/ShareActions.tsx src/styles.css
git commit -m "feat: add personality result certificate"
```

---

### Task 7: Implement Share Image Export

**Files:**
- Create: `src/lib/shareImage.ts`
- Modify: `src/components/ShareActions.tsx`

- [ ] **Step 1: Write save helper**

Create `src/lib/shareImage.ts`:

```ts
import { toPng } from "html-to-image";

export async function saveElementAsPng(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Cannot find export target: ${elementId}`);

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#f7f5f1"
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function buildResultText(typeName: string, shortName: string, chineseCode: string, code: string) {
  return `我的高数解题人格是：${typeName}｜${shortName}\\n${chineseCode} / ${code}`;
}
```

- [ ] **Step 2: Wire ShareActions to export**

Replace `src/components/ShareActions.tsx` with:

```tsx
import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";
import { buildResultText, saveElementAsPng } from "../lib/shareImage";

type ShareActionsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ShareActions({ result, scored }: ShareActionsProps) {
  const copyText = buildResultText(result.typeName, result.shortName, scored.chineseCode, scored.code);

  return (
    <div className="shareActions">
      <button
        type="button"
        className="primaryButton"
        onClick={() => saveElementAsPng("compact-certificate", `${result.code}-certificate.png`)}
      >
        保存精简证书卡
      </button>
      <button
        type="button"
        className="ghostButton"
        onClick={() => saveElementAsPng("full-report", `${result.code}-full-report.png`)}
      >
        保存完整报告图
      </button>
      <button
        type="button"
        className="ghostButton"
        onClick={() => navigator.clipboard?.writeText(copyText)}
      >
        复制结果文字
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Build to verify export dependency**

Run:

```bash
npm run build
```

Expected: build passes and `html-to-image` imports correctly.

- [ ] **Step 4: Commit share export**

```bash
git add src/lib/shareImage.ts src/components/ShareActions.tsx
git commit -m "feat: add result image export"
```

---

### Task 8: Visual QA and Final Verification

**Files:**
- Modify as needed: `src/styles.css`
- Modify as needed: affected components

- [ ] **Step 1: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 2: Verify desktop flow**

Open the local URL in the in-app browser. Complete a full 8-question path.

Expected:

- Homepage uses notebook opening layout.
- Quiz page shows no live dimension scores.
- Long Chinese options stay readable.
- Result shows compact certificate first and full report below.

- [ ] **Step 3: Verify mobile layout**

Use browser viewport tooling or responsive mode at 390 x 844.

Expected:

- Homepage becomes single column.
- Quiz answers remain one column.
- Certificate image and text stack cleanly.
- No button text or Chinese paragraph overflows its container.

- [ ] **Step 4: Verify result export manually**

Click:

- `保存精简证书卡`
- `保存完整报告图`
- `复制结果文字`

Expected:

- Both image downloads trigger.
- Copied text contains type name and code.
- If a download fails in the browser environment, the app still keeps copy fallback available.

- [ ] **Step 5: Run full automated verification**

Run:

```bash
npm test
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Final commit**

```bash
git add src package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json
git commit -m "feat: complete calculus personality test website"
```

---

## Plan Self-Review

- Spec coverage: The plan covers React/Vite static app, notebook home, focused quiz card, hidden scoring, certificate result, two share image actions, responsive text layout, branch state, scoring, tie-breaks, and no backend.
- Placeholder scan: No task depends on unresolved product choices. The data task explicitly requires copying all source Markdown content into structured data before tests pass.
- Type consistency: `QuestionId`, `AnswerOption`, `PersonalityResult`, `ScoredResult`, `QuizAnswers`, and component props are defined before they are used.
- Test coverage: Pure scoring, quiz flow, and app integration are covered. Final visual and download behavior are verified manually because canvas/image export is browser-dependent.
