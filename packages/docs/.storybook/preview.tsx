import React from "react";
import { themes } from "@storybook/theming";
import { Preview } from "@storybook/react";
import isChromatic from "chromatic/isChromatic";
import { DocsContainer, DocsPage, Unstyled } from "@storybook/blocks";
import { withThemeByClassName } from "@storybook/addon-themes";
import {
  AlphaWarning,
  DeprecatedWarning,
  ComponentName,
  ComponentRules,
  Frame,
  FunctionArgument,
  FunctionArguments,
  Link,
  Paragraph,
  SectionName,
  Tip,
  Title,
  UnstyledList,
  UnstyledListItem,
  UsageGuidelines,
  withMemoryStats,
  RelatedComponent,
  StorybookLink
} from "vibe-storybook-components";

import CanvasWrapper from "../src/layout/canvas-wrapper/CanvasWrapper";
import withGlobalStyle from "../src/decorators/withGlobalStyle/withGlobalStyle";
import { PropsTable } from "../src/layout/props-table/props-table";
import { RelatedComponentsDecorator } from "../src/layout/related-components/related-components-decorator";
import "@vibe/style/dist/index.min.css";
import "vibe-storybook-components/dist/index.css";
import { generateAutocompletion } from "storybook-addon-playground";
import {
  playgroundVibeComponents,
  playgroundReactCommonHooks,
  introCode
} from "../src/pages/playground/playground-helpers";
import reactDocgenOutput from "../src/pages/playground/react-docgen-output.json";
import withLiveEdit from "../src/decorators/withLiveEdit/withLiveEdit";
import withPerformanceProfiler from "../src/decorators/withPerformanceProfiler/withPerformanceProfiler";
import modes from "./modes";
import PrismDocumentation from "../src/prism/PrismDocumentation";
import { paintToConsole } from "./art";

const fontLoader = async () => ({
  fonts: await document.fonts.ready // Fixing Chromatic tests flakiness - taking snapshots after fonts are loaded
});

const preview: Preview = {
  parameters: {
    chromatic: {
      modes
    },
    controls: {
      sort: "alpha",
      expanded: true
    },
    docs: {
      liveEdit: {
        isEnabled: true
      },
      canvas: {
        layout: "fullscreen"
      },
      container: ({ children, context }: { children: any; context: any }) => {
        return (
          <PrismDocumentation>
            {mode => (
              <DocsContainer context={context} theme={mode === "dark" ? themes.dark : themes.light}>
                <Unstyled>{children}</Unstyled>
              </DocsContainer>
            )}
          </PrismDocumentation>
        );
      },
      page: DocsPage,
      components: {
        Canvas: CanvasWrapper,
        Controls: PropsTable,
        PropsTable,
        h1: ComponentName,
        ComponentName,
        h2: SectionName,
        h3: Title,
        p: Paragraph,
        AlphaWarning,
        DeprecatedWarning,
        SectionName,
        Link,
        ComponentRules,
        UsageGuidelines,
        FunctionArguments,
        FunctionArgument,
        RelatedComponent,
        RelatedComponents: RelatedComponentsDecorator,
        Frame,
        StorybookLink,
        Tip,
        UnstyledList,
        UnstyledListItem
      }
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Prism",
          "Welcome",
          "Getting Started",
          "Catalog",
          "MCP",
          "Playground",
          "Changelog",
          "Migration Guide",
          "Contributing",
          "Foundations",
          "Components",
          "Layout",
          "Text",
          "Theming",
          "Technical Patterns",
          "Accessibility",
          "Hooks"
        ]
      }
    },
    playground: {
      storyId: "playground",
      components: {
        ...playgroundVibeComponents,
        ...playgroundReactCommonHooks
      },
      introCode,
      autocompletions: generateAutocompletion(reactDocgenOutput)
    }
  },
  decorators: [
    withLiveEdit,
    withGlobalStyle,
    withMemoryStats,
    withPerformanceProfiler,
    // Should always be the last decorator (stories hooks issues otherwise) - bug in the addon
    withThemeByClassName({
      themes: {
        Light: "light-app-theme",
        Dark: "dark-app-theme",
        Black: "black-app-theme"
      },
      defaultTheme: "Light"
    })
  ],
  globalTypes: {
    memoryStats: {
      name: "Memory Stats",
      description: "Add Memory Stat tracker",
      defaultValue: "no",
      toolbar: {
        icon: "memory",
        items: [
          { value: "no", right: "🚫", title: "Hide Memory Stat" },
          { value: "yes", right: "✅", title: "Show Memory Stat" }
        ]
      }
    }
  },

  loaders: isChromatic() && document.fonts ? [fontLoader] : []
};

paintToConsole();

export default preview;
