# XIV Frame design contract

This file is the visual and interaction source of truth for XIV Frame, a
Korean-first FFXIV screenshot framing tool. It describes the editor chrome and
the creation flow; the uploaded screenshots remain the visual focus of the
exported result.

## Product read

XIV Frame should feel like a small, calm studio tool: choose the frame first,
add screenshots, make the composition precise, then finish the signature and
save the PNG. The interface should make the next useful action obvious without
turning a simple composition into a dashboard.

The working dials are:

- `DESIGN_VARIANCE: 5`: quiet editorial structure with small moments of
  asymmetry in the step rail and preview.
- `MOTION_INTENSITY: 2`: motion is reserved for focus, save, loading, and
  drag feedback.
- `VISUAL_DENSITY: 4`: enough information for a serious edit, with secondary
  controls grouped below the primary decision.

## Family foundation

XIV Frame shares a visual family with FF14 Glamour Maker 01, FF14 Glamour
Maker 02, and FF14 Character Card. The common thread is a neutral studio
surface, intentional typography, restrained geometry, and clear task flow —
not identical artwork or copy.

- Editor chrome uses near-white page surfaces, quiet gray grouped controls,
  near-black text, and only the low-contrast boundaries needed to explain
  the workspace.
- `--primary` is the only general-purpose action and focus color. In light mode
  it is dark ink; in dark mode it is the light inverse.
- Photo-derived colors, Y2K texture, display fonts, and expressive card
  treatments belong to the output preview only. They must not leak into the
  header, step rail, inspector, or form controls.
- `Pretendard Variable` is the UI, help, and document font. A user-selected
  display font is scoped to the rendered card/signature only.
- Use the shared small geometry rhythm: 6px controls, 8px compact surfaces,
  12px panels, and full radius only for compact segmented controls.
- Use Lucide icons consistently. Icons support a label; they do not replace a
  label when the action is not universally understood.

Do not reintroduce arbitrary green, yellow, pastel, glow, or named sticky-note
colors into the editor UI. Semantic success, warning, and error colors are
allowed only when they communicate a real state.

## Token contract

- Use the Neutral OKLCH roles from `src/app/globals.css` as the only editor
  palette: `--background`, `--card`, `--muted`, `--foreground`, `--primary`,
  `--border`, and their semantic companions.
- `--primary` is the action, selected state, and focus ring. Do not introduce a
  second product accent to make a control look active.
- `--background` is the workspace canvas, `--card` is a raised panel, and
  `--muted` is a grouped-control surface.
- Keep one radius scale. Prefer `--radius-sm` for controls and media tiles,
  `--radius` for panels, and full rounding only for compact pills or badges.
- Shadows are neutral and soft. Borders should do most of the separation work.
- `font-display` is for clear section titles and editorial headings;
  `font-body` is for labels, help, controls, and articles.

## Creation flow

The primary path is deliberately linear:

1. **레이아웃** — choose horizontal split, vertical split, or grid before
   importing anything. The preview explains this choice when empty.
2. **사진** — add up to four screenshots, reorder them, and adjust each
   image's size and position. Lock the image position when the framing is set.
3. **시그니처** — add optional character/server text, logo, alignment, and
   supporting details after the visual composition is stable.
4. **저장** — review dimensions and format, then export PNG/JPEG or save an editable project.

Recommendation is a shortcut inside the layout decision, not a separate
workflow. When the image count suggests a likely choice, show a quiet
`추천` marker while keeping all layout options visible and selectable. Never
silently change the user's selection when the number of photos changes.

Desktop uses a persistent 64px step rail for global movement between the
three editor steps. The selected step opens the existing detail controls in an
adjacent 304px–352px panel; that panel can collapse so the preview takes the
remaining width. There is no separate right inspector and no repeated primary
workflow tab row. The rail's `안내` item opens the same panel with the guide,
FAQ, service information, legal pages, contact link, and donation link.
Mobile uses bottom navigation and sheets. All surfaces use the same labels,
state, and action names.

## Workspace structure

- The dark header is a compact product frame: mark, product name, language,
  reset, and save. It is not a hero banner; help and service links live in the
  rail's `안내` panel.
- The preview is the largest area and remains visually quiet until the user
  has content. An empty preview gives one primary instruction and two useful
  routes: choose a layout or add photos. It has no duplicate title strip: the
  accessible page heading remains in the document, while the canvas receives
  the available vertical space.
- A compact canvas dock sits directly below the preview. It owns view-only
  actions — fit, zoom, focus view, and optional help — and never repeats ratio,
  export, or editing controls from the detail panel. Fit and zoom controls flow
  together without a boxed sub-toolbar. The dock is a structural part of the
  workspace, not a floating toolbar over the output.
