---
name: Koperasi Merah Putih Executive Interface
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#5b4041'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#8f6f70'
  outline-variant: '#e3bdbf'
  surface-tint: '#bb0f3a'
  primary: '#95002a'
  on-primary: '#ffffff'
  primary-container: '#be123c'
  on-primary-container: '#ffd0d2'
  inverse-primary: '#ffb2b7'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#004c76'
  on-tertiary: '#ffffff'
  tertiary-container: '#00659a'
  on-tertiary-container: '#bedfff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b7'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#920029'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  crimson-dark: '#95002A'
  crimson-hover: '#9F1239'
  crimson-tint: '#FFF1F2'
  crimson-light: '#FFE4E6'
  surface-card: '#FFFFFF'
  border-subtle: '#F1F5F9'
  border-muted: '#E2E8F0'
  status-success-bg: '#ECFDF5'
  status-success-fg: '#059669'
  status-warning-bg: '#FEF3C7'
  status-warning-fg: '#D97706'
  status-info-bg: '#F0F9FF'
  status-info-fg: '#0284C7'
  status-purple-bg: '#EEF2FF'
  status-purple-fg: '#6366F1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an authoritative, forward-thinking, and trustworthy digital operating environment tailored for national cooperative management, executive oversight, and daily financial operations. It translates Indonesian civic solidarity and institutional pride into a contemporary, refined fintech aesthetic.

The visual direction harmonizes **Contemporary Corporate** structure with **Neomorphic-adjacent ambient elevation**:
- Pristine, matte-white card surfaces floating gently above calm `#F8FAFC` slate canvas backdrops.
- Ultra-soft, diffuse ambient shadows and hairline borders replacing abrasive outlines and skeuomorphic bevels.
- Strategic deployment of deep crimson (`Merah Putih`) as an intentional focal anchor, harmonized with dark slate typography and cool sky blue analytics accents.
- Utilitarian precision designed for rapid executive scanning, dense operational audit trails, and intuitive cooperative member workflows.

## Colors

The color palette employs a clear functional taxonomy engineered to prevent visual fatigue during extended managerial and audit shifts:

- **Primary (`#BE123C` Deep Crimson):** Serves as the primary institutional identifier. Reserved for high-priority calls to action, active navigation states, key date selections, and primary status signifiers. Its darker counterpart (`#95002A`) provides added depth for authoritative accents.
- **Secondary (`#1E293B` Dark Slate):** Anchors typographical hierarchy, data headings, and structural icons, guaranteeing effortless WCAG AAA compliance against white card surfaces.
- **Tertiary (`#0284C7` Slate Sky Blue):** Directs analytical visual streams, auxiliary financial graphs, informative callouts, and secondary actions.
- **Neutral Canvas (`#F8FAFC` & `#FFFFFF`):** The broad application background rests on cool `#F8FAFC` slate, while individual dashboard modules, analytical tiles, and tables occupy clean, raised `#FFFFFF` surfaces trimmed with hairline `#F1F5F9` boundaries.
- **Semantic Feedback:**
  - *Completed / Verified:* `#059669` text on `#ECFDF5` background.
  - *Pending / In Progress:* `#D97706` text on `#FEF3C7` background.
  - *Urgent / Action Required:* `#BE123C` text on `#FFF1F2` background.
  - *Analytical Classification:* Soft sky `#0284C7` and indigo `#6366F1` with coordinated pastel backdrops.

## Typography

Plus Jakarta Sans is applied across all typographic roles. Its geometric construction, humanized terminals, and broad horizontal proportions maintain legibility across both high-density data tables and executive headline cards.

