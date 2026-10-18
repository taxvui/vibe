import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import PrismShowcase from "./PrismShowcase";

const meta: Meta<typeof PrismShowcase> = {
  title: "Prism/Design System",
  component: PrismShowcase,
  parameters: { prismFullscreen: true, layout: "fullscreen", docs: { liveEdit: { isEnabled: false } } }
};
export default meta;
type Story = StoryObj<typeof PrismShowcase>;
export const Light: Story = { args: { initialMode: "light" } };
export const Interactions: Story = {
  args: { initialMode: "light" },
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Material"), "liquid");
    await expect(canvas.getByText("liquid material")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Dark mode" }));
    await expect(canvas.getByRole("button", { name: "Light mode" })).toBeVisible();
    await userEvent.type(canvas.getByRole("textbox", { name: "Workspace name" }), "Studio North");
    await userEvent.click(canvas.getByRole("button", { name: "Save workspace" }));
    await expect(canvas.getByText("Studio North saved with updates enabled.")).toBeVisible();
  }
};
export const Dark: Story = { args: { initialMode: "dark" } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
