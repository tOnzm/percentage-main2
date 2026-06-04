# ReDESIGN.md

## Project

percentage-main2

---

# Goal

Redesign PromptGen into a modern AI Workspace interface inspired by creative tools such as Spline, Figma, and AI generation platforms.

This is a UI-only redesign.

The existing prompt generation logic must remain untouched.

The objective is to significantly improve usability, visual hierarchy, and workspace efficiency while preserving all current functionality.

---

# Scope

Allowed files:

```txt
css/style.css
index.html
components/**/*.html
```

Not allowed:

```txt
js/core.js
js/helpers.js
js/config.js
components/**/*.js
```

No business logic changes.

No data flow changes.

No prompt generation changes.

No ID changes.

---

# Critical Rules

1. Keep every existing HTML id.
2. Keep every existing data attribute.
3. Keep every component JS integration working.
4. Do not rename fields referenced by JavaScript.
5. Do not modify prompt generation logic.
6. Do not introduce frameworks.
7. Do not add dependencies.
8. CSS and HTML only.

---

# New Layout

Replace the current layout with a three-column workspace.

```txt
┌────────────────────────────────────────────────────────────────────────────┐
│ PromptGen Header                                                          │
├──────────────────────┬──────────────────────────┬──────────────────────────┤
│                      │                          │                          │
│ LEFT PANEL           │      OUTPUT CENTER       │ RIGHT PANEL              │
│                      │                          │                          │
│ Product              │ Generated Prompt         │ Background               │
│ Product Display      │                          │ Camera                   │
│ Props                │ Prompt Preview           │ Lighting                 │
│ Scene                │                          │ Render                   │
│ Environment          │ JSON Output              │ Quality                  │
│                      │                          │                          │
├──────────────────────┴──────────────────────────┴──────────────────────────┤
│ Prompt Input Bar + Generate Button                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# Information Architecture

## LEFT PANEL

Contains everything that defines WHAT appears inside the image.

Examples:

```txt
Product
Display Mode
Bottle Type
Cap Type

Props
Flowers
Leaves
Fruit
Fabric
Splash

Scene
Luxury
Minimal
Medical
Nature

Environment
Indoor
Outdoor
Studio
```

---

## CENTER PANEL

Primary workspace.

Contains:

```txt
Generated Prompt

Negative Prompt

JSON Output

Copy Actions

Export Actions
```

This panel is the visual focus of the application.

---

## RIGHT PANEL

Contains everything that defines HOW the image is created.

Examples:

```txt
Background

Background Type
Color
Gradient

Camera

Angle
Lens
Distance

Lighting

Soft Light
Hard Light
Beauty Light
Studio Light

Render

Octane
Redshift
Arnold

Quality

Resolution
Detail
Sharpness
```

---

# Layout Requirements

Desktop:

```css
grid-template-columns:
  320px
  minmax(700px, 1fr)
  320px;
```

Panels must stretch full height.

Viewport height:

```css
height: 100vh;
```

---

# Visual Style

Direction:

Light Minimal

Modern AI Workspace

---

Colors:

```css
--bg: #f5f5f5;
--surface: #ffffff;
--surface-secondary: #fafafa;

--text-primary: #111111;
--text-secondary: #666666;

--border: #e5e5e5;

--accent: #111111;
```

---

Radius:

```css
20px
24px
999px
```

---

Shadows:

```css
0 10px 30px rgba(0,0,0,.04)

0 12px 40px rgba(0,0,0,.06)
```

Use subtle shadows only.

---

# Panel Styling

All sections must use a consistent component style.

Example:

```html
<section class="workspace-section">
  <div class="section-title">Product</div>

  <div class="section-content">...</div>
</section>
```

---

Style:

```css
.workspace-section {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
}
```

---

# Controls

Remove visual dependence on native select elements where possible.

Preferred controls:

```txt
Pills

Segmented Buttons

Toggle Groups

Chips
```

Avoid:

```txt
Large dropdown-heavy UI
```

However:

Do not break existing JS.

If JS depends on select elements, keep the select hidden and use pills as visual controls.

---

# Center Workspace

The center column is the primary focus area.

Style it as a canvas/workspace.

Example:

```css
.output-workspace {
  background: white;

  border: 1px solid var(--border);

  border-radius: 24px;

  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.05);
}
```

---

# Prompt Input Bar

Bottom area should feel similar to modern AI tools.

Layout:

```txt
[ Prompt Input ................................ ]
                                   [ Generate ]
```

Sticky positioning allowed.

---

# Responsive Requirements

Desktop

```txt
LEFT | CENTER | RIGHT
```

---

Tablet (<1200px)

```txt
CENTER | RIGHT
```

Left panel becomes collapsible.

---

Mobile (<768px)

```txt
CENTER ONLY
```

All controls move into drawer panels.

---

# Accessibility

Must preserve:

```txt
aria-label
aria-expanded
aria-controls
```

for all toggles and collapsible sections.

---

# What Should NOT Change

Do not touch:

```txt
Prompt generation logic

Configuration logic

Data structures

Event handlers

State management

Component JS

Core JS

Helpers

Config
```

Only redesign presentation layer.

---

# Success Criteria

The finished UI should feel closer to:

- Spline
- Figma
- Modern AI creative tools

and significantly less like a traditional settings form.

Functionality must remain identical to the current application.
