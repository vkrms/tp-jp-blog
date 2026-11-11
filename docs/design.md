---
version: alpha
name: TP JP 3.0
description: Design system for the Travelpayouts Japan landing page — a calm, flat, trust-first Japanese marketing surface with a single brand blue for action and a warm orange reserved for "free" and support moments.
source:
  figma: https://www.figma.com/design/o0YiuYwhJO50g7xNwaIw2N/tp-landing-jp?node-id=388-330
  frame: "D 3.0 / step 11 / Design system (388:330)"
  mockups: "Desktop 1440 (344:1381), Mobile 375 (344:776)"
colors:
  # Text
  ink: "#101828"              # text/ink — headings, primary text
  body: "#1D2939"             # raw — body copy, lead
  label: "#344054"            # raw — labels, tabs, footer links
  secondary: "#475467"        # text/secondary — secondary text, FAQ answers
  muted: "#667085"            # text/note — ※ notes, muted labels (4.8:1 on white)
  disabled: "#98A2B3"         # text/disabled — placeholder, disabled
  # Surface & line
  surface: "#FFFFFF"          # surface/white — page, cards
  on-surface: "#101828"
  surface-muted: "#F9FAFB"    # signal/notice-bg — section bands, FAQ items, logo tiles
  surface-soft: "#F2F4F7"     # placeholder/fill-soft — plates, chips, counters
  line: "#EAECF0"             # line/hairline — hairline dividers; also state/disabled-bg
  line-strong: "#D0D5DD"      # line/strong — input borders, ghost button border
  surface-deep: "#1B1D29"     # surface/deep — dark browser mock
  # Brand blue (primary action)
  primary: "#006DFF"          # accent/default — primary buttons, step numbers, accents
  on-primary: "#FFFFFF"
  primary-hover: "#0061E0"    # accent/hover = accent/text
  primary-pressed: "#0058CC"  # accent/pressed — also links, result figures, eyebrow
  focus: "#66A7FF"            # accent/focus — 3px focus ring
  primary-200: "#CCE2FF"      # blue/100 — chart bars, open-FAQ border, active tab border
  primary-100: "#E5F0FF"      # blue/50 — quote bg, key-figure card, active tab, card borders
  primary-50: "#F2F8FF"       # accent/tint — tint backgrounds, step plates
  # Warm orange (free / support / hero warmth)
  warm: "#FF6200"             # raw — hero CTA fill
  warm-result: "#E05600"      # raw — result accent
  warm-strong: "#C24A00"      # raw — support heading, outline CTA
  warm-strong-hover: "#A33F00" # raw — outline CTA hover
  warm-200: "#FFE2D1"         # orange/100 — warm accents
  free-bg: "#FFF1E8"          # signal/free-bg — 無料 chip background
  free-text: "#CC4E00"        # orange/900 — 無料 chip text (token signal/free-text = #B84600)
  warm-50: "#FFF8F3"          # orange/25 — sign-up / support band
  # Signals
  success: "#067647"          # raw — positive amount (reward)
  error: "#F04438"            # signal/error — form error states
  accent-pink: "#E14171"      # raw — pink result accent
  accent-pink-tint: "#FEECF1" # raw — pink tint
typography:
  numeral-desktop:
    fontFamily: Noto Sans JP
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.03em
  numeral-mobile:
    fontFamily: Noto Sans JP
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.03em
  h1-desktop:
    fontFamily: Noto Sans JP
    fontSize: 50px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
  h1-mobile:
    fontFamily: Noto Sans JP
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
  h2-desktop:
    fontFamily: Noto Sans JP
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
  h2-mobile:
    fontFamily: Noto Sans JP
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
  h3-desktop:
    fontFamily: Noto Sans JP
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
  h3-mobile:
    fontFamily: Noto Sans JP
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
  lead-desktop:
    fontFamily: Noto Sans JP
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.8
  lead-mobile:
    fontFamily: Noto Sans JP
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.8
  body-desktop:
    fontFamily: Noto Sans JP
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.8
  body-mobile:
    fontFamily: Noto Sans JP
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.8
  title:
    fontFamily: Noto Sans JP
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.6
  body-bold:
    fontFamily: Noto Sans JP
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.6
  small:
    fontFamily: Noto Sans JP
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  small-bold:
    fontFamily: Noto Sans JP
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.6
  note:
    fontFamily: Noto Sans JP
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
  note-bold:
    fontFamily: Noto Sans JP
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.6
  button-l:
    fontFamily: Noto Sans JP
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.02em
  button-s:
    fontFamily: Noto Sans JP
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.02em
  tag:
    fontFamily: Noto Sans JP
    fontSize: 10px
    fontWeight: 700
    lineHeight: 14px
