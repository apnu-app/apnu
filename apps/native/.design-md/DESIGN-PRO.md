# Design System: Data Analytics App (Airbnb-Inspired)

## 1. Visual Theme & Atmosphere

This data analytics application adapts Airbnb's warm, photography-forward design language into a **dashboard-first, data-dense interface** — where charts, tables, and metrics replace listing photography as the hero content. The same pure white (`#ffffff`) canvas and Rausch Red (`#ff385c`) accent are retained, but the design shifts from leisurely browsing to confident, scannable data visualization.

The interface feels like a **premium reporting tool** — warm and approachable like Airbnb, but structured for analysts. Cereal VF's rounded terminals bring humanity to what could otherwise feel like a cold data environment.

**Key Characteristics:**

- Pure white canvas with Rausch Red (`#ff385c`) as singular brand accent (same as Airbnb)
- Charts, KPI cards, and data tables replace listing photography as hero content
- Same three-layer card shadow system for data cards and panels
- Sidebar navigation replaces horizontal category pill bar
- Airbnb Cereal VF font — same warm, rounded type across all data labels
- Dense but breathable: 8px base grid, tighter row heights than Airbnb's browse layout
- Near-black text (`#222222`) for all data labels — warm, never cold

---

## 2. Color Palette & Roles

> **Color scheme is identical to Airbnb** — only the semantic roles are adapted for data contexts.

### Primary Brand (Unchanged)

| Token                                  | Hex       | Data App Role                                               |
| -------------------------------------- | --------- | ----------------------------------------------------------- |
| `--palette-bg-primary-core`            | `#ff385c` | Primary CTA buttons, active nav item, chart highlight color |
| `--palette-bg-tertiary-core`           | `#e00b41` | Pressed states, negative/alert metrics                      |
| `--palette-text-primary-error`         | `#c13515` | Error states, critical alerts, negative % change            |
| `--palette-text-secondary-error-hover` | `#b32505` | Hover on error states                                       |

### Premium Tiers (Repurposed for Data Tiers)

| Token                       | Hex       | Data App Role                                   |
| --------------------------- | --------- | ----------------------------------------------- |
| `--palette-bg-primary-luxe` | `#460479` | Enterprise tier badge, advanced analytics label |
| `--palette-bg-primary-plus` | `#92174d` | Pro tier badge, upgraded feature tags           |

### Text Scale (Unchanged)

| Token                              | Hex                | Data App Role                                      |
| ---------------------------------- | ------------------ | -------------------------------------------------- |
| `--palette-text-primary`           | `#222222`          | All data values, column headers, chart axis labels |
| `--palette-text-focused`           | `#3f3f3f`          | Focused input fields, active table rows            |
| Secondary                          | `#6a6a6a`          | Metric sub-labels, chart legends, timestamp text   |
| `--palette-text-material-disabled` | `rgba(0,0,0,0.24)` | Empty state text, disabled filters                 |
| `--palette-text-link-disabled`     | `#929292`          | Disabled pagination links                          |

### Interactive & Data Visualization

| Token                  | Hex       | Data App Role                                          |
| ---------------------- | --------- | ------------------------------------------------------ |
| `--palette-text-legal` | `#428bff` | Hyperlinks in tables, info tooltips                    |
| Border Gray            | `#c1c1c1` | Table row dividers, chart grid lines                   |
| Light Surface          | `#f2f2f2` | Table header background, sidebar bg, empty chart areas |

### Chart Color System (New — Built on Existing Palette)

Since Airbnb's palette is minimal, extend it for multi-series charts using opacity variations:

```css
--chart-series-1: #ff385c; /* Rausch Red — primary series */
--chart-series-2: #ff385c99; /* 60% opacity — secondary series */
--chart-series-3: #ff385c44; /* 27% opacity — tertiary series */
--chart-series-4: #222222; /* Near-black — comparison series */
--chart-series-5: #6a6a6a; /* Gray — baseline/target line */
--chart-positive: #008a05; /* Green — positive delta (new) */
--chart-negative: #c13515; /* Error Red — negative delta */
--chart-neutral: #6a6a6a; /* Gray — no change */
```

