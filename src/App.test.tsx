import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { saveElementAsPng } from "./lib/shareImage";

vi.mock("./lib/shareImage", () => ({
  saveElementAsPng: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.mocked(saveElementAsPng).mockClear();
});

const clickFirstAnswer = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getAnswerOptions()[0]);
};

const getAnswerOptions = () =>
  screen
    .getAllByRole("button")
    .filter((button) => /^[ABCD]\./.test(button.textContent ?? ""));

describe("App", () => {
  it("centers the mobile-first home content without an extra illustration module", () => {
    render(<App />);

    expect(document.querySelector(".homePage")).toHaveClass("homeCentered");
    expect(document.querySelector(".heroNotebook")).not.toBeInTheDocument();
    expect(screen.queryByText("∫")).not.toBeInTheDocument();
    expect(document.querySelector('img[src*="00_contact_sheet_16_characters"]')).not.toBeInTheDocument();
  });

  it("starts the quiz and reaches a result after 8 answers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));
    expect(screen.getByText("你第一眼最想做哪道题？")).toBeInTheDocument();

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    expect(screen.getByText("人格判定证书")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存结果长图" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存精简证书卡" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存完整报告图" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "复制结果文字" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(4);
    expect(screen.getByText("信息入口解读")).toBeInTheDocument();
    expect(screen.getByText("决策依据解读")).toBeInTheDocument();
    expect(screen.getByText("处理方式解读")).toBeInTheDocument();
    expect(screen.getByText("行动偏好解读")).toBeInTheDocument();
    expect(screen.queryByText(/^信息入口：/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^决策依据：/)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /角色图/ })).toBeInTheDocument();
  });

  it("lays out the certificate as a portrait poster with the character above the text", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    const report = document.getElementById("result-long-report");
    const imagePanel = document.querySelector(".posterImagePanel");
    const content = document.querySelector(".certificateContent");

    expect(report).not.toBeNull();
    expect(imagePanel).not.toBeNull();
    expect(content).not.toBeNull();
    expect(imagePanel?.nextElementSibling).toBe(content);
  });

  it("saves one long report image without including controls in the export target", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    const longReport = document.getElementById("result-long-report");
    expect(longReport).not.toBeNull();
    expect(longReport).toContainElement(screen.getByText("人格判定证书"));
    expect(longReport).toContainElement(screen.getByText("完整解读"));
    expect(longReport).not.toContainElement(screen.getByRole("button", { name: "保存结果长图" }));
    expect(longReport).not.toContainElement(screen.getByRole("button", { name: "重新测试" }));

    await user.click(screen.getByRole("button", { name: "保存结果长图" }));
    expect(saveElementAsPng).toHaveBeenCalledWith("result-long-report", expect.stringContaining("long-report"));
  });

  it("returns from the result to the final question with the answer preserved", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    expect(screen.getByText("人格判定证书")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "返回修改答案" }));

    expect(screen.getByText("你更满意哪种最终解法？")).toBeInTheDocument();
    expect(getAnswerOptions()).toHaveLength(4);
    expect(screen.getByText("A.").closest("button")).toHaveClass("isSelected");
  });

  it("does not show internal score labels during the quiz", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));

    expect(screen.queryByText(/式\+1|景\+1|判\+1|构\+1|拆\+1|统\+1|稳\+1|巧\+1/)).not.toBeInTheDocument();

    for (let i = 0; i < 3; i += 1) {
      await clickFirstAnswer(user);
      expect(screen.queryByText(/式\+1|景\+1|判\+1|构\+1|拆\+1|统\+1|稳\+1|巧\+1/)).not.toBeInTheDocument();
    }
  });
});