rounded:
  xs: 4px          # chips 必須 / 無料, checkbox, Tag, language-switcher items
  control: 12px    # buttons, inputs, FAQ tabs, Q/A plates
  surface: 20px    # quotes, logo tiles
  panel: 28px      # cards, hero visual, support band, FAQ items
  full: 999px      # pills, avatars, counters, +/− circles
spacing:
  "2": 2px
  "4": 4px
  "6": 6px
  "8": 8px
  "10": 10px
  "12": 12px
  "14": 14px
  "16": 16px
  "18": 18px
  "20": 20px
  "24": 24px
  "28": 28px
  "32": 32px
  "40": 40px
  "48": 48px
  "56": 56px
  "64": 64px
  "72": 72px
  "96": 96px
  "128": 128px
  "160": 160px
  page-margin-desktop: 48px
  page-margin-mobile: 16px
  container-desktop: 1344px
  container-mobile: 343px
  section-top-desktop: 112px
  card-padding-desktop: 32px
  card-padding-mobile: 24px
components:
  # Buttons — Kind × Size × State. Label + optional → arrow, gap 10px.
  button-primary-l:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-l}"
    rounded: "{rounded.control}"
    padding: 0 28px
    height: 56px
  button-primary-l-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-l-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-primary-l-focus:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    focusRing: 0 0 0 3px {colors.focus}
  button-primary-l-disabled:
    backgroundColor: "{colors.line}"
    textColor: "{colors.disabled}"
  button-primary-m:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-l}"
    rounded: "{rounded.control}"
    padding: 0 22px
    height: 48px
  button-primary-s:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-s}"
    rounded: "{rounded.control}"
    padding: 0 14px
    height: 40px
  button-ghost-l:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    borderColor: "{colors.line-strong}"
    typography: "{typography.button-l}"
    rounded: "{rounded.control}"
    padding: 0 28px
    height: 56px
  button-ghost-l-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.ink}"
  button-ghost-l-pressed:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink}"
    borderColor: "{colors.line-strong}"
  button-ghost-l-disabled:
    backgroundColor: transparent
    textColor: "{colors.disabled}"
    borderColor: "{colors.line}"
  button-outline-warm:
    backgroundColor: transparent
    textColor: "{colors.warm-strong}"
    borderColor: "{colors.warm-strong}"
    typography: "{typography.button-l}"
    rounded: "{rounded.control}"
    padding: 0 28px
    height: 56px
  button-outline-warm-hover:
    textColor: "{colors.warm-strong-hover}"
    borderColor: "{colors.warm-strong-hover}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.line-strong}"
    typography: "{typography.body-desktop}"
    rounded: "{rounded.control}"
    padding: 0 16px
    height: 56px
  input-placeholder:
    textColor: "{colors.disabled}"
  input-error:
    borderColor: "{colors.error}"
  field-label:
    textColor: "{colors.ink}"
    typography: "{typography.small-bold}"
  chip-required:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.label}"
    typography: "{typography.note-bold}"
    rounded: "{rounded.xs}"
    padding: 1px 6px
  badge-free:
    backgroundColor: "{colors.free-bg}"
    textColor: "{colors.free-text}"
    typography: "{typography.note-bold}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  tag-example:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.secondary}"
    typography: "{typography.tag}"
    rounded: "{rounded.xs}"
    padding: 1px 5px
  checkbox:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.line-strong}"
    rounded: "{rounded.xs}"
    size: 20px
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    borderColor: "{colors.primary}"
  checkbox-error:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.error}"
  checkbox-label:
    textColor: "{colors.ink}"
    typography: "{typography.small}"
  link:
    textColor: "{colors.primary-pressed}"
  note:
    textColor: "{colors.muted}"
    typography: "{typography.note}"
  lang-switch-item:
    textColor: "{colors.muted}"
    typography: "{typography.small}"
    padding: 0 8px
    height: 44px
  lang-switch-item-active:
    textColor: "{colors.ink}"
    typography: "{typography.small-bold}"
  lang-switch-item-focus:
    borderColor: "{colors.focus}"
    rounded: "{rounded.xs}"
  key-figure-card:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-pressed}"
    typography: "{typography.numeral-desktop}"
    rounded: "{rounded.panel}"
    padding: "{spacing.32}"
  logo-tile:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.surface}"
    width: 214px
    height: 120px
  faq-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.label}"
    borderColor: "{colors.primary-100}"
    typography: "{typography.body-desktop}"
    rounded: "{rounded.control}"
    padding: 0 20px
    height: 60px
  faq-tab-active:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.ink}"
    borderColor: "{colors.primary-200}"
    typography: "{typography.body-bold}"
  counter:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.label}"
    typography: "{typography.note}"
    rounded: "{rounded.full}"
    height: 20px
  faq-item:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.panel}"
    padding: "{spacing.32}"
  faq-item-open:
    backgroundColor: "{colors.surface-muted}"
    borderColor: "{colors.primary-200}"
  qa-plate:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-pressed}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.control}"
    size: 36px
  story-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    borderColor: "{colors.primary-100}"
    rounded: "{rounded.panel}"
    padding: "{spacing.32}"
  quote:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.ink}"
    typography: "{typography.body-desktop}"
    rounded: "{rounded.surface}"
    padding: 20px 24px
  step-card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.primary-100}"
    rounded: "{rounded.panel}"
    padding: "{spacing.24}"
  step-plate:
    backgroundColor: "{colors.primary-50}"
    rounded: "{rounded.panel}"
    padding: "{spacing.16}"
  support-band:
    backgroundColor: "{colors.warm-50}"
    textColor: "{colors.warm-strong}"
    typography: "{typography.h3-desktop}"
    rounded: "{rounded.panel}"
    padding: "{spacing.32}"
