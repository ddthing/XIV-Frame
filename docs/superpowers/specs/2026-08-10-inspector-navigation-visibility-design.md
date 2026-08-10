# Inspector navigation and visibility design

## Goal

Improve the inspector sidebar after the image-source screenshot review without changing any stored editor values or existing image, signature, and layout behavior.

## Approved direction

### 1. Consolidate navigation

The inspector currently presents the same three concepts twice: a workflow row (`source → overlay → composition`) and a second tab row (`image · signature · layout`). The two controls create duplicate affordances and make the active tab appear to lift out of the layout.

The workflow row becomes the single interactive navigation rail:

```text
01 사진·소스  ─────  02 시그니처·오버레이  ─────  03 레이아웃·구성
━━━━━━━━━━
```

- Keep one fixed-height horizontal navigation area.
- Make each step activate the existing inspector panel.
- Use foreground text and a 2px bottom indicator for the active step.
- Do not use an active card background or an elevation change, so tab changes do not shift surrounding content.
- Keep the row horizontally scrollable on narrow screens and visually consistent across desktop and mobile.
- Preserve the existing tab values and panel state (`image`, `signature`, `layout`).

### 2. Separate thumbnail actions

The selected-image badge and bottom hover actions overlap in narrow image tiles, causing the button label to look clipped.

- Use the selected tile border and a small accent marker as the primary selection state.
- Remove the bottom selection badge from the image surface.
- Keep delete at the top-right and keep movement/change controls in a constrained action row that cannot overlap the selection state.
- Ensure action buttons have shrink-safe icon and label behavior at the existing two-column thumbnail width.
- Preserve all current handlers and store updates for selecting, replacing, reordering, deleting, scaling, locking, and resetting images.

### 3. Improve supporting-copy visibility

Increase the inspector's secondary copy by one restrained step rather than introducing oversized typography:

- Section titles: 13px → 14px.
- Section descriptions: 12px → 13px with a comfortable line-height.
- Primary tab labels: 12px → 13px.
- Micro role labels: 9px → 10px.
- Keep the panel title and main controls at their current scale.

Use the existing Terrarum Sans Bitmap family and color tokens so this remains a hierarchy adjustment, not a new visual language.

## Components in scope

- `src/components/sidebar/SettingsPanel.tsx`: consolidate the workflow row and tab row into one interactive navigation rail.
- `src/components/sidebar/ImageUploader.tsx`: make thumbnail selection and action controls non-overlapping and responsive.
- `src/components/ui/editor.tsx`: adjust shared editor section typography.
- `src/components/ui/SketchbookTabs.tsx` or local navigation styles only if required by the consolidated rail.

## Data and behavior constraints

- Do not change Zustand state shape, persisted keys, default values, or image URLs.
- Do not alter the meaning of any existing action.
- Keep keyboard activation and visible focus states for the interactive navigation and image controls.
- Keep the same navigation available at desktop and mobile breakpoints.

## Verification plan

1. Run TypeScript and targeted ESLint checks for changed components.
2. Run the production build.
3. Visually inspect desktop and narrow/mobile layouts.
4. Verify that switching all three inspector steps updates the same panels as before.
5. Verify that selected thumbnails show no overlap or clipped action labels.
6. Verify that existing image upload, replace, reorder, delete, scale, and reset controls still respond.
7. Review the final diff for unrelated changes before commit and push.
