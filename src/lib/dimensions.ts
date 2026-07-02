import { dimensionPairs, type ScoreTag } from "../data/testData";
import type { ScoredResult } from "./scoring";

type DimensionInsight = {
  title: string;
  body: string;
};

export type DimensionComparison = {
  name: string;
  left: ScoreTag;
  right: ScoreTag;
  selected: ScoreTag;
  leftPercent: number;
  rightPercent: number;
  selectedPercent: number;
  insightTitle: string;
  insight: string;
};

const dimensionInsights: Record<ScoreTag, DimensionInsight> = {
  景: {
    title: "你从场景进入问题",
    body:
      "你更容易先看到图像、区域、关系和真实情境。面对抽象题目时，你会把它还原成可感知的局面，再从局面里寻找第一条路。",
  },
  式: {
    title: "你从结构进入问题",
    body:
      "你更习惯先读表达式、定义、符号关系和主导项。题目对你来说像一套可拆读的语言，找到结构之后，你会更快进入稳定推理。",
  },
  判: {
    title: "你相信依据和判准",
    body:
      "你做决定时会先问：这个方法有没有条件、有没有定理支撑、有没有可检查的边界。你的判断力来自可验证的规则，也让结果更稳。",
  },
  构: {
    title: "你相信构造和改写",
    body:
      "你愿意换元、比较、补辅助对象，甚至重写问题本身。你不是只找现成公式的人，更擅长把题目改造成自己能处理的形状。",
  },
  拆: {
    title: "你用拆解控制复杂度",
    body:
      "复杂问题对你来说需要分层、分段、分类处理。你会把混乱压成一个个小块，再逐步收拢，优势是细节不容易漏。",
  },
  统: {
    title: "你用整体视角控制复杂度",
    body:
      "你会寻找统一坐标、共同结构、对称性或一条能贯穿全题的主线。你适合处理看似零散、其实背后有同一个骨架的问题。",
  },
  稳: {
    title: "你偏好稳妥推进",
    body:
      "你愿意用更长但可复核的路线换取确定性。你的节奏可能不浮夸，但在边界、条件和最后检查上，往往能守住质量。",
  },
  巧: {
    title: "你偏好机动突破",
    body:
      "你会主动寻找题眼、捷径和更轻的切入方式。你的优势是反应快、敢调整，但越接近结论，越需要给关键步骤补上复核。",
  },
};

export function getDimensionComparisons(scored: ScoredResult): DimensionComparison[] {
  const selectedTags = scored.chineseCode.split("-") as ScoreTag[];

  return dimensionPairs.map((pair, index) => {
    const leftScore = scored.scores[pair.left];
    const rightScore = scored.scores[pair.right];
    const total = leftScore + rightScore || 1;
    const leftPercent = Math.round((leftScore / total) * 100);
    const rightPercent = 100 - leftPercent;
    const selected = selectedTags[index] ?? pair.left;
    const selectedPercent = selected === pair.left ? leftPercent : rightPercent;
    const insight = dimensionInsights[selected];

    return {
      name: pair.name,
      left: pair.left,
      right: pair.right,
      selected,
      leftPercent,
      rightPercent,
      selectedPercent,
      insightTitle: insight.title,
      insight: insight.body,
    };
  });
}
