import { useMemo, useState } from "react";

import { Home } from "./components/Home";
import { QuizCard } from "./components/QuizCard";
import { ReportDetails } from "./components/ReportDetails";
import { ResultCertificate } from "./components/ResultCertificate";
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
  const [reviewingAnswers, setReviewingAnswers] = useState(false);

  const currentQuestion = questions[questionIndex];
  const state = useMemo(() => buildStateFromAnswers(answers, questions), [answers]);
  const prompt =
    typeof currentQuestion.prompt === "function" ? currentQuestion.prompt(state) : currentQuestion.prompt;
  const options = getQuestionOptions(currentQuestion, state);
  const complete = !reviewingAnswers && questions.every((question) => answers[question.id]);

  const handleAnswer = (answerId: AnswerOption["id"]) => {
    setAnswers((currentAnswers) => answerQuestion(currentAnswers, currentQuestion.id, answerId));

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((currentIndex) => getNextQuestionIndex(currentIndex, questions.length));
    } else {
      setReviewingAnswers(false);
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
        <div className="resultLongReport" id="result-long-report">
          <ResultCertificate result={result} scored={scored} />
          <ReportDetails result={result} scored={scored} />
        </div>
        <div className="resultControlPanel">
          <div className="resultActions">
            <button
              className="ghostButton"
              type="button"
              onClick={() => {
                setQuestionIndex(questions.length - 1);
                setReviewingAnswers(true);
              }}
            >
              返回修改答案
            </button>
            <button
              className="ghostButton"
              type="button"
              onClick={() => {
                setAnswers({});
                setQuestionIndex(0);
                setReviewingAnswers(false);
                setStarted(false);
              }}
            >
              重新测试
            </button>
          </div>
        </div>
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
