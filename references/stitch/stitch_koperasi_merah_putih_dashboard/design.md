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
This design system embodies an institutional, forward-thinking, and trustworthy digital workspace tailored for a national cooperative financial and enterprise ecosystem. It balances corporate precision with approachable warmth, translating civic solidarity and national pride into a modern visual language.

The design movement combines **Contemporary Corporate** clarity with soft **Neomorphic-adjacent ambient elevation**:
- Pure, pristine canvas surfaces resting over muted warm neutral backdrops.
- Crisp, rounded cards with ultra-soft ambient shadow tiers rather than harsh delineations.
- Purposeful accentuation with dignified Indonesian crimson (`Merah Putih`), balanced against calm slate typography and delicate, pastel-tinted indicator badges.
- Elevated focus on legibility, data hierarchy, and frictionless operational workflows across desktop and mobile form factors.

## Colors
The color architecture relies on a clean, layered neutral scheme enriched with authoritative primary accents and contextual status indicators:

- **Primary (`#BE123C` / Deep Crimson):** Used for focal brand moments, active navigation indicators, key conversion actions, and active date/status highlights. Supported by `#E11D48` for hover interactions and `#FFE4E6` for light accent pill backgrounds.
- **Secondary (`#1E293B` / Dark Slate):** Grounds the interface typography, metric headlines, and primary iconography, maintaining optimal WCAG AAA contrast against white cards.
- **Tertiary (`#0284C7` / Slate Sky Blue):** Powers auxiliary actions, task counters, informative badges, and secondary analytical charts.
- **Neutral Canvas (`#F8FAFC` to `#FFFFFF`):** The application canvas sits on `#F8FAFC` (slate-50), while interactive dashboard widgets and structural panels sit on pure `#FFFFFF` surfaces with subtle border trims (`#F1F5F9`).
- **Semantic Accents:**
  - **Success / Completed:** `#059669` (text) on `#ECFDF5` (background)
  - **Warning / Ongoing:** `#D97706` (text) on `#FEF3C7` (background)
  - **Critical / High Priority:** `#BE123C` (text) on `#FFF1F2` (background)
  - **Subtle Badges:** `#0284C7` on `#F0F9FF` and `#6366F1` on `#EEF2FF` for tags and multi-category classification chips.

## Typography
Plus Jakarta Sans serves as the singular typographic workhorse across headlines, UI body copy, and metadata indicators. Its contemporary geometric curves and open counter forms deliver exceptional legibility on desktop high-DPI screens and mobile viewports alike.

- **Headlines:** Set with tight tracking (`-0.01em` to `-0.02em`) and solid weights (`600` and `700`) to anchor dashboard modules, operational counts, and user names.
- **Body:** Calibrated between 14px and 15px with relaxed line heights (`1.45` to `1.5`) for rapid scanning of member records, financial ledgers, and task details.
- **Labels & Microcopy:** Badges, tags, calendar headers, and table metadata utilize uppercase or semi-bold micro-tokens (`10px`–`13px`) with expanded tracking (`+0.02em` to `+0.06em`) to ensure clear visual separation from standard paragraph text.

## Layout & Spacing
The layout system is founded on an 8-point base rhythm, deploying a multi-column modular workspace:

- **Structure:**
  - **Left Rail (Vertical Sidebar):** Fixed `260px` desktop width, housing cooperative branding, high-level module links, and bottom utility anchors.
  - **Top Utility Header:** Persistent spanning search bar, global notifications, and quick profile pill with an intrinsic height of `68px`.
  - **Modular Dashboard Canvas:** Fluid multi-column responsive grid (12-column desktop, 8-column tablet, single-column mobile) populated by cards with distinct internal padding scales (`space-lg` for widget containers; `space-sm` to `space-md` for sub-components).
- **Adaptability:**
  - **Desktop (≥ 1280px):** Permanent navigation sidebar, 3-column widget orchestration (Primary card metrics `col-span-4`, Task/tracker lists `col-span-5`, Calendar/Messages `col-span-3`).
  - **Tablet (768px - 1279px):** Collapsible sidebar rail (`80px`), 2-column stacked grid with horizontal scrolling for timeline widgets.
  - **Mobile (< 768px):** Bottom sheet/drawer navigation, single-column vertical card stack with compact margins (`1rem`).

## Elevation & Depth
Elevation in this design system avoids harsh, dark drop-shadows. Instead, depth is achieved via soft, diffuse ambient light mimicking bright daylight across matte white card stock:

