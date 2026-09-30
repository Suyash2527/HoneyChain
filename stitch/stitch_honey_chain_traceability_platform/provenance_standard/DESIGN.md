---
name: Provenance Standard
colors:
  surface: '#fdf9ef'
  surface-dim: '#dddad0'
  surface-bright: '#fdf9ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e9'
  surface-container: '#f1eee4'
  surface-container-high: '#ece8de'
  surface-container-highest: '#e6e2d8'
  on-surface: '#1c1c16'
  on-surface-variant: '#414944'
  inverse-surface: '#31312a'
  inverse-on-surface: '#f4f0e7'
  outline: '#717973'
  outline-variant: '#c0c9c2'
  surface-tint: '#3a6753'
  primary: '#023625'
  on-primary: '#ffffff'
  primary-container: '#1f4d3a'
  on-primary-container: '#8dbda4'
  inverse-primary: '#a1d1b8'
  secondary: '#845400'
  on-secondary: '#ffffff'
  secondary-container: '#ffb54d'
  on-secondary-container: '#714800'
  tertiary: '#00371c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00502b'
  on-tertiary-container: '#74c38e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceed3'
  primary-fixed-dim: '#a1d1b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#214f3c'
  secondary-fixed: '#ffddb6'
  secondary-fixed-dim: '#ffb959'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#a4f4bc'
  tertiary-fixed-dim: '#88d7a1'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#00522c'
  background: '#fdf9ef'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d8'
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Source Serif 4
    fontSize: 34px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-bilingual:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: -0.01em
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
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses **institutional trust and editorial warmth**. It bridges the rigorous certification authority of a sovereign ministry initiative with the artisanal provenance of rural beekeeping and raw honey trade. 

The visual language draws inspiration from classical botanical ledgers, sovereign mint marks, and contemporary civic publications. Rather than relying on cold cryptographic metaphors or conventional corporate tech tropes, the interface feels tactile, credible, and grounded: warm archival paper, precise inked borders, crisp editorial typography, and structured ledgers. 

The aesthetic is quiet, confident, and meticulously organized. It communicates uncompromised verification, laboratory purity, and economic empowerment for apiarists across India.

## Colors

The palette establishes an organic, archival foundation paired with authoritative institutional green and controlled amber accents.

### Core Roles
- **Canvas Base (`#FAF6EC`)**: Archival warm paper. Eliminates sterile monitor glare and mimics physical parchment or laboratory test certificates.
- **Surface Elevation (`#F4EEDA` / `#FFFFFF`)**: Used for structured cards, sheets, and elevated modules. Crisp `#FFFFFF` is reserved for inspectable certificate areas, ledger panels, and interactive data sheets.
- **Structural Outlines (`#E2DAC5`)**: Hairline framing border for cards, data blocks, and dividers.
- **Deep Ink (`#1B1A17`)**: Primary typography and high-emphasis interface marks.
- **Secondary Ink (`#58554E`)**: Supporting labels, metadata, and bilingual transliterations.
- **Muted Ink (`#8A857B`)**: Inactive states, timestamps, and subtle field headers.
- **Primary Sovereign Green (`#1F4D3A`)**: Government-grade trust, core calls-to-action, active navigational links, and institutional headers.
- **Honey Amber Accent (`#E9A23B`)**: Applied strictly as a focal accent—verification score rings, active batch highlights, and floral pollen hallmarks.

### Functional Semantics
- **Verified (`#2E7D4F`)**: Cryptographic signature validation, laboratory purity confirmation.
- **Caution (`#B7791F`)**: Pending lab clearance, ambient temperature variance in hive monitors.
- **Danger (`#B3372F`)**: Unsealed tamper evidence, adulteration detection, expired certifications.
- **Information (`#2F5D8C`)**: Civic notices, administrative guidelines, schema specifications.

## Typography

The typographic hierarchy relies on a three-tier system:
1. **Source Serif 4**: Carries the gravitas of print journalism, state charters, and hallmark inscriptions. Used for titles, purity scores, hive metrics, and key provenance milestones.
2. **Noto Sans (with complete Devanagari coverage)**: Clear, accessible, and balanced for functional UI, analytical data points, and simultaneous bilingual English/Hindi microcopy.
3. **JetBrains Mono**: Strictly reserved for immutable records—on-chain transaction hashes, block receipts, cryptographic keys, batch lot numbers, and RF sensor telemetry.

