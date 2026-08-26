# XIV Frame Design Contract

Status: 2026-08-26

This document is the visual contract for XIV Frame. The product is a local-first
FFXIV screenshot compositor: users upload screenshots, arrange them, add text
or transparent assets, remove backgrounds, and export a final PNG. The UI must
feel calm, precise, and trustworthy while keeping the canvas visually primary.

## Design direction

- **Tone:** quiet, technical, direct.
- **Primary task:** make a composition and understand its current state without
  hunting through unrelated controls.
- **Signature:** semantic shadcn surfaces disappear into the canvas; hierarchy
  comes from restrained contrast, consistent borders, and the single primary
  action color rather than decorative gradients or ad-hoc accent colors.
- **Depth strategy:** borders and surface shifts first; only subtle shadows for
  controls that need lift. Do not mix a heavy shadow system with decorative
  glows.
- **Theme:** light is the default because screenshots are edited in normal
  daylight and the canvas should read like a neutral work surface. Dark tokens
  are defined for future theme switching and must remain semantically aligned.

## Source of truth

- CSS tokens and global primitives: `src/app/globals.css`
- shadcn generator configuration: `components.json`
- Generated/reusable primitives: `src/components/ui/`
- Brand mark source: `src/app/icon.svg`; the share image `public/og-image.jpg`
  is generated from it by `scripts/generate-og-image.mjs`.
- Public/content shell: `src/components/layout/ContentPage.tsx`
- Product editor shell: `src/components/ClientApp.tsx`, canvas and sidebar
  components

Do not introduce page-specific palette variables. Every product-chrome color
must resolve to a semantic token (`background`, `foreground`, `card`,
`popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`,
`input`, or `ring`).

Brand surfaces must use the shared `FrameWindowMark`/`icon.svg` asset. Do not
redraw or replace the mark in metadata, social preview images, or page-specific
components; regenerate derived raster assets when the source mark changes.

## Color tokens

The values below match the shadcn neutral preset used by the application.
Declare them only in `globals.css`; components consume the Tailwind semantic
classes.

### Light

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `oklch(1 0 0)` | Page/canvas surface |
| `--foreground` | `oklch(0.145 0 0)` | Primary text and icons |
| `--card` / `--popover` | `oklch(1 0 0)` | Raised panels and menus |
| `--primary` | `oklch(0.205 0 0)` | Main actions and active emphasis |
| `--primary-foreground` | `oklch(0.985 0 0)` | Text on primary |
| `--secondary` / `--muted` / `--accent` | `oklch(0.97 0 0)` | Quiet controls, selected surfaces, helper backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | Supporting text and metadata |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Destructive actions and errors only |
| `--border` / `--input` | `oklch(0.922 0 0)` | Boundaries and form controls |
| `--ring` | `oklch(0.708 0 0)` | Keyboard focus |

### Dark

The `.dark` block uses the matching supplied values in `globals.css`. Do not
create a second dark palette in a component or page.

### Usage rules

- Use `bg-background` for the page, `bg-card` for panels, and `bg-popover` for
  menus and overlays.
- Use `text-foreground` for primary copy, `text-muted-foreground` for
  secondary copy, and `text-primary` for links or active actions.
- Use `bg-primary` only for the main action; use `bg-secondary`, `bg-muted`, or
  `bg-accent` for quiet/selected states.
- Use `border-border` for structure and `border-input` for form controls.
- Use `destructive` only when the user is about to lose data or an operation
  has failed. Never use it as decoration.
- `color-mix()` and opacity modifiers are allowed only when derived from a
  semantic token. Literal UI hex/rgb colors are not allowed.

## Typography

- **Pretendard:** the sole default family for UI labels, controls, navigation,
  headings, metadata, guides, FAQ answers, legal text, error explanations, and
  other long-form reading. It is optimized for consistent scanning and
  readability.
- `font-sans`, `font-display`, `font-heading`, `font-body`, and `font-mono`
  all resolve to Pretendard. The `font-mono` utility is a compact semantic role
  for ratios, counts, indices, and technical metadata, not a second font
  family.
- Headings use `font-display` with a small positive tracking value. Body copy
  uses `font-body`, a comfortable line height, and a maximum reading width of
  roughly 62–68ch.
- Do not add another global font family. User-selected signature fonts remain
  content data, and the legacy Terrarum option is retained only so existing
  saved settings continue to render correctly.

## Shape, spacing, and elevation