> Only `--chart-positive` (`#008a05`) is a new color added beyond the Airbnb system. All others derive from existing palette tokens.

---

## 3. Typography Rules

> **Font and scale are identical to Airbnb.** Only the use-case mapping changes.

### Font Family

- **Primary**: `Airbnb Cereal VF`, fallbacks: `Circular, -apple-system, system-ui, Roboto, Helvetica Neue`
- **Monospace override**: For numeric data values, wrap in `font-variant-numeric: tabular-nums` to align decimal points in tables.

### Hierarchy for Data Contexts

| Role            | Size | Weight | Use in Data App                                               |
| --------------- | ---- | ------ | ------------------------------------------------------------- |
| Page Title      | 28px | 700    | Dashboard name, report title                                  |
| Section Heading | 22px | 600    | Widget/panel titles (e.g., "Revenue Overview")                |
| KPI Value       | 22px | 700    | Large metric numbers on KPI cards                             |
| Sub-heading     | 21px | 700    | Table section headers, chart group labels                     |
| Feature Title   | 20px | 600    | Card sub-titles, filter panel headers                         |
| UI Medium       | 16px | 500    | Sidebar nav items, tab labels                                 |
| UI Semibold     | 16px | 600    | Active nav item, selected tab                                 |
| Table Header    | 14px | 600    | Column headers (`text-transform: uppercase`, +0.5px tracking) |
| Table Body      | 14px | 400    | Row data values                                               |
| Chart Label     | 13px | 400    | Axis tick labels, legend text                                 |
| Badge / Tag     | 12px | 600    | Status badges on rows (Active, Pending, Error)                |
| Timestamp       | 11px | 400    | "Last updated" timestamps, footnotes                          |

### Data-Specific Principles

- **Tabular numerics**: Always use `font-variant-numeric: tabular-nums` on any column containing numbers so decimal points and digits align vertically.
- **Negative letter-spacing on KPI values**: Apply `-0.44px` letter-spacing to large metric numbers (same as Airbnb card headings) — creates an intimate, premium feel.
- **Uppercase column headers**: `text-transform: uppercase` + `font-size: 11px` + `letter-spacing: 0.5px` for table `<th>` elements — creates clear hierarchy between header and data rows.
- **Weight contrast for delta indicators**: Pair weight-400 base value with weight-700 delta (`+12.4%`) for scannable KPI cards.

---

## 4. Component Stylings

### KPI Cards (Replaces Listing Cards)

```
Background:     #ffffff
Border radius:  20px  (same as Airbnb listing cards)
Shadow:         rgba(0,0,0,0.02) 0px 0px 0px 1px,
                rgba(0,0,0,0.04) 0px 2px 6px,
                rgba(0,0,0,0.1)  0px 4px 8px
Padding:        24px
Layout:         Metric label (14px/400/#6a6a6a) → large value (22px/700/#222222)
                → delta badge (12px/600, colored by +/-)
Hover:          Subtle shadow lift to Level 2
```

### Data Tables

```
Header row:     Background #f2f2f2, text #222222, 11px uppercase, weight 600
Body rows:      Background #ffffff, text #222222, 14px weight 400
Row divider:    1px solid #c1c1c1 (Border Gray)
Hover row:      Background rgba(255,56,92,0.04) — Rausch Red at 4% opacity
Selected row:   Background rgba(255,56,92,0.08) — Rausch Red at 8% opacity
Border radius:  14px on table container (same as Airbnb badges)
Shadow:         Three-layer card shadow on table container
```

### Chart Containers

```
Background:     #ffffff
Border radius:  20px
Shadow:         Three-layer card shadow
Chart area:     Generous padding — 24px all sides
Grid lines:     1px solid rgba(193,193,193,0.5) (Border Gray at 50%)
Axis labels:    13px Cereal VF weight 400, #6a6a6a
Tooltip:        White background, 8px radius, Level 2 hover shadow
Primary series: #ff385c (Rausch Red)
```

