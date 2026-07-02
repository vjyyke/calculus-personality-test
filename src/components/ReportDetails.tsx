import type { PersonalityResult } from "../data/testData";
import { getDimensionComparisons } from "../lib/dimensions";
import type { ScoredResult } from "../lib/scoring";
import { ShareActions } from "./ShareActions";

type ReportDetailsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
  onRestart: () => void;
  onReviewAnswers: () => void;
};

export function ReportDetails({ result, scored, onRestart, onReviewAnswers }: ReportDetailsProps) {
  const comparisons = getDimensionComparisons(scored);

  return (
    <section className="reportSection" aria-labelledby="full-report-title">
      <div className="reportExport" id="full-report">
        <div className="reportText">
          <h2 id="full-report-title">完整解读</h2>
          <p>{result.description}</p>
        </div>
        <div className="dimensionReportGrid">
          {comparisons.map((comparison) => (
            <div className="dimensionReport" key={comparison.name}>
              <div className="dimensionReportHeader">
                <h3>{comparison.name}解读</h3>
                <span>{comparison.selected}</span>
              </div>
              <div
                className="dimensionBar"
                role="progressbar"
                aria-label={`${comparison.name}${comparison.selected}倾向`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={comparison.selectedPercent}
              >
                <span
                  className="dimensionBarLeft"
                  style={{ width: `${comparison.leftPercent}%` }}
                />
                <span
                  className="dimensionBarRight"
                  style={{ width: `${comparison.rightPercent}%` }}
                />
              </div>
              <div className="dimensionBarLabels">
                <span>
                  {comparison.left} {comparison.leftPercent}%
                </span>
                <span>
                  {comparison.right} {comparison.rightPercent}%
                </span>
              </div>
              <h4>{comparison.insightTitle}</h4>
              <p>{comparison.insight}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="resultControlPanel">
        <ShareActions result={result} scored={scored} />
        <div className="resultActions">
          <button className="ghostButton" type="button" onClick={onReviewAnswers}>
            返回修改答案
          </button>
          <button className="ghostButton" type="button" onClick={onRestart}>
            重新测试
          </button>
        </div>
      </div>
    </section>
  );
}
