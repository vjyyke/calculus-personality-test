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
  it("uses an atmospheric home illustration instead of the full character sheet", () => {
    render(<App />);

    expect(screen.getByText("∫")).toBeInTheDocument();
    expect(screen.queryByAltText("")).not.toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "保存精简证书卡" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存完整报告图" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "复制结果文字" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(4);
    expect(screen.getByText("信息入口解读")).toBeInTheDocument();
    expect(screen.getByText("决策依据解读")).toBeInTheDocument();
    expect(screen.getByText("处理方式解读")).toBeInTheDocument();
    expect(screen.getByText("行动偏好解读")).toBeInTheDocument();
  });

  it("lays out the certificate as a portrait poster with the character above the text", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    const certificate = document.getElementById("compact-certificate");
    const imagePanel = document.querySelector(".posterImagePanel");
    const content = document.querySelector(".certificateContent");

    expect(certificate).toHaveClass("certificatePortrait");
    expect(imagePanel).not.toBeNull();
    expect(content).not.toBeNull();
    expect(imagePanel?.nextElementSibling).toBe(content);
  });

  it("saves the compact certificate and full report without including controls in the report target", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    const fullReport = document.getElementById("full-report");
    expect(fullReport).not.toBeNull();
    expect(fullReport).not.toContainElement(screen.getByRole("button", { name: "保存完整报告图" }));
    expect(fullReport).not.toContainElement(screen.getByRole("button", { name: "重新测试" }));

    await user.click(screen.getByRole("button", { name: "保存精简证书卡" }));
    expect(saveElementAsPng).toHaveBeenCalledWith("compact-certificate", expect.stringContaining("certificate"));

    await user.click(screen.getByRole("button", { name: "保存完整报告图" }));
    expect(saveElementAsPng).toHaveBeenCalledWith("full-report", expect.stringContaining("full-report"));
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
