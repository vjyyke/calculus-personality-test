import type { AnswerOption, QuestionId } from "../data/testData";

const questionOrder: QuestionId[] = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

export type QuizAnswers = Partial<Record<QuestionId, AnswerOption["id"]>>;

export function answerQuestion(
  current: QuizAnswers,
  questionId: QuestionId,
  answerId: AnswerOption["id"],
): QuizAnswers {
  if (current[questionId] === answerId) {
    return current;
  }

  const changedIndex = questionOrder.indexOf(questionId);
  const nextAnswers: QuizAnswers = {};

  for (const id of questionOrder.slice(0, changedIndex)) {
    if (current[id]) {
      nextAnswers[id] = current[id];
    }
  }

  nextAnswers[questionId] = answerId;
  return nextAnswers;
}

export function getNextQuestionIndex(currentIndex: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(Math.max(currentIndex + 1, 0), total - 1);
}

export function getPreviousQuestionIndex(currentIndex: number) {
  return Math.max(currentIndex - 1, 0);
}
