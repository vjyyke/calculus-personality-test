import { describe, expect, it } from "vitest";

import { answerQuestion, getNextQuestionIndex, getPreviousQuestionIndex } from "./quizFlow";

describe("quizFlow", () => {
  it("stores an answer and keeps earlier answers", () => {
    const answers = answerQuestion({ q1: "A" }, "q2", "C");

    expect(answers).toEqual({ q1: "A", q2: "C" });
  });

  it("clears downstream answers when an earlier answer changes", () => {
    const answers = answerQuestion({ q1: "A", q2: "B", q3: "C", q4: "D" }, "q2", "A");

    expect(answers).toEqual({ q1: "A", q2: "A" });
  });

  it("calculates next question index", () => {
    expect(getNextQuestionIndex(0, 8)).toBe(1);
    expect(getNextQuestionIndex(7, 8)).toBe(7);
  });

  it("clamps previous question index at 0", () => {
    expect(getPreviousQuestionIndex(0)).toBe(0);
    expect(getPreviousQuestionIndex(3)).toBe(2);
  });
});
