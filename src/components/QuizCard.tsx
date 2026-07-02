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
  onBack,
}: QuizCardProps) {
  return (
    <section className="quizPage">
      <div className="progressRow">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="progressTrack">
          <div
            className="progressFill"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
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