- **Headlines (`headline-xl`, `headline-lg`, `headline-sm`):** Feature tight tracking (`-0.01em` to `-0.02em`) with prominent weights (`600` and `700`) to anchor dashboard sections, aggregate fund balances, and executive KPI summaries.
- **Body (`body-lg`, `body-md`, `body-sm`):** Tuned for operational readability, balancing line heights from 1.45 to 1.6 to facilitate fluid scanning of ledger entries, loan approvals, and member rosters.
- **Labels & Microcopy (`label-lg`, `label-md`, `label-sm`):** Employ intentional uppercase styling and expanded tracking (`+0.02em` to `+0.06em`) to ensure status tags, timestamps, and table headers remain distinct from running paragraph text.

## Layout & Spacing

The design system uses an 8-point rhythmic grid to orchestrate structured executive screens:

- **Desktop Layout Architecture (≥ 1280px):**
  - **Fixed Primary Navigation:** A persistent `260px` left-hand structural rail containing institutional branding, primary navigation groups, and user profile utilities.
  - **Global Header Utility:** A persistent `68px` top bar containing contextual search, cross-department notifications, and quick action triggers.
  - **12-Column Responsive Workspace:** Content cards align to a 12-column grid utilizing `1.5rem` (`24px`) gutters and `2rem` (`32px`) canvas margins. Typical layouts pair a 7-column or 8-column primary operational workspace with a 4-column or 5-column secondary analytical sidebar (calendar, recent audits, quick transfers).
- **Tablet Layout (768px – 1279px):**
  - Left navigation collapses into a condensed `80px` icon rail.
  - Workspace transitions to an 8-column layout with `1.25rem` gutters, allowing secondary analytical blocks to stack below core transaction metrics.
- **Mobile Layout (< 768px):**
  - Navigation shifts to an off-canvas drawer accessed via the global header or a consolidated bottom app bar.
  - Columns collapse to a single fluid track using `0.75rem` (`12px`) gutters and `1rem` (`16px`) outer margins.

## Elevation & Depth

Visual hierarchy uses neomorphic-adjacent ambient elevation, combining diffuse drop shadows with delicate translucent borders rather than harsh, dark outlines.

- **Level 0 (App Canvas):** Flat, un-elevated base layer colored `#F8FAFC`.
- **Level 1 (Card & Module Surfaces):** Primary content modules sit on `#FFFFFF` with a dual-tiered ambient shadow:
  - `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 10px 25px -5px rgba(15, 23, 42, 0.04);`
  - Border: `1px solid #F1F5F9` to preserve tactile edge definition on uncalibrated enterprise displays.
- **Level 2 (Hover & Active Interactive Cards):** Interactive elements respond with a subtle `-2px` Y-axis lift and expanded diffused elevation:
  - `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 20px 30px -10px rgba(15, 23, 42, 0.07);`
  - Transition: `all 180ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Level 3 (Overlays, Modals, & Flyout Panels):** Elevated structural overlays float above the canvas:
  - `box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.12);`
  - Paired with an ambient backdrop scrim (`rgba(15, 23, 42, 0.3)`) and glass blur (`backdrop-filter: blur(8px)`).
- **Active Structural Accent:** Active navigation items and selected transaction rows apply a vertical 4px inset border in `#BE123C`, paired with a gentle ambient crimson tint (`rgba(190, 18, 60, 0.04)`).

## Shapes

The geometric personality features balanced, contemporary curvature that softens analytical density while maintaining professional rigor:

- **Dashboard Cards & Large Modules:** Standardized on `rounded-2xl` (`1.25rem`–`1.5rem` / 20px–24px). The generous radii eliminate sharp grid intersections, lending an approachable feel to ledger and operational views.
- **Form Controls & Action Buttons:** Configured at `rounded-xl` (`0.75rem` / 12px) for consistent, ergonomic touch and click surfaces.
- **Status Pills, Notification Badges, & Chips:** Configured at `rounded-full` (`9999px`) to immediately distinguish small status tokens from structural input and card boundaries.
- **Table Cells & Segmented Pickers:** Micro-containers apply `rounded-lg` (`0.5rem` / 8px) to nest smoothly within parent card boundaries.