- **Level 0 (Canvas):** Pure `#F8FAFC` flat background.
- **Level 1 (Default Card Surface):** Pure `#FFFFFF` background with an ultra-diffuse dual shadow:
  - `0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 10px 25px -5px rgba(15, 23, 42, 0.04)`
  - Border: 1px solid `#F1F5F9` to preserve tactile separation on low-contrast monitors.
- **Level 2 (Hover / Active Overlay Cards):**
  - `0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 20px 30px -10px rgba(15, 23, 42, 0.07)`
  - Upward translation of `-2px` with smooth `150ms cubic-bezier(0.4, 0, 0.2, 1)` easing.
- **Level 3 (Floating Modals & Flyout Menus):**
  - `0 25px 50px -12px rgba(15, 23, 42, 0.12)` complemented by subtle backdrop blur (`backdrop-blur-md` with `rgba(255, 255, 255, 0.8)`).
- **Active Selection Rail:** Subtle 4px inset or left-border highlight in `#BE123C` alongside soft crimson tinting (`rgba(190, 18, 60, 0.04)`) to clearly distinguish the active navigation state.

## Shapes
The visual identity relies on generous, polished curvature (`roundedness: 2` with extended `rounded-2xl` for primary modules) that softens complex financial and operational data:

- **Dashboard Cards & Panels:** Standardized on `1.25rem`–`1.5rem` (20px–24px, `rounded-2xl`), imparting a friendly, tactile, and modern aesthetic.
- **Form Controls & Search Bars:** Defined at `0.75rem`–`1rem` (12px–16px, `rounded-xl`) for ergonomic touch targets and unified visual rhythm.
- **Tags, Badges, and Avatar Stacks:** Fully pill-shaped (`9999px` / `rounded-full`) to immediately signal interactive or status-bearing micro-units.
- **Progress Trackers & Gauges:** Smoothly rounded inner and outer pill-track ends preventing visual harshness.

## Components

### 1. Primary & Secondary Buttons
- **Primary:** Filled `#BE123C` with crisp white typography, `rounded-xl` (`12px`), medium font weight (`600`), and subtle hover darkening (`#9F1239`). Includes soft active depth feedback.
- **Secondary / Ghost:** `#FFFFFF` background with `1px solid #E2E8F0`, slate text (`#334155`), and crimson tint on hover (`#FFF1F2`).
- **Icon Actions:** `40px x 40px` circular or soft-square target, `#F8FAFC` idle state, transitioning to `#F1F5F9` on interaction.

### 2. Status Chips & Priority Badges
- **Format:** Pill-shaped (`rounded-full`), `py-1 px-3`, label typography (`11px`, bold, uppercase tracking).
- **Variants:**
  - *High Priority / Due Soon:* Tinted `#FFF1F2` with crimson text (`#BE123C`) and optional hairline outline.
  - *In Progress / Active:* Tinted `#FEF3C7` with amber text (`#D97706`).
  - *Completed:* Tinted `#ECFDF5` with emerald text (`#059669`).
  - *Tag / Category:* Tinted `#F0FDF4` or `#E0F2FE` with soft slate/sky text (`#0369A1`).

### 3. Navigation Sidebar Items
- Generous vertical row height (`44px`–`48px`) with `rounded-xl` boundaries.
- **Default State:** `#64748B` slate icons and labels.
- **Active State:** `#BE123C` crimson icon and label, enriched by a gentle gradient or solid background tint (`#FFF1F2`) and an accented right/left indicator bar.

### 4. Search & Input Fields
- Enclosed inside `rounded-2xl` or `rounded-xl` containers with light gray background fills (`#F8FAFC`) transitioning to pure `#FFFFFF` with an active `#BE123C` focus ring (`2px`).
- Integrated left-aligned search icon with muted placeholder copy (`#94A3B8`).

### 5. Task & Progress List Rows
- Horizontal card strip with light divider boundaries or independent elevated sub-cards.
- Left-aligned item sequence number (`01`, `02`) in bold `#64748B`, task title, auxiliary counter badges (chat, attachments), and a right-aligned rounded checkbox or circular toggle.
- Strikethrough and muted graying applied gracefully upon completion.

### 6. Interactive Calendar Widget
- Clean header with month navigation chevrons wrapped in circular pill buttons (`#F8FAFC`).
- Days displayed in an open 7-column matrix. Current active day highlighted by a filled solid pill/circle in crimson (`#BE123C`) with bright white text, while days with scheduled meetings present subtle dual indicator dots below the date number.

### 7. Avatar Groups & Member Cards
- Stacked circular avatars with 2px white borders (`ring-2 ring-white`).
- Overflow indicator pill (`+5`, `+12`) styled in slate neutral `#F1F5F9` with dark typography (`#475569`).