- Base radius: `--radius: 0.625rem` (10px).
- Semantic radius steps come from `--radius-sm`, `--radius-md`, `--radius-lg`,
  `--radius-xl`, and the larger shadcn steps in `globals.css`.
- Use `rounded-md` for buttons, inputs, selects, and compact controls;
  `rounded-lg` for panels and popovers; `rounded-xl` for page-level cards;
  `rounded-full` only for pills, circular controls, and slider tracks.
- Use the 4/8/12/16/24/32 spacing rhythm already expressed in Tailwind
  utilities. Prefer `gap` for sibling spacing and avoid arbitrary one-off
  margins.
- Panels use a 1px semantic border. `shadow-subtle` is permitted for a raised
  card or selected control; avoid dramatic shadows and gradients.
- Never use a colored side stripe (`border-left`/`border-right` above 1px) as
  a decorative status indicator.

## Component rules

### Navigation

`SiteHeader` and `SiteFooter` use `bg-primary` with `text-primary-foreground`.
The current route is indicated by a low-opacity foreground surface. The main
editor CTA uses `bg-accent` with `text-accent-foreground`; it must remain
visible in both light and dark themes.

`PageShell` is the only public-page owner of the shared `SiteHeader` and
`SiteFooter`. `SiteHeader` owns the primary product navigation (`blog`, `faq`,
`about`, and `contact`). `SiteFooter` must not repeat those links; it owns only
secondary links such as privacy, terms, and support/donation. Public pages must
not add page-specific header or footer navigation without updating this
contract and the shared shell first.

### Controls

All buttons, inputs, selects, sliders, tabs, drawers, and accordions use the
shared primitives in `src/components/ui/`. Controls must expose default,
hover, active, focus-visible, disabled, and invalid states where applicable.
Do not copy generated shadcn markup into a page and then alter its radius or
colors locally.

### Icons

Use Lucide icons consistently. Icons clarify a control's purpose and should
not be added as decoration when the label is already unambiguous. Keep icon
sizes in the existing `size-*` scale and preserve `aria-hidden` for decorative
icons.

### Editor

The editor keeps the canvas dominant and the inspector predictable:

1. Header: product identity, save/export, and global actions.
2. Canvas toolbar: ratio and zoom controls.
3. Inspector: one active settings tab, then the relevant controls. The top-level
   workflow order is always photos, layout, then signature; export remains a
   global action.
4. Mobile: the same control order is exposed through the bottom navigation and
   drawer sheets; only the container changes, not the visual language.

The editor header variants (`DesktopToolbar` and `MobileLayout`) share the
public shell's header contract: the same semantic primary surface, border,
logo scale, 56px desktop/52px mobile height, spacing rhythm, and focus states.
They may add editor-only controls such as reset and PNG export, but must not
introduce a separate brand header style. The editor is a full-viewport tool, so
the public `SiteFooter` is intentionally omitted to preserve canvas space;
legal and support links remain available in the public shell. The editor logo
must remain an explicit localized link back to the landing page, with a leave
confirmation when the current session contains images.

User settings are state, not design. A visual normalization must not change
localStorage keys, persisted values, migration behavior, canvas coordinates,
or export output semantics.

## Public/content pages

- Use `PageShell` for shared header/footer and `ContentPage` for page title,
  description, and content width.
- `app-backdrop` is the shared neutral texture. Do not create a different page
  background for guides, FAQ, about, contact, terms, or privacy.
- `ContentPanel` is the standard raised reading surface. Keep body copy and
  headings in the shared Pretendard tokens.
- Guides should use the same article header, numbered workflow, related-guide
  cards, and CTA treatment. A new content page must not invent a separate
  card, button, or header style.

## Accessibility and resilience

- Every interactive element must have a visible keyboard focus state derived
  from `ring`.
- Text and controls must remain understandable without color. Destructive,
  selected, and error states need labels or icons in addition to contrast.
- Preserve reduced-motion behavior and do not animate layout dimensions when a
  transform/opacity transition can communicate the state.
- Check narrow mobile widths, long Korean/Japanese strings, zoomed text, and
  empty/error states before release.

## Review checklist

Before merging a visual change:

- [ ] No new literal UI color, bespoke radius, or page-only font was added.
- [ ] The component uses the shared semantic token and reusable primitive.
- [ ] Header, footer, page background, panels, controls, and focus states match
      the other routes.
- [ ] Desktop and mobile preserve the same hierarchy and control semantics.
- [ ] `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `npm.cmd run content:check`,
      and `npm.cmd run build` pass.
