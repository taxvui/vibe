import React, { useRef, useState } from "react";
import {
  Button,
  Checkbox,
  TextField,
  Toggle,
  TabsContext,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  GlassSurface,
  PrismTheme,
  Modal,
  ModalHeader,
  ModalContent,
  type GlassMaterial
} from "@vibe/core";
import "./prism-showcase.scss";

const materials: GlassMaterial[] = ["clear", "subtle", "frosted", "liquid", "refractive"];
const sections = [
  "Overview",
  "Materials",
  "Components",
  "Navigation",
  "Data display",
  "Tokens",
  "Typography",
  "Geometry",
  "Installation"
];
const rows = [
  { name: "Button", category: "Foundation", status: "Stable" },
  { name: "TextField", category: "Forms", status: "Stable" },
  { name: "TabsContext", category: "Navigation", status: "Stable" },
  { name: "GlassSurface", category: "Material", status: "New" }
];
const accents = {
  fern: { light: ["#285e50", "#1c493e", "#ffffff", "#dcebe2"], dark: ["#a6dac1", "#c3e8d5", "#142d23", "#364f41"] },
  iris: { light: ["#58499a", "#443778", "#ffffff", "#ebe6fa"], dark: ["#cec2ff", "#e1d9ff", "#2a204d", "#433861"] },
  ocean: { light: ["#285f84", "#1c4765", "#ffffff", "#e0edf6"], dark: ["#acd4ef", "#d1e9fa", "#182f40", "#30495b"] }
};

type TokenStyle = React.CSSProperties & Record<`--${string}`, string>;
export interface PrismShowcaseProps {
  initialMode?: "light" | "dark";
}

