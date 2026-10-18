import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { axe } from "jest-axe";
import { GlassSurface, PrismTheme } from "../index";

describe("Prism boundaries", () => {
  it("keeps adjacent themes isolated and updates the controlled mode without touching body", () => {
    const previous = document.body.className;
    const { rerender } = render(
      <>
        <PrismTheme mode="light" data-testid="one" />
        <PrismTheme mode="dark" data-testid="two" />
      </>
    );
    expect(screen.getByTestId("one")).toHaveAttribute("data-vibe-prism", "light");
    expect(screen.getByTestId("two")).toHaveAttribute("data-vibe-prism", "dark");
    rerender(<PrismTheme mode="dark" transparency="reduced" data-testid="one" />);
    expect(screen.getByTestId("one")).toHaveAttribute("data-vibe-prism", "dark");
    expect(screen.getByTestId("one")).toHaveAttribute("data-transparency", "reduced");
    expect(document.body.className).toBe(previous);
  });

  it("preserves native semantics, attributes, event handlers and refs", () => {
    const ref = createRef<HTMLDivElement>();
    const click = vi.fn();
    render(
      <GlassSurface ref={ref} role="region" aria-label="Activity" onClick={click} className="custom" material="liquid">
        Content
      </GlassSurface>
    );
    const surface = screen.getByRole("region", { name: "Activity" });
    surface.click();
    expect(click).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(surface);
    expect(surface).toHaveClass("custom", "vibe-prism-glass");
  });

  it("renders on the server without accessing document or delaying children", () => {
    const html = renderToString(
      <PrismTheme mode="dark">
        <GlassSurface>Server content</GlassSurface>
      </PrismTheme>
    );
    expect(html).toContain('data-vibe-prism="dark"');
    expect(html).toContain("Server content");
  });

  it("adds no accessibility violations to a named region", async () => {
    const { container } = render(
      <PrismTheme>
        <GlassSurface role="region" aria-label="Project">
          <h2>Project</h2>
          <button type="button">Open project</button>
        </GlassSurface>
      </PrismTheme>
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
