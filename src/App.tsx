import { useMemo, useState } from "react";

import { Home } from "./components/Home";
import { QuizCard } from "./components/QuizCard";
import { questions, results, type AnswerOption } from "./data/testData";
import {
  answerQuestion,
  getNextQuestionIndex,
  getPreviousQuestionIndex,
  type QuizAnswers,
} from "./lib/quizFlow";
import { buildStateFromAnswers, getQuestionOptions, resolveResult, scoreAnswers } from "./lib/scoring";

export default function App() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);

  const currentQuestion = questions[questionIndex];
  const state = useMemo(() => buildStateFromAnswers(answers, questions), [answers]);
  const prompt =
    typeof currentQuestion.prompt === "function" ? currentQuestion.prompt(state) : currentQuestion.prompt;
  const options = getQuestionOptions(currentQuestion, state);
  const complete = questions.every((question) => answers[question.id]);

  const handleAnswer = (answerId: AnswerOption["id"]) => {
    setAnswers((currentAnswers) => answerQuestion(currentAnswers, currentQuestion.id, answerId));

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((currentIndex) => getNextQuestionIndex(currentIndex, questions.length));
    }
  };

  const handleBack = () => {
    setQuestionIndex((currentIndex) => getPreviousQuestionIndex(currentIndex));
  };

  if (!started) {
    return (
      <main className="appShell">
        <Home onStart={() => setStarted(true)} />
      </main>
    );
  }

  if (complete) {
    const scored = scoreAnswers(answers, questions);
    const result = resolveResult(scored.code, results);

    return (
      <main className="appShell">
        <section className="resultHero">
          <article className="questionCard">
            <p className="questionKicker">人格判定证书</p>
            <h2>
              {result.typeName}｜{result.shortName}
            </h2>
            <p className="resultCode">
              {scored.chineseCode} / {scored.code}
            </p>
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
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    </main>
  );
}
