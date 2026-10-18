import { vi, describe, it, expect } from "vitest";
import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import MultiStepIndicator from "../MultiStepIndicator";
import { type Step } from "../MultiStep.types";

describe("MultiStepIndicator tests", () => {
  it("onClick works and is called once", () => {
    const exampleSteps: Step[] = [
      {
        status: "fulfilled",
        titleText: "Title",
        subtitleText: "Subtitle"
      },
      {
        status: "active",
        titleText: "Active",
        subtitleText: "Active Subtitle"
      }
    ];

    const stepClickMock = vi.fn();

    const multiStepIndicatorComponent = render(
      <MultiStepIndicator type="success" steps={exampleSteps} onClick={stepClickMock} />
    );

    const step = multiStepIndicatorComponent.getByText("Title");
    act(() => {
      fireEvent.click(step);
    });
    expect(stepClickMock.mock.calls.length).toBe(1);
  });
  it.each(["Enter", " "])("activates a step once with %s and preserves list semantics", key => {
    const onClick = vi.fn();
    const { getAllByRole } = render(
      <MultiStepIndicator
        steps={[
          { status: "active", titleText: "Details", subtitleText: "" },
          { status: "pending", titleText: "Review", subtitleText: "" }
        ]}
        onClick={onClick}
      />
    );
    const button = getAllByRole("button")[0];
    expect(button.closest("li")?.getAttribute("role")).toBe("listitem");
    fireEvent.keyDown(button, { key });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
