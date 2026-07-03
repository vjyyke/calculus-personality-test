import { describe, expect, it } from "vitest";

import { dimensionPairs, questions, results } from "../data/testData";
import { buildStateFromAnswers, getQuestionOptions, resolveResult, scoreAnswers } from "./scoring";

describe("scoreAnswers", () => {
  it("scores a known L-X-W-F path", () => {
    const answers = {
      q1: "C",
      q2: "B",
      q3: "A",
      q4: "D",
      q5: "A",
      q6: "A",
      q7: "C",
      q8: "A",
    } as const;

    const result = scoreAnswers(answers);

    expect(result.scores["式"]).toBeGreaterThan(result.scores["景"]);
    expect(result.scores["构"]).toBeGreaterThan(result.scores["判"]);
    expect(result.scores["统"]).toBeGreaterThan(result.scores["拆"]);
    expect(result.scores["巧"]).toBeGreaterThan(result.scores["稳"]);
    expect(result.code).toBe("L-X-W-F");
  });

  it("uses tie breakers in priority order when a dimension is tied", () => {
    const answers = {
      q1: "C",
      q2: "A",
      q3: "B",
      q4: "C",
      q5: "B",
      q6: "C",
      q7: "B",
      q8: "D",
    } as const;

    const result = scoreAnswers(answers);

    expect(result.scores["式"]).toBe(result.scores["景"]);
    expect(result.code).toBe("L-R-P-B");
  });

  it("builds branch state from previous answers before resolving later options", () => {
    const state = buildStateFromAnswers({
      q1: "C",
      q2: "B",
      q3: "A",
      q4: "D",
      q5: "A",
      q6: "A",
      q7: "C",
    });

    expect(state).toEqual({
      T: "一元积分",
      M: "构造法",
      K: "换构造",
      P: "整体",
      R: "冒险",
      G: "构造入口",
    });
    expect(state).not.toHaveProperty("F");
  });
});

describe("resolveResult", () => {
  it("resolves every result code to a result and image", () => {
    const possibleCodes = dimensionPairs.reduce<string[]>(
      (codes, pair) =>
        codes.flatMap((code) => [
          `${code}${code ? "-" : ""}${pair.leftLetter}`,
          `${code}${code ? "-" : ""}${pair.rightLetter}`,
        ]),
      [""],
    );

    for (const code of possibleCodes) {
      const result = resolveResult(code);

      expect(result.code).toBe(code);
      expect(result.image).toBeTruthy();
    }
  });

  it("throws for unknown result codes", () => {
    expect(() => resolveResult("C-R-P-X")).toThrow(/Unknown result code/);
  });
});

describe("result data", () => {
  it("keeps result keys aligned with result codes and contains 16 records", () => {
    expect(Object.keys(results)).toHaveLength(16);

    for (const [key, result] of Object.entries(results)) {
      expect(result.code).toBe(key);
    }
  });

  it("supports all four q2 branches with four options each", () => {
    const q2 = questions.find((question) => question.id === "q2");
    expect(q2).toBeDefined();

    for (const T of ["级数", "三重积分", "一元积分", "条件极值"]) {
      const options = getQuestionOptions(q2!, { T });

      expect(options).toHaveLength(4);
      expect(options.map((option) => option.id)).toEqual(["A", "B", "C", "D"]);
    }
  });

  it("keeps q3 through q8 on the q1 topic route", () => {
    const state = {
      T: "三重积分",
      M: "统一法",
      K: "看整体",
      P: "框架",
      R: "漂亮",
      G: "图像入口",
    };

    const prompts = Object.fromEntries(
      questions
        .filter((question) => ["q3", "q4", "q5", "q6", "q7", "q8"].includes(question.id))
        .map((question) => [
          question.id,
          typeof question.prompt === "function" ? question.prompt(state) : question.prompt,
        ]),
    );
    const optionTexts = Object.fromEntries(
      questions
        .filter((question) => ["q3", "q4", "q5", "q6", "q7", "q8"].includes(question.id))
        .map((question) => [question.id, getQuestionOptions(question, state).map((option) => option.text)]),
    );

    expect(prompts.q3).toContain("统一入口还没出现。");
    expect(prompts.q3).toContain("上下界开始打架。");
    expect(optionTexts.q4).toContain("区域整体形状和对称性。");
    expect(optionTexts.q5).toContain("用换元或参数化简化边界。");
    expect(prompts.q6).toContain("条件还没补齐。");
    expect(optionTexts.q6).toContain("补边界、投影边缘和分块。");
    expect(prompts.q7).toContain("找统一主线。");
    expect(optionTexts.q7).toContain("区域形状如何随参数改变。");
    expect(prompts.q8).toContain("从图像进入。");
    expect(optionTexts.q8).toContain("一份几行化简区域的答案：一个变换把复杂边界变简单。");
  });

  it("uses the upgraded q8 option order and scoring", () => {
    const q8 = questions.find((question) => question.id === "q8");
    expect(q8).toBeDefined();

    const options = getQuestionOptions(q8!, { T: "级数", G: "表达式入口" });

    expect(options.map((option) => option.id)).toEqual(["A", "B", "C", "D"]);
    expect(options.map((option) => option.scores)).toEqual([
      ["式", "构", "巧"],
      ["判", "稳"],
      ["拆", "稳"],
      ["景", "统", "巧"],
    ]);
    expect(options[0].text).toContain("比较对象选得准");
    expect(options[3].text).toContain("增长速度和临界点很直观");
  });
});