## Components

### Buttons
- **Primary Action Button:** Solid `#BE123C` fill, crisp white `#FFFFFF` text, `font-weight: 600`, `rounded-xl` (`12px`), with an internal padding of `0.625rem 1.25rem`. On hover, transitions to `#9F1239` with a subtle Level 2 ambient shadow. On press, delivers an active tactile scale feedback of `0.98`.
- **Secondary / Outline Button:** `#FFFFFF` background with a `1px solid #E2E8F0` border, slate `#334155` text, and `rounded-xl`. On hover, transitions to `#FFF1F2` with crimson text `#BE123C` and an accent border `#FECDD3`.
- **Icon / Utility Button:** `40px x 40px` dimensions with `rounded-xl` geometry. Neutral state sits on `#F8FAFC` with `#64748B` iconography, transitioning to `#F1F5F9` and `#1E293B` on hover.

### Status Chips & Priority Badges
- **Structure:** Pill geometry (`rounded-full`), padded `0.25rem 0.75rem`, utilizing `label-md` (`11px`, bold, letter-spacing `0.06em`, uppercase).
- **Priority Variants:**
  - *High Priority / Critical:* `#FFF1F2` background, `#BE123C` text, optional hairline border `rgba(190, 18, 60, 0.2)`.
  - *In Progress / Active Review:* `#FEF3C7` background, `#D97706` text.
  - *Completed / Settled:* `#ECFDF5` background, `#059669` text.
  - *Categorical / General:* `#F0F9FF` background, `#0284C7` text.

### Form Inputs & Search Fields
- **Container:** Height of `44px` or `48px`, styled with `rounded-xl`, `#F8FAFC` idle background fill, and a subtle border `1px solid #E2E8F0`.
- **States:** On focus, transitions to `#FFFFFF` background, accompanied by a `2px` focus ring in `#BE123C` with an ambient glow (`rgba(190, 18, 60, 0.12)`).
- **Adornments:** Left-aligned operational icons in muted `#94A3B8`, with trailing clear or validation status indicators.

### Navigation Rail Items
- **Dimensions:** Row height `46px`, `rounded-xl` boundaries, horizontal padding `0.875rem`.
- **Idle State:** Text and icons rendered in `#64748B`.
- **Active State:** Background filled with `#FFF1F2`, icon and typography highlighted in `#BE123C`, reinforced by a solid `4px` vertical indicator bar along the leading edge.

### Cards & Analytical Widgets
- **Container:** `#FFFFFF` base, `rounded-2xl`, Level 1 ambient elevation, `1px solid #F1F5F9` perimeter boundary, and `1.5rem` internal padding (`space-lg`).
- **Header:** Houses a concise `title-md` or `headline-sm`, trailing contextual menu dots or status badge, and an optional micro-descriptor.

### Data Tables & Operational Rows
- **Header Row:** Crisp `#F8FAFC` background with `label-md` tracking, slate `#64748B` labels, and a subtle bottom border `1px solid #E2E8F0`.
- **Data Rows:** Alternating clean white surfaces with smooth `#F8FAFC` hover transitions. Row height of `56px` for dense data density without visual crowding. Bottom hairline dividers styled in `#F1F5F9`.

### Interactive Calendar & Schedule Tile
- **Grid:** 7-column open matrix with minimal guttering.
- **Active Day:** Solid `#BE123C` filled circle with white `#FFFFFF` text and subtle crimson drop elevation.
- **Scheduled Markers:** Miniature dual dots (`4px`) in `#BE123C` and `#0284C7` positioned `2px` beneath the date numeral.

### Member Cards & Avatar Stacks
- **Avatars:** Circular (`rounded-full`) with `2px` white outline rings (`ring-2 ring-white`).
- **Overflow Pill:** `label-sm` numeral styled in `#F1F5F9` background with `#475569` dark slate text.