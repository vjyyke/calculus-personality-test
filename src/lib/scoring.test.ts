import { describe, expect, it } from "vitest";

import { dimensionPairs, questions, results } from "../data/testData";
import { buildStateFromAnswers, getQuestionOptions, resolveResult, scoreAnswers } from "./scoring";

describe("scoreAnswers", () => {
  it("scores a known L-X-P-F path with unified final questions", () => {
    const answers = {
      q1: "C",
      q2: "B",
      q3: "A",
      q4: "A",
      q5: "D",
      q6: "D",
      q7: "D",
      q8: "D",
    } as const;

    const result = scoreAnswers(answers);

    expect(result.scores["式"]).toBeGreaterThan(result.scores["景"]);
    expect(result.scores["构"]).toBeGreaterThan(result.scores["判"]);
    expect(result.scores["拆"]).toBe(result.scores["统"]);
    expect(result.scores["巧"]).toBeGreaterThan(result.scores["稳"]);
    expect(result.code).toBe("L-X-P-F");
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
    expect(result.code).toBe("L-R-W-B");
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
    });
    expect(state).not.toHaveProperty("P");
    expect(state).not.toHaveProperty("R");
    expect(state).not.toHaveProperty("G");
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

  it("keeps q2 through q4 on the q1 topic route and makes q5 through q8 unified", () => {
    const state = {
      T: "三重积分",
      M: "统一法",
      K: "看整体",
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

    expect(prompts.q3).toContain("你的解法用不了，");
    expect(prompts.q3).toContain("区域很复杂。");
    expect(prompts.q4).toContain("你评估了整体结构，");
    expect(optionTexts.q4).toContain("关键坐标变换和雅可比。");
    expect(prompts.q5).toBe("考试结束后，你发现有人用了和你完全不同的方法，而且同样做对了。你的第一反应是什么？");
    expect(optionTexts.q5).toEqual([
      "先怀疑：这个方法真的可靠吗？",
      "先好奇：他为什么会想到这里？",
      "先分析：两种方法到底差在哪一步？",
      "先兴奋：这个方法以后还能怎么用？",
    ]);
    expect(prompts.q6).toBe("下面四种题，你最不想遇到的是哪道？");
    expect(optionTexts.q6).toContain("图形、空间关系太复杂，一时看不出整体。");
    expect(prompts.q7).toBe("老师刚写完题目，你最期待他下一句话是什么？");
    expect(optionTexts.q7).toContain("“其实还有一种更巧的方法。”");
    expect(prompts.q8).toBe("考试前最后一小时，你最可能做什么？");
    expect(optionTexts.q8).toContain("看整理好的技巧和易错点。");

    const q5 = questions.find((question) => question.id === "q5");
    expect(getQuestionOptions(q5!, { T: "级数" })).toEqual(getQuestionOptions(q5!, { T: "条件极值", K: "拆小块" }));
  });

  it("uses the unified q5 through q8 option order and scoring", () => {
    const q5 = questions.find((question) => question.id === "q5");
    const q8 = questions.find((question) => question.id === "q8");
    expect(q5).toBeDefined();
    expect(q8).toBeDefined();

    const q5Options = getQuestionOptions(q5!, { T: "级数" });
    const q8Options = getQuestionOptions(q8!, { T: "三重积分" });

    expect(q5Options.map((option) => option.id)).toEqual(["A", "B", "C", "D"]);
    expect(q5Options.map((option) => option.scores)).toEqual([
      ["判", "稳"],
      ["景", "统"],
      ["式", "拆"],
      ["构", "巧"],
    ]);
    expect(q8Options.map((option) => option.scores)).toEqual([
      ["判", "稳"],
      ["景", "统"],
      ["式", "拆"],
      ["构", "巧"],
    ]);
    expect(q8Options[0].text).toBe("再翻一遍公式和定理。");
    expect(q8Options[3].text).toBe("看整理好的技巧和易错点。");
  });

  it("matches the latest visible quiz wording from the markdown", () => {
    const q1 = questions.find((question) => question.id === "q1");
    const q2 = questions.find((question) => question.id === "q2");
    const q4 = questions.find((question) => question.id === "q4");
    const q5 = questions.find((question) => question.id === "q5");
    const q8 = questions.find((question) => question.id === "q8");

    expect(q1?.title).toBe("四张卷子同时摆在你面前，你会选择做哪张？");
    expect(q1?.prompt).toBe("卷子的分值和难度都差不多。你会更愿意从哪一题开始？");

    expect(typeof q2?.prompt === "function" ? q2.prompt({ T: "级数" }) : q2?.prompt).toBe(
      "一个正项级数同时含有 n!、指数和幂函数。你优先看什么？",
    );
    expect(getQuestionOptions(q2!, { T: "级数" })[0].text).toBe("看相邻两项之比，极限判别法。");
    expect(getQuestionOptions(q2!, { T: "一元积分" })[1].text).toBe("可不可以变量替换。");

    expect(q4?.title).toBe("考试只剩几分钟了！");
    expect(typeof q4?.prompt === "function" ? q4.prompt({ T: "一元积分", K: "回查条件" }) : q4?.prompt).toContain(
      "你确定了真的没有算错，",
    );
    expect(getQuestionOptions(q4!, { T: "一元积分" })[0].text).toBe("关键替换和化简后的积分。");

    expect(q5?.title).toBe("别人和你方法不同");
    expect(typeof q5?.prompt === "function" ? q5.prompt({}) : q5?.prompt).toBe(
      "考试结束后，你发现有人用了和你完全不同的方法，而且同样做对了。你的第一反应是什么？",
    );

    expect(q8?.title).toBe("考试前最后一小时");
  });
});