export default function PrismShowcase({ initialMode = "light" }: PrismShowcaseProps) {
  const [mode, setMode] = useState(initialMode);
  const [material, setMaterial] = useState<GlassMaterial>("subtle");
  const [brand, setBrand] = useState<keyof typeof accents>("fern");
  const [opaque, setOpaque] = useState(false);
  const [name, setName] = useState("");
  const [updates, setUpdates] = useState(true);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const colors = accents[brand][mode];
  const style: TokenStyle = {
    "--prism-primary": colors[0],
    "--prism-primary-hover": colors[1],
    "--prism-primary-foreground": colors[2],
    "--prism-accent": colors[3]
  };
  const code = `import React, { type CSSProperties } from "react";
import { Button, GlassSurface, PrismTheme } from "@vibe/core";
import "@vibe/core/tokens";

<PrismTheme mode="${mode}" transparency="${opaque ? "reduced" : "full"}" style={{
  "--prism-primary": "${colors[0]}",
  "--prism-primary-hover": "${colors[1]}",
  "--prism-primary-foreground": "${colors[2]}",
  "--prism-accent": "${colors[3]}"
} as CSSProperties}>
  <GlassSurface material="${material}" style={{ padding: "var(--prism-space-6)" }}>
    <h2>A little more clarity.</h2>
    <Button kind="primary">Create something</Button>
  </GlassSurface>
</PrismTheme>`;
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Code copied.");
    } catch {
      if (codeRef.current) {
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setCopyStatus("Clipboard unavailable. Code selected; use your browser’s copy command.");
    }
  }
  return (
    <PrismTheme
      ref={themeRef}
      mode={mode}
      transparency={opaque ? "reduced" : "full"}
      style={style}
      className="prism-showcase"
      onKeyDown={event => {
        if (event.key === "Escape" && menuOpen) {
          event.preventDefault();
          setMenuOpen(false);
          menuRef.current?.focus();
        }
      }}
    >
      <a className="prism-skip" href="#prism-main">
        Skip to content
      </a>
      <header className="prism-header">
        <a href="#overview" className="prism-wordmark">
          <span aria-hidden="true" className="prism-mark" />
          vibe <span>prism</span>
        </a>
        <span className="prism-header-note">An independent material study · 01</span>
        <button
          type="button"
          ref={menuRef}
          className="prism-mobile-menu"
          aria-expanded={menuOpen}
          aria-controls="prism-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Explore <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
        <Button
          kind="secondary"
          size="small"
          className="prism-theme-toggle"
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
        >
          <svg
            className="prism-theme-icon"
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mode === "light" ? (
              <path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
              </>
            )}
          </svg>
          <span className="prism-mode-label">{mode === "light" ? "Dark mode" : "Light mode"}</span>
        </Button>
      </header>
      <div className="prism-shell">
        <aside id="prism-navigation" className={menuOpen ? "prism-sidebar is-open" : "prism-sidebar"}>
          <p className="prism-eyebrow">The system</p>
          <nav aria-label="Prism documentation">
            {sections.map(section => (
              <a key={section} href={`#${section.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMenuOpen(false)}>
                {section}
              </a>
            ))}
          </nav>
          <div className="prism-sidebar-foot">
            Built on Vibe.
            <br />
            Designed for your source.
          </div>
        </aside>
        <main id="prism-main" className="prism-main" tabIndex={-1}>
          <section id="overview" className="prism-hero">
            <p className="prism-eyebrow">Clarity, with a new dimension</p>
            <h1>
              Less surface.
              <br />
              <span>More possibility.</span>
            </h1>
            <p className="prism-lede">
              An expressive material layer for real interfaces. Quiet color, tactile depth, and components you can make
              your own.
            </p>
            <div className="prism-row prism-hero-links">
              <a className="prism-link" href="#components">
                Explore the components <span aria-hidden="true">↗</span>
              </a>
              <span className="prism-caption">React · TypeScript · MIT</span>
            </div>
            <div className="prism-stage">
              <div aria-hidden="true" className="prism-orbit" />
              <GlassSurface material={material} className="prism-feature-card">
                <div className="prism-row prism-between">
                  <span className="prism-eyebrow">Your next workspace</span>
                  <span aria-hidden="true">◈</span>
                </div>
                <h2>A little more clarity.</h2>
                <p>Give your ideas room to breathe.</p>
                <div className="prism-row">
                  <Button onClick={() => document.getElementById("components")?.scrollIntoView({ behavior: "auto" })}>
                    Create something
                  </Button>
                  <span className="prism-caption">{material} material</span>
                </div>
              </GlassSurface>
              <span className="prism-stage-label">LIVE MATERIAL / {mode.toUpperCase()}</span>
            </div>
          </section>
          <section aria-label="Preview settings" className="prism-controls">
            <label>
              Material
              <select value={material} onChange={e => setMaterial(e.target.value as GlassMaterial)}>
                {materials.map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Brand accent
              <select value={brand} onChange={e => setBrand(e.target.value as keyof typeof accents)}>
                <option value="fern">Fern</option>
                <option value="iris">Iris</option>
                <option value="ocean">Ocean</option>
              </select>
            </label>
            <div className="prism-opaque-control">
              <Checkbox label="Opaque surfaces" checked={opaque} onChange={e => setOpaque(e.target.checked)} />
            </div>
          </section>
          <section id="materials" className="prism-section">
            <div className="prism-section-title">
              <p className="prism-eyebrow">01 / The material</p>
              <h2>Glass, with purpose.</h2>
              <p>Choose the quietest material that gives the content enough separation.</p>
            </div>
            <div className="prism-material-grid">
              {materials.map((m, i) => (
                <div className="prism-material-backdrop" key={m}>
                  <GlassSurface material={m} className="prism-material-sample">
                    <span className="prism-caption">0{i + 1}</span>
                    <h3>{m}</h3>
                    <p>
                      {m === "refractive"
                        ? "Liquid fallback. Optical distortion is deferred."
                        : [
                            "A light edge. Use over calm backgrounds.",
                            "The everyday default. Soft and restrained.",
                            "More diffusion for busy backdrops.",
                            "Layered highlights and considered depth."
                          ][i]}
                    </p>
                  </GlassSurface>
                </div>
              ))}
            </div>
            <div className="prism-code-header">
              <h3>Use the actual API</h3>
              <Button kind="tertiary" size="small" onClick={copyCode}>
                Copy code
              </Button>
            </div>
            <pre className="prism-code" role="region" aria-label="Component usage code" tabIndex={0}>
              <code ref={codeRef}>{code}</code>
            </pre>
            <p role="status" className="prism-caption">
              {copyStatus}
            </p>
          </section>
          <section id="components" className="prism-section">
            <div className="prism-section-title">
              <p className="prism-eyebrow">02 / Core components</p>
              <h2>Familiar by design.</h2>
              <p>Existing Vibe APIs. Shared semantic tokens. No second primitive library.</p>
            </div>
            <div className="prism-two-column">
              <GlassSurface material={material} className="prism-panel">
                <h3>Actions</h3>
                <div className="prism-row">
                  <Button>Continue</Button>
                  <Button kind="secondary">Secondary</Button>
                  <Button kind="tertiary">Quiet</Button>
                </div>
                <div className="prism-row">
                  <Button size="small">Small</Button>
                  <Button disabled>Unavailable</Button>
                  <Button loading>Saving</Button>
                </div>
                <p className="prism-caption">
                  Tab through the controls to inspect focus. Loading and disabled states use the original Button
                  behavior.
                </p>
              </GlassSurface>
              <GlassSurface material="frosted" className="prism-panel">
                <h3>Workspace settings</h3>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (name.trim()) setSaved(true);
                  }}
                >
                  <TextField
                    id="prism-workspace"
                    inputAriaLabel="Workspace name"
                    title="Workspace name"
                    value={name}
                    onChange={value => {
                      setName(value);
                      setSaved(false);
                    }}
                    placeholder="e.g. Studio North"
                  />
                  <div className="prism-row">
                    <Toggle isSelected={updates} onChange={setUpdates} aria-label="Product updates" />
                    <span>Product updates</span>
                  </div>
                  <Button type="submit" disabled={!name.trim()}>
                    Save workspace
                  </Button>
                  <p role="status">
                    {saved
                      ? `${name.trim()} saved${updates ? " with updates enabled" : ""}.`
                      : "Enter a name to enable saving."}
                  </p>
                </form>
              </GlassSurface>
            </div>
            <div className="prism-two-column prism-state-grid">
              <TextField
                id="prism-validation"
                inputAriaLabel="Validation example"
                title="Validation example"
                value="invalid-address"
                validation={{ status: "error", text: "Enter a valid email address." }}
              />
              <TextField
                id="prism-readonly"
                inputAriaLabel="Read-only example"
                title="Read-only example"
                value="Managed by your organization"
                readonly
              />
            </div>
          </section>
          <section id="navigation" className="prism-section">
            <p className="prism-eyebrow">03 / Navigation</p>
            <h2>Composition over invention.</h2>
            <GlassSurface material="frosted" className="prism-panel">
              <TabsContext>
                <TabList>
                  <Tab id="prism-tab-principles">Principles</Tab>
                  <Tab id="prism-tab-accessibility">Accessibility</Tab>
                  <Tab id="prism-tab-ownership">Ownership</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel id="prism-panel-principles" aria-labelledby="prism-tab-principles">
                    <h3>Clarity before decoration</h3>
                    <p>Solid surfaces carry dense content. Glass adds context at intentional boundaries.</p>
                  </TabPanel>
                  <TabPanel id="prism-panel-accessibility" aria-labelledby="prism-tab-accessibility">
                    <h3>Everyone at the table</h3>
                    <p>
                      Keyboard navigation stays with Vibe’s existing tab primitives. Use reduced transparency when the
                      backdrop reduces legibility.
                    </p>
                  </TabPanel>
                  <TabPanel id="prism-panel-ownership" aria-labelledby="prism-tab-ownership">
                    <h3>Your source, your decisions</h3>
                    <p>
                      Theme variables are the first customization point. Refactor source when behavior needs to change.
                    </p>
                  </TabPanel>
                </TabPanels>
              </TabsContext>
            </GlassSurface>
          </section>
          <section className="prism-section" aria-label="Overlay example">
            <h2>A focused moment.</h2>
            <p>
              The original Vibe Modal retains its focus lock, Escape handling and scroll management. Its portal stays
              inside the theme boundary.
            </p>
            <div className="prism-row">
              <Button kind="secondary" blurOnMouseUp={false} onClick={() => setDialogOpen(true)}>
                Open dialog
              </Button>
            </div>
            {dialogOpen && themeRef.current && (
              <Modal
                id="prism-dialog"
                show
                container={themeRef.current}
                onClose={() => setDialogOpen(false)}
                closeButtonAriaLabel="Close dialog"
              >
                <ModalHeader title="Your space to create" description="A real Vibe Modal inside the Prism theme." />
                <ModalContent>
                  <p>Glass is a surface. Accessible interaction belongs to the existing modal primitive.</p>
                  <Button onClick={() => setDialogOpen(false)}>Back to exploring</Button>
                </ModalContent>
              </Modal>
            )}
          </section>
          <section id="data-display" className="prism-section">
            <p className="prism-eyebrow">04 / Data display</p>
            <h2>Information comes first.</h2>
            <TextField
              id="prism-inventory"
              inputAriaLabel="Filter component inventory"
              title="Filter component inventory"
              value={query}
              onChange={setQuery}
              placeholder="Search by name or category"
            />
            <div className="prism-table-scroll">
              <table>
                <caption>Components demonstrated in this milestone</caption>
                <thead>
                  <tr>
                    <th scope="col">Component</th>
                    <th scope="col">Category</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .filter(row => `${row.name} ${row.category}`.toLowerCase().includes(query.toLowerCase()))
                    .map(row => (
                      <tr key={row.name}>
                        <th scope="row">{row.name}</th>
                        <td>{row.category}</td>
                        <td>
                          <span className="prism-tag">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!rows.some(row => `${row.name} ${row.category}`.toLowerCase().includes(query.toLowerCase())) && (
                <p role="status">No matching components. Try another name or category.</p>
              )}
            </div>
          </section>
          <section id="tokens" className="prism-section">
            <p className="prism-eyebrow">05 / Foundations</p>
            <h2>One language, many expressions.</h2>
            <div className="prism-token-grid">
              {[
                "background",
                "foreground",
                "surface",
                "primary",
                "secondary",
                "muted",
                "accent",
                "border",
                "success",
                "warning",
                "destructive",
                "info"
              ].map(token => (
                <div key={token}>
                  <div className="prism-swatch" style={{ background: `var(--prism-${token})` }} />
                  <code>{token}</code>
                </div>
              ))}
            </div>
            <p>
              Override <code>--prism-primary</code>, <code>--prism-primary-hover</code>,{" "}
              <code>--prism-primary-foreground</code> and <code>--prism-accent</code> as a coordinated set. Check
              contrast after changing a brand.
            </p>
          </section>
          <section id="typography" className="prism-section">
            <p className="prism-eyebrow">06 / Typography</p>
            <h2>Room to read.</h2>
            <p className="prism-type-display">Thoughtfully simple.</p>
            <h3>System fonts. Deliberate hierarchy.</h3>
            <p>
              Body text uses a generous line height. Small labels carry structure. No additional font download is
              required by Prism.
            </p>
            <code className="prism-caption">const clarity = &quot;the default&quot;;</code>
          </section>
          <section id="geometry" className="prism-section">
            <p className="prism-eyebrow">07 / Geometry</p>
            <h2>A measured rhythm.</h2>
            <div className="prism-row">
              {["sm", "md", "lg"].map(size => (
                <div
                  className="prism-geometry"
                  key={size}
                  style={{ borderRadius: `var(--prism-radius-${size})`, boxShadow: `var(--prism-shadow-${size})` }}
                >
                  {size}
                </div>
              ))}
            </div>
            <p>Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px. Corners and shadows use three semantic levels.</p>
          </section>
          <section id="installation" className="prism-section">
            <p className="prism-eyebrow">08 / Start building</p>
            <h2>Make it yours.</h2>
            <p>
              This fork is source-first and has not been published. The public npm package does not include these
              additions.
            </p>
            <pre className="prism-code" role="region" aria-label="Development setup commands" tabIndex={0}>
              <code>{`git clone https://github.com/taxvui/vibe.git
cd vibe
corepack yarn install --frozen-lockfile
corepack yarn build:package
corepack yarn workspace @vibe/docs storybook`}</code>
            </pre>
            <p>
              Use the workspace source or built local packages. Import tokens once at your application boundary.
              Existing component APIs remain available.
            </p>
          </section>
          <footer className="prism-footer">
            Vibe Prism · Independent fork of monday.com Vibe, under MIT.
            <br />
            Not affiliated with Apple or shadcn/ui.
          </footer>
        </main>
      </div>
    </PrismTheme>
  );
}
