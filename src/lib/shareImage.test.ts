import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toPng } from "html-to-image";

import { saveElementAsPng } from "./shareImage";

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,abc"),
}));

describe("saveElementAsPng", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(toPng).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the requested element and starts a png download", async () => {
    const target = document.createElement("section");
    target.id = "compact-certificate";
    document.body.appendChild(target);

    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);

      if (tagName === "a") {
        element.click = click;
      }

      return element;
    });

    await saveElementAsPng("compact-certificate", "certificate.png");

    expect(toPng).toHaveBeenCalledWith(
      target,
      expect.objectContaining({
        cacheBust: true,
        pixelRatio: 2,
      }),
    );
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("rejects when the export element is missing", async () => {
    await expect(saveElementAsPng("missing-node", "missing.png")).rejects.toThrow("missing-node");
    expect(toPng).not.toHaveBeenCalled();
  });
});
