import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";

afterEach(() => {
  cleanup();
});

const clickFirstAnswer = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getAnswerOptions()[0]);
};

const getAnswerOptions = () =>
  screen
    .getAllByRole("button")
    .filter((button) => /^[ABCD]\./.test(button.textContent ?? ""));

describe("App", () => {
  it("starts the quiz and reaches a result after 8 answers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "开始测试" }));
    expect(screen.getByText("你第一眼最想做哪道题？")).toBeInTheDocument();

    for (let i = 0; i < 8; i += 1) {
      await clickFirstAnswer(user);
    }

    expect(screen.getByText("人格判定证书")).toBeInTheDocument();
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
