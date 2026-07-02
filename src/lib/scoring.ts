import {
  dimensionPairs,
  questions as defaultQuestions,
  results as defaultResults,
  scoreLabels,
  tieBreakRules,
  type AnswerOption,
  type PersonalityResult,
  type Question,
  type QuestionId,
  type ScoreTag,
} from "../data/testData";

export type Answers = Partial<Record<QuestionId, AnswerOption["id"]>>;

export type ScoredResult = {
  scores: Record<ScoreTag, number>;
  code: string;
  chineseCode: string;
};

const scoreTags = Object.keys(scoreLabels) as ScoreTag[];

const createEmptyScores = (): Record<ScoreTag, number> =>
  Object.fromEntries(scoreTags.map((tag) => [tag, 0])) as Record<ScoreTag, number>;

export function getQuestionOptions(question: Question, state: Record<string, string>): AnswerOption[] {
  return typeof question.options === "function" ? question.options(state) : question.options;
}

const findSelectedOption = (
  question: Question,
  state: Record<string, string>,
  answerId: AnswerOption["id"],
): AnswerOption => {
  const option = getQuestionOptions(question, state).find((candidate) => candidate.id === answerId);

  if (!option) {
    throw new Error(`Unknown answer option "${answerId}" for question "${question.id}".`);
  }

  return option;
};

export function buildStateFromAnswers(
  answers: Answers,
  questions: Question[] = defaultQuestions,
): Record<string, string> {
  const state: Record<string, string> = {};

  for (const question of questions) {
    const answerId = answers[question.id];

    if (!answerId) {
      continue;
    }

    const option = findSelectedOption(question, state, answerId);

    if (option.set) {
      Object.assign(state, option.set);
    }
  }

  return state;
}

export function scoreAnswers(answers: Answers, questions: Question[] = defaultQuestions): ScoredResult {
  const scores = createEmptyScores();
  const state: Record<string, string> = {};
  const selectedOptions: Partial<Record<QuestionId, AnswerOption>> = {};

  for (const question of questions) {
    const answerId = answers[question.id];

    if (!answerId) {
      continue;
    }

    const option = findSelectedOption(question, state, answerId);
    selectedOptions[question.id] = option;

    for (const score of option.scores) {
      scores[score] += 1;
    }

    if (option.set) {
      Object.assign(state, option.set);
    }
  }

  const chosenTags = dimensionPairs.map(({ left, right }) =>
    chooseDimensionSide(left, right, scores, selectedOptions),
  );

  return {
    scores,
    code: chosenTags.map((tag) => scoreLabels[tag]).join("-"),
    chineseCode: chosenTags.join("-"),
  };
}

export function resolveResult(
  code: string,
  results: Record<string, PersonalityResult> = defaultResults,
): PersonalityResult {
  const result = results[code];

  if (!result) {
    throw new Error(`Unknown result code "${code}".`);
  }

  return result;
}

const chooseDimensionSide = (
  left: ScoreTag,
  right: ScoreTag,
  scores: Record<ScoreTag, number>,
  selectedOptions: Partial<Record<QuestionId, AnswerOption>>,
): ScoreTag => {
  if (scores[left] > scores[right]) {
    return left;
  }

  if (scores[right] > scores[left]) {
    return right;
  }

  const priorityQuestions = tieBreakRules[`${left}/${right}`] ?? [];

  for (const questionId of priorityQuestions) {
    const option = selectedOptions[questionId];

    if (!option) {
      continue;
    }

    const supportsLeft = option.scores.includes(left);
    const supportsRight = option.scores.includes(right);

    if (supportsLeft && !supportsRight) {
      return left;
    }

    if (supportsRight && !supportsLeft) {
      return right;
    }
  }

  return left;
};
