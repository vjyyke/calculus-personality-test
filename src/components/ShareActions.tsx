import { useState } from "react";

import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";
import { saveElementAsPng } from "../lib/shareImage";

type ShareActionsProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ShareActions({ result, scored }: ShareActionsProps) {
  const [pendingTarget, setPendingTarget] = useState<"compact" | "full" | null>(null);
  const [status, setStatus] = useState("");
  const certificateFilename = `calculus-persona-${scored.code}-certificate.png`;
  const fullReportFilename = `calculus-persona-${scored.code}-full-report.png`;

  const handleSave = async (target: "compact" | "full") => {
    const elementId = target === "compact" ? "compact-certificate" : "full-report";
    const filename = target === "compact" ? certificateFilename : fullReportFilename;

    setPendingTarget(target);
    setStatus("");

    try {
      await saveElementAsPng(elementId, filename);
      setStatus(target === "compact" ? "精简证书已生成" : "完整报告已生成");
    } catch {
      setStatus("保存失败，请稍后重试");
    } finally {
      setPendingTarget(null);
    }
  };

  return (
    <div className="shareActions">
      <button
        type="button"
        className="primaryButton"
        disabled={pendingTarget !== null}
        onClick={() => void handleSave("compact")}
      >
        {pendingTarget === "compact" ? "正在生成..." : "保存精简证书卡"}
      </button>
      <button
        type="button"
        className="ghostButton"
        disabled={pendingTarget !== null}
        onClick={() => void handleSave("full")}
      >
        {pendingTarget === "full" ? "正在生成..." : "保存完整报告图"}
      </button>
      {status ? (
        <p className="shareStatus" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
