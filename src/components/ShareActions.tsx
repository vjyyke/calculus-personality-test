import { useState } from "react";

import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";
import { saveElementAsPng } from "../lib/shareImage";

type ShareActionsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ShareActions({ result, scored }: ShareActionsProps) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const filename = `calculus-persona-${scored.code}-long-report.png`;

  const handleSave = async () => {
    setPending(true);
    setStatus("");

    try {
      await saveElementAsPng("result-long-report", filename);
      setStatus(`${result.shortName}长图已生成`);
    } catch {
      setStatus("保存失败，请稍后重试");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="shareActions">
      <button
        type="button"
        className="primaryButton"
        disabled={pending}
        onClick={() => void handleSave()}
      >
        {pending ? "正在生成..." : "保存结果长图"}
      </button>
      {status ? (
        <p className="shareStatus" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
