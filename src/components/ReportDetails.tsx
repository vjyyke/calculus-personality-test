import type { PersonalityResult, ScoreTag } from "../data/testData";
import { dimensionPairs } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";
import { ShareActions } from "./ShareActions";

type ReportDetailsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
  onRestart: () => void;
  onReviewAnswers: () => void;
};

export function ReportDetails({ result, scored, onRestart, onReviewAnswers }: ReportDetailsProps) {
  return (
    <section className="reportSection" id="full-report" aria-labelledby="full-report-title">
      <div className="reportText">
        <h2 id="full-report-title">完整解读</h2>
        <p>{result.description}</p>
      </div>
      <div className="scoreGrid">
        {dimensionPairs.map((pair) => (
          <div className="scorePanel" key={pair.name}>
            <h3>{pair.name}</h3>
            <p>
              {pair.left} {scored.scores[pair.left as ScoreTag]} / {pair.right}{" "}
              {scored.scores[pair.right as ScoreTag]}
            </p>
          </div>
        ))}
      </div>
      <ShareActions result={result} scored={scored} />
      <div className="resultActions">
        <button className="ghostButton" type="button" onClick={onReviewAnswers}>
          返回修改答案
        </button>
        <button className="ghostButton" type="button" onClick={onRestart}>
          重新测试
        </button>
      </div>
    </section>
  );
}