### Sidebar Navigation (Replaces Category Pill Bar)

```
Width:          240px (collapsed: 64px)
Background:     #ffffff
Right border:   1px solid #c1c1c1
Nav items:      16px Cereal VF weight 500, #222222
Active item:    Left border 3px solid #ff385c, background #fff0f2 (Rausch Red 4%)
                Text weight 600, color #ff385c
Icons:          20px, #6a6a6a (inactive), #ff385c (active)
Section labels: 11px uppercase weight 700, #929292, letter-spacing 0.5px
```

### Status Badges (New — for Table Rows)

```
Active:    Background rgba(0,138,5,0.1)  | Text #008a05 | "Active"
Error:     Background rgba(193,53,21,0.1)| Text #c13515 | "Error"
Pending:   Background rgba(255,56,92,0.1)| Text #ff385c | "Pending"
Paused:    Background rgba(0,0,0,0.06)   | Text #6a6a6a  | "Paused"
Radius:    14px (same as Airbnb badges)
Font:      12px Cereal VF weight 600
Padding:   3px 10px
```

### Filter Bar (Replaces Search Bar)

```
Background:     #ffffff
Shadow:         Three-layer card shadow
Radius:         32px on container (same as Airbnb search)
Inputs:         14px Cereal VF weight 400, #222222
Active filter chip: #ff385c background, #ffffff text, 20px radius
Clear button:   #6a6a6a text, no background
Apply button:   #222222 background, #ffffff text, 8px radius (Primary Dark button)
```

### Buttons

> **Identical to Airbnb** — no changes.

**Primary Dark**

- Background: `#222222`, Text: `#ffffff`, Radius: 8px, Padding: 0px 24px

**Primary Brand**

- Background: `#ff385c`, Text: `#ffffff`, Radius: 8px
- Use for: Export, Generate Report, primary data actions

**Ghost/Secondary**

- Background: transparent, Border: 1px solid `#c1c1c1`, Radius: 8px
- Use for: Filter, Refresh, secondary actions

---

## 5. Layout Principles

### Spacing System (Unchanged from Airbnb)

- Base unit: 8px
- Scale: 2px, 3px, 4px, 6px, 8px, 10px, 12px, 16px, 24px, 32px, 48px, 64px

### Dashboard Grid

```
Sidebar:        240px fixed left
Main content:   Fluid, max-width 1440px
Top bar:        56px fixed, white, three-layer shadow
Content area:   Padding 32px
KPI row:        4-column grid, 20px gap
Chart row:      12-column CSS grid (mix 8+4, 6+6, 12 full-width)
Table section:  Full-width, 24px margin-top from charts
```

### Responsive Breakpoints (Adapted from Airbnb)

| Name          | Width       | Key Changes                                         |
| ------------- | ----------- | --------------------------------------------------- |
| Mobile        | <744px      | Sidebar collapses to bottom tab bar, 1-col KPI grid |
| Tablet        | 744–950px   | Sidebar icon-only (64px), 2-col KPI grid            |
| Desktop Small | 950–1128px  | Full sidebar, 2-col KPI, 1 chart per row            |
| Desktop       | 1128–1440px | Full sidebar, 4-col KPI, side-by-side charts        |
| Large Desktop | >1440px     | Wider chart containers, 5-col KPI possible          |

### Whitespace Philosophy

- **Scannable density**: Tighter than Airbnb's browse layout, but each KPI card and chart panel has its own breathing room via the 3-layer shadow system.
- **24px internal padding**: All cards use 24px padding — enough for the content to breathe without wasting screen real estate.
- **32px section spacing**: Vertical gap between KPI row, chart row, and table section.

---

## 6. Depth & Elevation

> **Identical to Airbnb's system** — same four levels, same shadow values.