- Focus view hides the rail and detail panel while keeping the global header
  and canvas dock. `Esc` and the dock toggle return the user to the exact
  editing context they left. The single-frame product does not borrow page
  arrows, page counts, or card-view controls from multi-page design tools.
- The left rail establishes location at a glance. Its bottom `안내` item is a
  secondary information route, not another editing step.
- The expanded detail panel is a task surface, not a gallery. The step rail
  identifies the current step; the panel keeps only a quiet collapse control
  and exposes the controls relevant to that step. Do not repeat the primary
  workflow tabs or a large step heading inside it. Use proximity and soft
  surface changes for grouping before reaching for a divider line.
- The help panel is a compact directory for the guide, FAQ, service details,
  legal pages, contact, and donation. It should not repeat the whole editor
  flow when the full guide already explains it.
- Content pages use the same header, typography, border, and neutral surfaces
  as the editor. They should feel like documentation from the same maker.

## Layout and image rules

- Layout thumbnails must show the actual structural difference before a photo
  is present. Do not use decorative color to imply a difference.
- The empty state must not ask the user to upload photos before the frame can
  be understood.
- The editor's base scale covers its assigned frame and may crop the edges.
  Keep per-image scale and position correction next to the selected photo; a
  `전체 맞춤` fits the entire selected photo with centered margins, while
  `프레임 채우기` covers its cell and centers the crop. Both are explicit,
  reversible actions and use the same cell geometry as preview and export.
- Store image order, scale, and position per image. The position lock is an
  editor-wide guard that disables both direct movement and nudge controls.
- Direct manipulation is supplemented by a compact nudge dock. Its controls
  need keyboard focus, a minimum 40px hit area, direction-specific labels, and
  a visible disabled state when locked.
- Preview zoom is view-only and must not affect the exported PNG. At values
  above 100%, the canvas can be inspected by holding Space while dragging or
  by using the middle mouse button. `화면에 맞춤` restores the centered 100%
  view.
- Keep image controls close to the selected image. Do not make users scroll to
  a separate generic transform panel for a simple placement correction.
- If a grid is selected before three images exist, preserve the selection and
  explain the minimum count. Never erase a deliberate layout choice.

## Signature and output rules

- Signature is optional and secondary to the screenshot composition.
- Keep form labels and helper text neutral; the character artwork and selected
  signature font provide the personality in the output.
- User logos remain local, are previewed before export, and have an explicit
  remove/reset action.
- The canvas preview and exported PNG must use the same layer order, ratio,
  background, gap/blend, border, and signature placement.
- Output decoration such as grain or a soft blend is opt-in and affects the
  card only. It must never become an editor background texture.
- Preserve subject readability: decorative effects cannot obscure faces,
  hands, text, or the main silhouette.

## Copy and content voice

- Korean is the default interface language. English and Japanese keep the same
  information order and action meaning; they are not literal, awkwardly
  translated mirrors.
- Prefer short, concrete labels: `레이아웃`, `사진`, `시그니처`, `PNG 저장`.
- Explain what the user can do next, not what the component is called. For
  example, “사진을 넣기 전에 프레임을 정합니다” is useful helper text;
  “레이아웃 설정 영역” is not.
- Avoid generic marketing claims, excessive exclamation marks, filler
  adverbs, and repeated “간단하게/쉽게/완벽하게” phrasing.
- Error messages state the problem and the recovery action in one sentence.

## Accessibility gates

The implementation should satisfy the practical requirements reviewed from
KWCAG 2.1 and 2.2:

- Use landmarks, one clear page heading, logical heading order, and a skip
  link on the editor.
- Every icon-only control has an accessible name. Every form control has a
  visible label or an equivalent programmatic label.
- Focus is always visible, keyboard order follows the visual workflow, and
  dialogs return focus to their trigger after closing.
- Focus view has a keyboard exit through `Esc`, preserves the hidden page
  heading and region label, and returns focus to its toggle after closing.
- Do not communicate selection, error, or status by color alone. Pair color
  with text, an icon, a border, or a state attribute.
- Text and controls must retain sufficient contrast against their actual
  surfaces. Placeholder text is not the only place an instruction may live.
- Interactive targets are at least 40px where space permits, especially on
  mobile. Range controls provide a large hit area around the small track.
- Dragging has a keyboard/touch alternative. Upload errors, loading states,
  disabled export, and destructive reset are announced or otherwise exposed
  in the accessibility tree.
- Respect `prefers-reduced-motion` and never make a state change depend only on
  animation.
