# NAMO APS — Design Guide for Coherent Web App Development

> Extracted from [namoaps.com](https://www.namoaps.com/) — February 2026
> Use this guide to ensure any new web application is visually consistent with the main NAMO APS website.

---

## 1. Brand Overview

**NAMO APS** is a nonprofit social association focused on removing social barriers through education, inclusion, and solidarity. The visual identity reflects:

- **Institutional and trustworthy** — clean layouts, legible typography, professional tone
- **Warm and human** — photography-driven sections, accessible design
- **Minimal and focused** — content takes priority over decoration

---

## 2. Color Palette

### 2.1 Neutrals (Primary UI Colors)

| Role              | Name          | Hex       | Usage                              |
|-------------------|---------------|-----------|------------------------------------|
| Background        | White         | `#ffffff` | Page backgrounds, card backgrounds |
| Body text         | Near-black    | `#000000` | Body copy, headings                |
| UI Dark           | Charcoal      | `#32373c` | Buttons, footer, dark UI elements  |
| Border / Muted    | Cyan-gray     | `#abb8c3` | Borders, muted text, dividers      |

### 2.2 Brand Accent Colors

These are defined as part of the WordPress preset palette and used sparingly as accents, highlights, and calls-to-action.

| Name                | Hex       | Usage suggestion                          |
|---------------------|-----------|-------------------------------------------|
| Vivid Cyan Blue     | `#0693e3` | Primary links, info highlights, badges    |
| Vivid Purple        | `#9b51e0` | Secondary accent, tags, decorative        |
| Luminous Orange     | `#ff6900` | Warm CTA, warnings, highlights            |
| Vivid Red           | `#cf2e2e` | Alerts, error states, important notices   |
| Vivid Green Cyan    | `#00d084` | Success states, positive actions          |
| Pale Pink           | `#f78da7` | Soft accent, backgrounds for soft content |

### 2.3 Color Usage Principles

- **Default palette**: White backgrounds with dark text (`#000` / `#32373c`)
- **Accent use**: Use one accent color at a time per section — avoid combining multiple accents
- **Buttons**: Dark charcoal (`#32373c`) with white text is the standard; use accent colors for secondary/CTA buttons sparingly
- **Dark sections** (e.g., footer): Use `#32373c` background with `#ffffff` text

---

## 3. Typography

### 3.1 Font Families

The website relies on **system fonts** (no custom Google Fonts detected). Use the following stack:

```css
font-family: Arial, Helvetica, sans-serif;
```

For a more modern, professional feel while staying coherent, a safe upgrade choice would be:

```css
font-family: 'Inter', Arial, Helvetica, sans-serif;
```

> Note: If introducing a Google Font, keep it geometric/humanist sans-serif to match the institutional aesthetic. Suggested alternatives: **Inter**, **DM Sans**, **Nunito**.

### 3.2 Font Size Scale

| Token   | Size    | Usage                        |
|---------|---------|------------------------------|
| Small   | `13px`  | Captions, metadata, labels   |
| Medium  | `20px`  | Body text, paragraph content |
| Large   | `36px`  | Section headings (H2/H3)     |
| X-Large | `42px`  | Hero / page headings (H1)    |

### 3.3 Font Weight

- **Body**: Regular (400)
- **Headings**: Bold (700)
- **Navigation links**: Medium-to-bold, uppercase, short labels

### 3.4 Text Style Notes

- Navigation items are in **ALL CAPS**: `HOME`, `ATTIVITÀ`, `CONTATTI`, `PARTECIPA`
- Body text is sentence case
- Headings are mixed case
- Line-height: default browser/system (approx. 1.5 for body)

---

## 4. Spacing System

Based on rem tokens used across the site:

| Token | Value    | Approx px |
|-------|----------|-----------|
| 20    | `0.44rem` | ~7px      |
| 30    | `0.67rem` | ~11px     |
| 40    | `1rem`    | ~16px     |
| 50    | `1.5rem`  | ~24px     |
| 60    | `2.25rem` | ~36px     |
| 70    | `3.38rem` | ~54px     |
| 80    | `5.06rem` | ~81px     |

**Grid/Flex gaps:**
- Component-level gaps: `0.5em`
- Column gaps: `2em`
- Post/card template gaps: `1.25em`

---

## 5. Components

### 5.1 Buttons

```css
/* Primary Button */
background-color: #32373c;
color: #ffffff;
border-radius: 9999px;        /* fully rounded / pill shape */
font-size: 1.125em;
padding: calc(0.667em + 2px) calc(1.333em + 2px);
text-decoration: none;
display: inline-block;
border: none;
cursor: pointer;
```

**Variants:**
- **Primary**: `#32373c` bg / `#fff` text (default dark)
- **Accent CTA**: Use `#0693e3` (cyan) or `#ff6900` (orange) for highlighted actions
- **Outline**: White bg / `#32373c` border and text — for secondary actions on dark sections

### 5.2 Cards

- Background: `#ffffff`
- Shadow: `6px 6px 9px rgba(0, 0, 0, 0.2)` (natural) or `12px 12px 50px rgba(0, 0, 0, 0.4)` (deep)
- Border radius: Consistent with button radius — `8px` to `12px` recommended
- Padding: `1.5rem` (token 50)

**Shadow Presets:**

| Name     | Value                                    |
|----------|------------------------------------------|
| Natural  | `6px 6px 9px rgba(0, 0, 0, 0.2)`        |
| Deep     | `12px 12px 50px rgba(0, 0, 0, 0.4)`     |
| Sharp    | `6px 6px 0px rgba(0, 0, 0, 0.2)`        |
| Crisp    | `6px 6px 0px rgb(0, 0, 0)`              |

### 5.3 Navigation

- **Style**: Horizontal bar, white/light background
- **Links**: ALL CAPS, dark text, minimal hover decoration
- **Mobile**: Collapsible hamburger menu
- **Logo**: Image-based (PNG), placed top-left

### 5.4 Hero Sections

- **Background**: Full-width photography with optional overlay
- **Text**: Light/white text on dark photo overlays
- **Layout**: Centered or left-aligned heading + subtext + optional CTA button

### 5.5 Footer

- **Background**: Dark charcoal `#32373c`
- **Text**: White `#ffffff`
- **Layout**: Multi-column
- **Content**: Navigation links, contact info, social icons, tax/legal info

---

## 6. Iconography

- **Icon library**: Font Awesome (SVG variant)
- **Social icons used**: Instagram, Facebook, LinkedIn
- **Inline icon sizing**: `height: 1em; width: 1em; vertical-align: -0.125em`

---

## 7. Imagery

- **Style**: Real photography of people in social/educational/community contexts
- **Aspect ratios used**: 1:1, 16:9, 3:2, 2:3
- **Treatment**: Natural, warm photography — no heavy filters
- **Loading**: Lazy loading enabled (`loading="lazy"`)

---

## 8. Layout & Grid

- **Max content width**: Standard WordPress container (approx. `1200px`)
- **Layout system**: CSS Flexbox and Grid (`is-layout-flex`, `is-layout-grid`)
- **Responsive breakpoints**: Mobile → Tablet → Desktop (WordPress standard)
- **Column layouts**: Multi-column grids with `2em` gap

---

## 9. Aspect Ratios

| Name       | Ratio |
|------------|-------|
| Square     | 1:1   |
| Widescreen | 16:9  |
| Standard   | 3:2   |
| Portrait   | 2:3   |

---

## 10. Tone & Language Notes

- The website is in **Italian**
- Tone: Warm, institutional, inclusive, action-oriented
- Key phrases: "solidarietà", "barriere sociali", "inclusione", "energia"
- Copy style: Short headings, descriptive body paragraphs, motivational CTAs

---

## 11. Design Do's and Don'ts

### Do:
- Use white backgrounds as default
- Use the dark charcoal (`#32373c`) for primary interactive elements
- Use photography to humanize sections
- Keep navigation labels in ALL CAPS
- Use pill-shaped (`border-radius: 9999px`) buttons
- Use Font Awesome for icons
- Keep spacing generous and clean

### Don't:
- Use busy or complex backgrounds without content justification
- Mix more than one accent color per section
- Use serif fonts — the brand is sans-serif throughout
- Use sharp rectangular buttons — the brand uses rounded/pill buttons
- Overcrowd layouts — the site is clean and minimal

---

## 12. Quick Reference CSS Variables

```css
:root {
  /* Neutrals */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-charcoal: #32373c;
  --color-muted: #abb8c3;

  /* Accents */
  --color-cyan: #0693e3;
  --color-purple: #9b51e0;
  --color-orange: #ff6900;
  --color-red: #cf2e2e;
  --color-green: #00d084;
  --color-pink: #f78da7;

  /* Typography */
  --font-family: Arial, Helvetica, sans-serif;
  --font-size-sm: 13px;
  --font-size-md: 20px;
  --font-size-lg: 36px;
  --font-size-xl: 42px;

  /* Spacing */
  --space-20: 0.44rem;
  --space-30: 0.67rem;
  --space-40: 1rem;
  --space-50: 1.5rem;
  --space-60: 2.25rem;
  --space-70: 3.38rem;
  --space-80: 5.06rem;

  /* Shadows */
  --shadow-natural: 6px 6px 9px rgba(0, 0, 0, 0.2);
  --shadow-deep: 12px 12px 50px rgba(0, 0, 0, 0.4);
  --shadow-sharp: 6px 6px 0px rgba(0, 0, 0, 0.2);
  --shadow-crisp: 6px 6px 0px rgb(0, 0, 0);

  /* Borders */
  --radius-button: 9999px;
  --radius-card: 8px;
}
```

---

*Last updated: February 2026 — Based on live inspection of namoaps.com*