| Level            | Treatment                       | Data App Use                    |
| ---------------- | ------------------------------- | ------------------------------- |
| Flat (0)         | No shadow                       | Page background, sidebar        |
| Card (1)         | Three-layer shadow              | KPI cards, chart panels, tables |
| Hover (2)        | `rgba(0,0,0,0.08) 0px 4px 12px` | Hovered row, hovered card       |
| Active Focus (3) | White ring + focus shadow       | Active filter, focused input    |

### Additional: Tooltip (Level 2.5)

```
Shadow: rgba(0,0,0,0.12) 0px 4px 16px, rgba(0,0,0,0.04) 0px 0px 0px 1px
Radius: 8px
Background: #ffffff
```

---

## 7. Data-Specific Patterns

### Delta / Change Indicators

```
Positive:  ▲ +12.4%   color: #008a05   weight: 600
Negative:  ▼ -3.1%    color: #c13515   weight: 600
Neutral:   — 0.0%     color: #6a6a6a   weight: 400
```

### Loading States

```
Skeleton:  Background linear-gradient(90deg, #f2f2f2 25%, #e8e8e8 50%, #f2f2f2 75%)
           Animation: shimmer 1.5s infinite
           Radius: matches the element being loaded (20px for cards, 4px for text rows)
```

### Empty States

```
Icon:    64px, color #c1c1c1
Heading: 22px Cereal VF weight 600, #222222
Body:    14px weight 400, #6a6a6a
CTA:     Primary Dark button (#222222)
```

### Pagination

```
Active page:  #ff385c background, #ffffff text, 8px radius
Other pages:  #ffffff background, #222222 text, 8px radius, 1px border #c1c1c1
Font:         14px Cereal VF weight 500
```

---

## 8. Do's and Don'ts

### Do (Data App Adaptations)

- Use `font-variant-numeric: tabular-nums` on ALL numeric table columns
- Apply `#ff385c` to the active sidebar nav item and primary chart series
- Use three-layer card shadow on every KPI card, chart panel, and table container
- Use `#f2f2f2` for table header rows and sidebar background
- Use `#c13515` (Error Red) for negative metrics and alert states — it's already in the palette
- Apply 20px border-radius on KPI cards and chart containers (same as Airbnb listing cards)
- Keep status badges at 14px radius with the color opacity system above

### Don't

- Don't use pure `#000000` for data values — always `#222222` (warm near-black)
- Don't introduce new colors beyond the chart series extension above
- Don't use flat/borderless tables — always wrap in the card shadow container
- Don't use weight 300 or 400 for KPI values — 600 minimum for any metric number
- Don't use Rausch Red for negative metrics — use `#c13515` (Error Red, already in palette)
- Don't replace the sidebar active state with a background fill — use the left border + light tint pattern
- Don't use heavy grid lines in charts — `rgba(193,193,193,0.5)` maximum opacity

---

## 9. Component Prompts (Quick Reference)

- **KPI Card**: "White background, 20px radius. Three-layer Airbnb shadow. 24px padding. Label: 13px Cereal VF weight 400 #6a6a6a. Value: 22px weight 700 #222222 tabular-nums. Delta: 12px weight 600 colored #008a05 or #c13515."

- **Data Table**: "Container: white, 14px radius, three-layer shadow. Header: #f2f2f2 bg, 11px uppercase weight 600 #222222. Rows: 14px weight 400 #222222, 1px #c1c1c1 divider. Hover row: rgba(255,56,92,0.04) tint."

- **Chart Panel**: "White background, 20px radius, three-layer shadow, 24px padding. Title: 16px Cereal VF weight 600 #222222. Primary series: #ff385c. Grid lines: rgba(193,193,193,0.5). Axis: 13px weight 400 #6a6a6a."

- **Sidebar Nav Item (Active)**: "Left border 3px #ff385c. Background rgba(255,56,92,0.06). Text 16px Cereal VF weight 600 #ff385c. Icon #ff385c."

- **Filter Chip (Active)**: "Background #ff385c. Text #ffffff weight 500 14px. Radius 20px. Padding 6px 16px."
