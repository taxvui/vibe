import React, { useRef, useState, type ReactNode } from "react";
import { PrismTheme } from "@vibe/core";
import "./prism-documentation.scss";

/** Shared by existing MDX pages; component examples retain their original APIs. */
export default function PrismDocumentation({
  children
}: {
  children: ReactNode | ((mode: "light" | "dark") => ReactNode);
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const contentRef = useRef<HTMLElement>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  return (
    <PrismTheme mode={mode} className="prism-documentation">
      <a className="prism-docs-skip" href="#documentation" target="_self">
        Skip to documentation
      </a>
      <header className="prism-docs-header">
        <a className="prism-docs-brand" href="./?path=/docs/welcome--docs" target="_parent">
          vibe <span>prism</span>
        </a>
        <button type="button" onClick={() => setMode(mode === "light" ? "dark" : "light")}>
          {mode === "light" ? "Dark mode" : "Light mode"}
        </button>
        <nav aria-label="Documentation shortcuts">
          <a href="./?path=/docs/getting-started--docs" target="_parent">
            Getting started
          </a>
          <a href="./?path=/story/prism-design-system--light" target="_parent">
            Live showcase ↗
          </a>
          <a href="./?path=/docs/catalog--docs" target="_parent">
            Catalog
          </a>
        </nav>
      </header>
      <details
        className="prism-docs-contents"
        onToggle={event => {
          if (event.currentTarget.open) {
            setHeadings(
              Array.from(contentRef.current?.querySelectorAll("h2") || [])
                .slice(0, 30)
                .map((heading, index) => {
                  if (!heading.id) heading.id = `documentation-section-${index}`;
                  return { id: heading.id, text: heading.textContent || "Section" };
                })
            );
          }
        }}
      >
        <summary>On this page</summary>
        <nav aria-label="On this page">
          <a href="#documentation" target="_self">
            Start of document
          </a>
          {headings.map(heading => (
            <a key={heading.id} href={`#${heading.id}`} target="_self">
              {heading.text}
            </a>
          ))}
        </nav>
      </details>
      <main id="documentation" tabIndex={-1} ref={contentRef}>
        {typeof children === "function" ? children(mode) : children}
      </main>
      <footer className="prism-docs-footer">
        <p>Vibe Prism · An independent, source-first design system.</p>
        <a href="https://github.com/taxvui/vibe" target="_blank" rel="noreferrer">
          Source & contributions ↗
        </a>
        <p>Based on monday.com Vibe, under MIT. Not affiliated with Apple or shadcn/ui.</p>
      </footer>
    </PrismTheme>
  );
}