- Text must wrap without clipping at narrow widths and at increased browser
  text size. Do not use horizontal scrolling for ordinary form content.

## Responsive behavior

- Desktop keeps the preview beside the 64px numbered rail and its optional
  detail panel. Collapsing the panel returns its width to the preview while
  leaving the active step and reopen control visible in the rail.
- At narrower desktop widths, use the smaller detail width and keep the rail,
  panel, and preview usable. Do not create a second right-side inspector.
- Mobile keeps the header compact, preserves a meaningful preview, and moves
  the step navigation to the bottom where it remains reachable by thumb.
- Mobile keeps the canvas uncluttered rather than adding a second persistent
  toolbar. Fit and zoom remain in the existing `저장` sheet and share the same
  view-only meaning as the desktop canvas dock.
- Bottom sheets must have a clear title, close action, scrollable body, and a
  primary action that stays reachable after content grows.
- Do not duplicate a control with different behavior on desktop and mobile;
  share the same store action and copy.

## Review checklist

- Can a first-time user choose a layout and understand the empty preview in one
  glance?
- Does the next action remain obvious after each step, on desktop and mobile?
- Does collapsing the detail panel leave the active step and reopen control
  visible in the rail while returning usable width to the canvas?
- Does the UI remain neutral when uploaded screenshots are vivid?
- Can every important image adjustment be made without a mouse?
- Are selection, focus, errors, loading, and disabled states visible and
  announced without relying on color alone?
- Does refresh preserve only lightweight settings and avoid persisting large
  image blobs in localStorage?
- Does the preview match the exported PNG at every supported ratio?
- Does changing view zoom, panning, or focus view leave the exported PNG
  unchanged?
- Do Korean, English, and Japanese pages read like one product made by one
  person?
- Are old neon, warm, sticky-note, or unrelated lookbook rules absent from the
  editor and documentation?

## Studio workflow additions

- Three compact presets apply layout, ratio, spacing, and finish together in
  one reversible edit. They preserve photographs and signatures. The original
  layout choices remain visible below them, with a six-option ratio grid.
- The desktop inspector is 304px–352px wide. A small numbered section marker,
  compact layout thumbnails, and a persistent next-step action keep controls
  scannable. The canvas dock also exposes keyboard shortcut help and photo count.
- The empty frame previews the chosen ratio and structure. Its add-photo button
  opens a multi-file picker directly; drop and picker additions form one edit.
- Header actions include undo/redo, project open/save, reset, language, and
  export. Mobile shares history controls and includes project actions in its
  save sheet. All new labels have Korean, English, and Japanese equivalents.
- History retains up to 50 composition snapshots in memory. Consecutive changes
  to the same continuous control within 600ms are grouped. View zoom, loading,
  and locks are excluded. Blob URLs remain alive while any reachable snapshot
  needs them. History and photos are never written to localStorage.
- `.xivframe` files bundle editable settings and embedded raster assets. Import
  validates shape, values, size, and decodability before one atomic edit. Remote
  asset URLs are rejected. If the composition changes during preparation, the
  import is cancelled rather than replacing newer work.
- Fixed ratios describe the final frame including its border. Export offers
  PNG/JPEG, a 2048px or 4096px long edge, or bounded working dimensions, plus a
  filename. JPEG flattens transparency to white. The displayed pixel dimensions
  match the download; view zoom and pan never affect output.
- Grain is visible in both preview and export. Font changes refresh measured
  text metrics. Export waits for assets, verifies the exact visible stage, and
  cancels if the composition changes during preparation.
- The photo library uses four compact square thumbnails with selected-photo
  actions below them. Precision controls show source dimensions, whole-photo
  fit, centered fill, 90-degree rotation, and horizontal/vertical flips. Rotation
  and flips encode lossless PNG locally, preserve alpha, reset photo framing,
  and remain reversible through history. A pending conversion cannot overwrite
  newer edits. Existing projects remain compatible without a schema change.
- Composition guides use a DOM overlay above the preview, so they never enter
  image exports. `G` toggles thirds; desktop exposes a dock button and mobile
  exposes the same preference in its save sheet. Transparency uses a preview-only
  checkerboard. Layout and preset sample cells retain square corners.
- Only the current responsive editor mounts. Photo reordering reuses decoded
  images; replacement decodes only changed sources. The cache retains at most
  the current composition. Grain is loaded only when enabled, and the desktop
  does not eagerly load the mobile sheet module.
- Export format, resolution, and filename are shared view preferences. Reopening
  the dialog or switching between desktop and mobile preserves them without
  creating an undo step or changing the imported/exported project composition.