---

# TP JP 3.0 Design System

## Overview

TP JP 3.0 is the visual language of the Travelpayouts Japan landing page: it persuades Japanese travel bloggers and site owners to register for a free affiliate account. It should feel **calm, trustworthy and plainly honest**: generous whitespace, one typeface, flat surfaces, and fine print that is quiet but always there. Japanese readers check the details, so ※ notes, 表示例 tags on every example amount and clear "free" signals are part of the system, not decoration. Avoid two things: a loud, hype-heavy affiliate look (neon gradients, countdowns, drop-shadowed cards), and a dense Japanese corporate page where every block competes for attention.

## Colors

The palette is a neutral slate ramp (`ink` → `disabled`) on white, plus one **brand blue** and one **warm orange**. `primary` (#006DFF) carries every primary action, the step numbers and key accents. It darkens to `primary-hover` and `primary-pressed`, and `primary-pressed` (#0058CC) is also the color for links and large result figures. The blue tints (`primary-200`, `primary-100`, `primary-50`) do most of the structural work: card borders, quote backgrounds, the key-figure card and step plates. Orange is reserved for **free and support moments**: the 無料 badge (`free-bg` / `free-text`), the support band (`warm-50` + `warm-strong`) and the hero CTA (`warm`). Signals are kept sparse: `success` for reward amounts, `error` only on form states, and pink only as a secondary result accent. Body text uses `body` (#1D2939) rather than pure ink so long Japanese passages feel softer. `muted` (#667085) is the lightest color allowed for readable text (4.8:1 on white, AA); `disabled` is only for placeholders and disabled controls.

## Typography

There is a single family, **Noto Sans JP** (400 / 500 / 700), for Japanese, Latin and numerals alike, so mixed scripts like `¥19,880` stay consistent. Line height follows the content's role: headings at 150%, reading text (lead, body) at 180% for comfortable Japanese line spacing, UI and small text at 160%, and buttons at 130%. Headings and buttons get +2% tracking. Big numerals are set tight (-3%), and their unit (年, 万, ドル) is set at half size. Every heading, lead and body style has a desktop and a mobile token, while Title, Body Bold, Small, Note and the button styles stay the same at both sizes. Reach for `small-bold` for form labels, eyebrows and active tabs, and `note` for ※ lines, counters and captions. The ※ Note component is a little larger on desktop (13/19.5) than on mobile (12/18), so it is not the plain `note` token.

## Layout

Spacing uses a token scale (`spacing.2` through `spacing.160`), with steps of 2px up to 20, 4px up to 32 and 8px up to 72, then 96 / 128 / 160. Desktop is designed at 1440 with a 48px page margin and a 1344px container. Mobile is designed at 375 with a 16px margin and a 343px single column. The desktop grids are a **two-column** split (560px text column, 116px gap, 668px visual column) and a **three-column** card row (437px cards, gap ≈16, or 440px with a 12px gap for key figures and steps). Sections open with about 112px of top padding on desktop, and there is 56–64px from an H2 to its content. Card padding is 32px on desktop and 24px on mobile. Density is generous: let blocks breathe instead of shrinking the gaps.

## Elevation & Depth

The system is **flat**: no drop shadows anywhere. Depth comes from tonal surfaces (white on `surface-muted`, `primary-50` plates inside white cards) and 1px borders in `primary-100` / `primary-200` or `line` / `line-strong`. The only box-shadow is the **focus ring** (`0 0 0 3px #66A7FF`), which keeps it unmistakable. An open FAQ item gets a `primary-200` border, so "raised" means a colored outline, not a shadow.

## Shapes

Radius has four steps plus full. Use `xs` (4) for tiny inline things like chips, tags, checkboxes and switcher items, and `control` (12) for anything you click or type into (buttons, inputs, tabs, Q/A plates). `surface` (20) is for medium content blocks like quotes and logo tiles, and `panel` (28) is for large containers (cards, FAQ items, hero visual, support band). Use `full` for pills, avatars, counters and the +/− toggles. Nested radii step down: a `panel` card holds `panel` or `control` children, never the other way round. The old tokens (none / print / card / button / marker) are deprecated.

## Components

**Buttons** come in Primary and Ghost at sizes L (56px tall, 28px side padding), M (48, 22) and S (40, 14). They have a label plus an optional → arrow, and Primary L/S and Ghost L are the sizes used in production. The states are Default, Hover, Pressed, Focus (3px `focus` ring), Disabled (`line` fill with `disabled` text) and Loading (spinner + 送信中…). Ghost buttons use a transparent fill with a `line-strong` border. On hover they turn white with an `ink` border, and when pressed they fill with `line`. `button-outline-warm` is used only in the support band. The **CTA row** is a fixed group: a primary L button, then a line with the 無料 badge and 登録料・利用料0円※, a next-step line, and one quiet ※ note. It is centered on desktop and stretched full width on mobile. **Inputs** are 56px tall with a `line-strong` border, `control` radius and `disabled` placeholder text, and their labels are `small-bold` with a 必須 chip. The consent **checkbox** comes in Unchecked, Checked and Error. **※ Note** and **Tag / 表示例** are compliance atoms: one quiet line, never emphasized. The **language switcher** is a pair of text items separated by a ｜. The active item is `small-bold` `ink` with a 1px underline, and the inactive item is `muted`. **FAQ** is a set of tabs (60px tall, with a count pill) above accordion items in `surface-muted` with Q/A plates and a 32px circular +/− toggle. The card patterns are the key figure, logo tile, story (avatar, result in H2 `primary-pressed`, quote), step (plate with a mini UI mock above a title and text) and support band.

## Do's and Don'ts

**Do**
- Use `primary` blue for exactly one primary action per view, and use orange only for free, support and hero warmth.
- Put a 表示例 tag on every card or illustration that shows a money amount, and a ※ Note under any claim with conditions.
- Keep ※ notes quiet: `note` style, `muted` color, one line where it fits, no extra spacing.
- Set key figures with `numeral-*` and the unit at half size (15<small>年</small>).
- Express depth with tinted surfaces and 1px blue-tint borders, and keep the focus ring for keyboard focus.
- Use the desktop/mobile token pair for every heading, lead and body text.

**Don't**
- Don't add drop shadows, gradients or glassmorphism, because the system is flat.
- Don't introduce a second typeface or use weights other than 400, 500 and 700.
- Don't use a text color lighter than `muted` (#667085) for readable copy, because `disabled` is only for placeholders and disabled controls.
- Don't invent new radii; use only 4 / 12 / 20 / 28 / full.
- Don't use red (`error`) for anything other than form error states, or green for anything other than reward amounts.
- Don't add letter spacing to body or lead text, since only headings, buttons and numerals are tracked.
