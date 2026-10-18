import ts from "typescript";
import { it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrismShowcase from "../PrismShowcase";

it("updates theme, materials and transparency on the actual preview", () => {
  const { container } = render(<PrismShowcase />);
  userEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(container.querySelector("[data-vibe-prism]")).toHaveAttribute("data-vibe-prism", "dark");
  userEvent.selectOptions(screen.getByLabelText("Material"), "liquid");
  expect(screen.getByText("liquid material").closest("[data-material]")).toHaveAttribute("data-material", "liquid");
  userEvent.click(screen.getByRole("checkbox", { name: "Opaque surfaces" }));
  expect(container.querySelector("[data-vibe-prism]")).toHaveAttribute("data-transparency", "reduced");
});

it("enables saving only after entering a workspace name and filters real rows", async () => {
  render(<PrismShowcase />);
  expect(screen.getByRole("button", { name: "Save workspace" })).toHaveAttribute("aria-disabled", "true");
  userEvent.type(screen.getByRole("textbox", { name: "Workspace name" }), "Studio North");
  userEvent.click(screen.getByRole("button", { name: "Save workspace" }));
  expect(screen.getByText("Studio North saved with updates enabled.")).toBeVisible();
  userEvent.type(screen.getByRole("textbox", { name: "Filter component inventory" }), "nothing");
  expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(0);
  expect(screen.getByText(/No matching components/)).toBeVisible();
});

it("uses the existing modal primitive, supports Escape and restores focus", async () => {
  render(<PrismShowcase />);
  const trigger = screen.getByRole("button", { name: "Open dialog" });
  trigger.focus();
  userEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Your space to create" });
  expect(dialog.closest("[data-vibe-prism]")).not.toBeNull();
  expect(within(dialog).getByRole("button", { name: "Back to exploring" })).toBeVisible();
  fireEvent.keyDown(dialog, { key: "Escape", keyCode: 27 });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
});

it("switches tab panels using Vibe’s keyboard navigation", async () => {
  render(<PrismShowcase />);
  const first = screen.getByRole("tab", { name: "Principles" });
  fireEvent.focus(first);
  fireEvent.keyDown(first, { key: "ArrowRight", keyCode: 39 });
  const next = screen.getByRole("tab", { name: "Accessibility" });
  // Activation on Enter is supported by the existing manual-activation tab API.
  fireEvent.keyDown(next, { key: "Enter", keyCode: 13 });
  await waitFor(() =>
    expect(screen.getByRole("tabpanel", { name: "Accessibility" })).toHaveTextContent("Everyone at the table")
  );
});

it("provides syntactically valid copyable TSX after changing the material settings", () => {
  render(<PrismShowcase />);
  userEvent.selectOptions(screen.getByLabelText("Material"), "liquid");
  userEvent.click(screen.getByRole("checkbox", { name: "Opaque surfaces" }));
  const code = screen.getByRole("region", { name: "Component usage code" }).textContent || "";
  const result = ts.transpileModule(code, {
    fileName: "example.tsx",
    compilerOptions: { jsx: ts.JsxEmit.React },
    reportDiagnostics: true
  });
  expect(code).toContain('transparency="reduced"');
  expect(result.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error)).toEqual([]);
});

it("closes the mobile navigation with Escape and restores focus", () => {
  render(<PrismShowcase />);
  const explore = screen.getByRole("button", { name: "Explore", exact: true });
  userEvent.click(explore);
  expect(explore).toHaveAttribute("aria-expanded", "true");
  fireEvent.keyDown(screen.getByRole("navigation", { name: "Prism documentation" }), { key: "Escape" });
  expect(explore).toHaveAttribute("aria-expanded", "false");
  expect(explore).toHaveFocus();
  userEvent.click(explore);
  userEvent.click(screen.getByRole("link", { name: "Materials", exact: true }));
  expect(explore).toHaveAttribute("aria-expanded", "false");
});
