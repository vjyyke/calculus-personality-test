import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";

type ShareActionsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ShareActions({ result, scored }: ShareActionsProps) {
  const resultText = `${result.typeName}｜${result.shortName} ${scored.chineseCode} / ${scored.code}`;

  return (
    <div className="shareActions">
      <button type="button" className="primaryButton">
        保存精简证书卡
      </button>
      <button type="button" className="ghostButton">
        保存完整报告图
      </button>
      <button type="button" className="ghostButton" onClick={() => navigator.clipboard?.writeText(resultText)}>
        复制结果文字
      </button>
    </div>
  );
}
