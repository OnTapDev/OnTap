OnTap Typography README

Version: Phase 1 – Tools-First MVP
Purpose: Define typography, hierarchy, spacing, and letter-spacing rules for OnTap UI. Ensures visual consistency, readability, and brand alignment across web and mobile.

1️⃣ Font Family

Primary font: Satoshi

Chosen for: legibility, modern aesthetics, clean UI, and scalability across devices.

Weights:

Regular (400) → body text, labels, supporting information

Bold (700) → titles, headings, primary CTAs

Note: Only Regular and Bold are allowed. Medium, Semibold, or Extra Bold are prohibited for Phase 1.

2️⃣ Font Sizes

OnTap uses 4 pixel sizes, all aligned to an 8px vertical rhythm (with minor 4px adjustments for compact layouts).

Role	Size (px)	Line-height (px)	Weight	Letter-spacing  	Color
Screen Title	32	40	Bold	-0.02em	 Warm Gold (#7D6854)
Section / Card Title	20	28	Bold	-0.01em	 Warm Gold (#7D6854)
Primary Body / Button Text	16	24	Regular / Bold (CTA)	0 / -0.01em	Warm White (#F3E7D3) / Olive Gold (#7D7254) for CTA
Meta / Supporting Info	14	20	Regular	0	 Warm Sand (#B2A88A)

Rules:

Promote content up one size for emphasis instead of bolding unnecessarily.

Negative letter-spacing is only for Titles and Primary CTAs.

All sizes are fixed; no intermediate or arbitrary sizes allowed.

3️⃣ Letter-Spacing

Purpose: Subtly tighten key elements for visual emphasis.

Screen Titles (32px Bold): -0.02em

Section / Card Titles (20px Bold): -0.01em

Primary CTA Buttons (16px Bold): -0.01em

All other text: 0

Rule: Only use letter-spacing for attention areas. Do not track body text, meta text, paragraphs, or form inputs.

4️⃣ Color Usage (Hierarchy)
Role	Color	Hex	Usage
Background	Charcoal	#1A1A1A	Primary screen background
Body Text	Warm White	#F3E7D3	Main content, input values
Titles / Headings	Warm Gold	#7D6854	Screen titles, section headers, card titles
Accent / CTA	Olive Gold	#7D7254	Buttons, highlights, active states
Secondary / Supporting	Warm Sand	#B2A88A	Metadata, placeholders, muted text

Rules:

Titles → Warm Gold

Body → Warm White

Meta → Warm Sand or muted Warm White (opacity 60–70%)

Accent → Olive Gold only for CTAs, numbers, active states

Ensure sufficient contrast over Charcoal background

5️⃣ Spacing & Vertical Rhythm

Base spacing: 8px increments (minor 4px adjustments allowed)

Section top/bottom: 24–32px

Card padding: 16–24px

Label → value spacing: 4–8px

Buttons: minimum height 48px

Rule: Typography + spacing = visual ladder; all elements should align to the grid.

6️⃣ Buttons & CTAs

Primary: Olive Gold background, 16px Bold text, -0.01em letter-spacing, min-height 48px

Secondary: Charcoal background or Olive Gold border, 16px Regular text, normal tracking

Only one primary action per screen

No uppercase or decorative letter spacing

7️⃣ Cards & Lists

Card Header: 20px Bold / Warm Gold / -0.01em

Main Value: 16px Regular / Warm White (Accent color allowed for key numbers)

Supporting Info: 14px Regular / Warm Sand

Reading Flow: Title → Value → Context

8️⃣ Enforcement Rules

Only 4 sizes, 2 weights

Letter-spacing only for Titles and Primary CTAs

Color hierarchy must be strictly followed

All spacing multiples of 4 / 8px

If a text combination isn’t in the table → it does not ship

9️⃣ Purpose & Benefits

Ensures instant readability behind a bar or on mobile

Maintains brand consistency and premium feel

Creates visual hierarchy without clutter

Provides developers and designers with a single source of truth