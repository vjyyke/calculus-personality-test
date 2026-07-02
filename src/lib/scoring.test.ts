import { describe, expect, it } from "vitest";

import { dimensionPairs, questions, results } from "../data/testData";
import { buildStateFromAnswers, getQuestionOptions, resolveResult, scoreAnswers } from "./scoring";

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
      q8: "C",
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
      q2: "C",
      q3: "A",
      q4: "B",
      q5: "A",
      q6: "A",
      q7: "A",
      q8: "A",
    } as const;

    const result = scoreAnswers(answers);

    expect(result.scores["式"]).toBe(result.scores["景"]);
    expect(result.code).toBe("L-R-P-B");
  });

  it("builds branch state from previous answers before resolving later options", () => {
    expect(buildStateFromAnswers({ q1: "C", q2: "B" })).toMatchObject({
      T: "一元积分",
      M: "构造法",
    });
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
});
