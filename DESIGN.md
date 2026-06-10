# XIV Frame - Design System & Guidelines

## Overview

XIV Frame is a premium, minimalist web-based screenshot layout and editing tool designed specifically for Final Fantasy XIV players. The primary goal is to make the user's screenshots the absolute focal point. 

The aesthetic is clean, functional, and unobtrusive, drawing inspiration from professional design tools like Figma or Lightroom, while incorporating subtle thematic nods to the FFXIV UI through brand-aligned accent colors.

## Colors

### Theme Variables
- **Background Primary**: Light `#f8fafc` / Dark `#1f2228` (Clean workspace background)
- **Panel Background**: Light `#ffffff` / Dark `#2a2d35` (For sidebars and settings panels)
- **Text Primary**: Light `#0f172a` / Dark `#f8fafc` (High readability for settings and labels)
- **Text Secondary**: Light `#64748b` / Dark `#94a3b8` (Muted hints, secondary labels)
- **Border/Divider**: Light `#e2e8f0` / Dark `#334155` (Subtle separation of tool sections)

### Brand & Accent
- **XIV Accent (Orange/Red)**: `#ea580c` (Used for primary buttons, active tabs, and highlights to reflect the game's iconic branding)

## Typography

The typography system is split into two functional categories: **UI Typeface** and **Signature Typefaces**.

### UI Typeface
- **Font**: Pretendard (or standard system sans-serif like Inter/Roboto)
- **Usage**: Used for all editor interfaces, sidebar labels, buttons, and settings.
- **Hierarchy**: 
  - Section Headers: `Weight 600`, `14px`
  - Labels: `Weight 500`, `12px`
  - Hints/Secondary: `Weight 400`, `11px`

### Signature Typefaces
- **Fonts**: Nexon Maplestory, Ridibatang, Mulmaru, Bombaram 3.0, Slow Gothic, Good Neighbor, etc.
- **Usage**: Exclusively available for the user to customize their watermark/signature on the canvas. 

## Layout & Components

The interface follows a classic Editor/Workspace layout.

### 1. Workspace (Canvas)
- The expansive central area where the image preview is rendered.
- **Background**: Neutral checkerboard or contrasting solid color to differentiate from the photo edges.
- **Interaction**: Direct manipulation (Shift+Drag to lock axis, Mouse Wheel to zoom).

### 2. Control Sidebar (Settings Panel)
- Pinned to the side or overlaid cleanly on mobile.
- Features tight, dense, and organized controls to minimize scrolling.
- **Inputs**: Number inputs, range sliders, toggle switches, and distinct active/inactive states for buttons.

### 3. Modals & Sheets
- Used for file uploads, export previews, or advanced settings.

## Elevation & Depth

Shadows and borders are strictly functional, used to separate control panels from the canvas workspace.
- **Panels**: Distinct 1px borders and slight drop-shadows to float above the canvas.
- **Canvas Elements**: The images themselves rely on user-defined settings (borders, gaps, blending) rather than UI-forced drop shadows.

## Do's and Don'ts

- **Do** maximize the canvas size. The user's screenshot is the hero.
- **Don't** use distracting, dramatic gradients or heavy backgrounds in the UI panels.
- **Do** use multiple font weights (400, 500, 600) in the sidebar to establish clear visual hierarchy for dense settings.
- **Don't** use rounded "pill" buttons (9999px) for dense control panels. Stick to subtle `4px` or `6px` border radii (`rounded-sm`, `rounded-md`) to save space and maintain a professional tool aesthetic.
- **Do** group related controls tightly (e.g., Image Scale slider + Number Input + Position Nudge buttons).
