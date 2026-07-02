import { describe, expect, it } from "vitest";

import { getDimensionComparisons } from "./dimensions";
import type { ScoredResult } from "./scoring";

describe("getDimensionComparisons", () => {
  it("converts dimension scores into percentage comparisons and selected-side readings", () => {
    const scored: ScoredResult = {
      code: "L-X-W-F",
      chineseCode: "式-构-统-巧",
      scores: {
        景: 1,
        式: 3,
        判: 0,
        构: 4,
        拆: 1,
        统: 3,
        稳: 1,
        巧: 5,
      },
    };

    const comparisons = getDimensionComparisons(scored);

    expect(comparisons).toHaveLength(4);
    expect(comparisons[0]).toMatchObject({
      name: "信息入口",
      selected: "式",
      leftPercent: 25,
      rightPercent: 75,
    });
    expect(comparisons[1].selected).toBe("构");
    expect(comparisons[1].insight).toBeTruthy();
    expect(comparisons[3].selected).toBe("巧");
    expect(comparisons[3].insight).toBeTruthy();
  });
});
