# Content pages home-shell design

## Goal

Extend the editor home screen's visual language across the guide, about, contact, privacy, and terms pages without changing their copy, links, localization routing, metadata intent, or editor state.

## Approved direction: editor home-shell extension

All content pages use the same calm utility surface as the editor:

```text
[ XIV Frame ]   편집기   가이드   소개   문의        ko   [편집 시작]

03 / GUIDE
가이드
FFXIV 스크린샷을 더 잘 꾸미는 방법

[대표 콘텐츠]       [최근 콘텐츠] [최근 콘텐츠]
```

### Shared visual language

- Keep the cream paper background, forest-green structure, restrained highlighter yellow, and subtle dot/grid texture from the editor.
- Use the bundled Terrarum Sans Bitmap family through existing typography tokens; remove page-level Bricolage/Inter overrides.
- Use the existing spacing, radius, border, and subtle-shadow tokens instead of page-specific hex and shadow values.
- Keep the header compact and utility-first: logo, primary links, language switcher, and a visible `편집 시작`/equivalent CTA.
- Use section eyebrows such as `03 / GUIDE`, `04 / ABOUT`, and `05 / CONTACT` to connect content pages to the editor's inspector language.
- Limit accent color to primary actions, active states, and one editorial highlight per page.

## Page architecture

### Shared shell

`PageShell`, `SiteHeader`, `SiteFooter`, and `Container` become the only global page frame. The shell owns:

- the responsive header and mobile navigation;
- the cream canvas and scroll behavior;
- the consistent content max-width and vertical rhythm;
- the footer's navigation and legal links.

Page components provide only page-specific content and do not recreate header/footer styling.

### Guide index

- Keep the existing post data and localized metadata.
- Add a compact guide eyebrow and a readable intro block.
- Promote the first available post as a larger featured entry.
- Render remaining posts in a consistent two-column desktop / one-column mobile list.
- Show date, title, description, and a clear read action with keyboard-visible focus and hover motion.

### Guide detail

- Keep the reading column narrow and comfortable.
- Use an editorial header with title, date, and a back-to-guide action.
- Preserve Markdown content and links while aligning prose typography and image treatment with the shell.
- Keep the editor CTA and FAQ as separate, quieter closing sections with clear hierarchy.

### About and contact

- Replace plain document headings with the shared eyebrow + title intro.
- Use a small number of bordered utility panels rather than generic prose cards.
- Keep the existing text and external contact links; make actions visibly actionable and consistent with the editor CTA.

### Privacy and terms

- Preserve all legal text exactly.
- Use a narrower reading column, numbered/anchored section rhythm, clear heading hierarchy, and comfortable paragraph spacing.
- Avoid decorative cards or motion that could reduce legal readability.

## Responsive behavior

- Desktop: compact dark header, centered content rail, generous but controlled whitespace.
- Mobile: same header language with a compact menu, single-column content, full-width actions, and no horizontal overflow.
- Preserve the same type scale, icon treatment, focus rings, and button semantics at both breakpoints.

## Behavior and content constraints

- Do not change translation keys or localized copy unless a rendering bug requires it.
- Do not change blog slugs, post order source, legal content, external URLs, or metadata contracts.
- Preserve all existing navigation destinations and language routing.
- Keep link and button interactions keyboard accessible with visible focus states.

## Verification plan

1. Run TypeScript, changed-file ESLint, and the production build.
2. Render Korean, English, and Japanese versions of the guide index and one representative content page.
3. Check desktop and mobile header navigation, CTA links, footer links, and no horizontal overflow.
4. Check guide index/detail reading hierarchy and Markdown rendering.
5. Check legal pages for unchanged text and readable line length.
6. Review the final diff for copy, route, metadata, and editor-state regressions before commit and push.