### Bilingual Label Composition
Labels frequently pair English headers with Hindi equivalents. The Devanagari text is positioned directly adjacent or beneath the Latin title in `label-bilingual`, set in `#58554E` to maintain hierarchy without cluttering data tables.

## Layout & Spacing

The layout model uses a disciplined 12-column grid on desktop screens (breakpoint: `1024px+`), an 8-column grid on tablet devices (`768px - 1023px`), and a 4-column stack on mobile viewports (`<768px`).

Editorial composition rules:
- **Asymmetric Anchors**: Ledger data and hive statistics are organized with uneven column ratios (e.g., 8-column primary timeline paired with a 4-column verification sidebar).
- **Hairline Dividers**: Section transitions, table rows, and component splits rely on 1px continuous borders (`#E2DAC5`), anchoring content rather than floating it arbitrarily.
- **Rhythm**: Compact inner component padding (`space-xs` to `space-md`) ensures dense, legible information architecture, while outer layout margins (`space-xl` and canvas margins) provide calm reading zones.

## Elevation & Depth

This system avoids floating drop shadows, blurred silhouettes, and colored light glows. Spatial depth is generated strictly through **tonal paper layering and hairline framing**:

- **Ground Layer (Canvas)**: Background canvas (`#FAF6EC`) represents the baseline workspace.
- **Tier 1 (Surface Containers)**: Panels, cards, and toolbars occupy `#F4EEDA` with a 1px border of `#E2DAC5`.
- **Tier 2 (Inspected Documents & Certificates)**: Laboratory certificates, analytical test results, and input forms use `#FFFFFF` backed by the same 1px `#E2DAC5` stroke.
- **Tier 3 (Overlays & Dialogs)**: Modals and flyout verification seals sit atop a 30% tinted mask of Deep Ink (`#1B1A17` at 0.30 opacity), framed with a 1px border and a static 2px ambient tint (`0 2px 8px rgba(27, 26, 23, 0.08)`).

## Shapes

The geometry reflects functional craftsmanship:
- **Interactive Controls (Inputs, Buttons, Segmented Chips)**: `8px` (`0.5rem`) corner radius for approachable tactile interaction.
- **Containers and Verification Panels**: `12px` (`0.75rem`) corner radius for subtle softness without appearing casual.
- **Ledgers & Data Tables**: `0px` radius. Tables are sharp and grid-bound to honor the aesthetics of formal administrative ledgers.
- **Verification Seal Motif**: Pure regular hexagons (6 sides at 60-degree cuts) utilized as badges, batch identity marks, and trust certification stamps.

## Components

### Buttons
- **Primary**: Deep Forest Green (`#1F4D3A`) fill, crisp `#FAF6EC` text, 8px radius, 12px vertical by 20px horizontal padding. Hover shifts to `#16392B`.
- **Secondary / Provenance**: Warm Paper (`#F4EEDA`) surface with 1px border (`#E2DAC5`), `#1B1A17` text. Hover shifts background to `#EBE3CA`.
- **Tertiary / Inline**: Unbordered, Deep Forest Green with an underlined hover state.

### Verification Seal & Score Ring
- A geometric hexagon containing the KVIC authorization status. 
- Integrated purity score rings utilize a circular SVG track in `#E2DAC5` with an animated fill in Honey Amber (`#E9A23B`) or Verified Green (`#2E7D4F`), displaying the score in Source Serif 4.

### Form Inputs & Selectors
- Background: `#FFFFFF`. Border: 1px `#E2DAC5`. Border-radius: 8px.
- Focus state: Replaces border with a crisp 1.5px `#1F4D3A` outline (no soft focus-glow rings).
- Labels are stacked with Devanagari translation: `Lot ID / लॉट संख्या` formatted in `label-bilingual`.

### Blockchain Hash & Ledger Chips
- Background: `#F4EEDA`. Monospace font (`JetBrains Mono`), 11px font size, `#58554E` text color, 4px corner radius, 1px `#E2DAC5` border. Truncates securely with an instant "Copy Proof" icon button.

### Cards & Ledger Tables
- **Cards**: `#F4EEDA` or `#FFFFFF` fill, 12px radius, 1px `#E2DAC5` border, no shadow.
- **Ledger Tables**: `#FAF6EC` header rows with `0px` radius, uppercase `label-md` tracking, separated by 1px solid `#E2DAC5` horizontal strokes. Alternating subtle striping on data rows.