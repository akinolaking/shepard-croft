# Shepard Croft — Screen-by-screen visual QA (v1.3.0)

Scope: HTML reference preview and current React + Astryx implementation. This is a **visual QA pass**, not final customer approval against the editable Figma source.

## Screens reviewed
Home, Living, Wealth, Heritage, Companion request, Transfer quote, Accessible transport interest, Grocery market, Grocery interest, Vending service, Vending site visit and Contact. Captures at desktop 1440 × 900 and mobile 390 × 844; full-page snapshots as well as first-viewport images.

## Confirmed findings and corrections

1. **Inconsistent form corners:** In the baseline React build, ordinary inputs and select/textarea elements had 2 px corners, but Astryx wrappers and radio/checkbox options had different shapes; mixed design tokens made fields appear square. Introduced a consistent 8 px control radius and matching shell radii. Preserve circular native radio buttons and accessible checkbox controls.
2. **Potential invisible/incorrect light-surface typography:** The Astryx neutral theme can apply theme foregrounds after custom branding. Scoped explicit deep-green text tokens to page headings, editorial cards and form labels; retained white text on the dark contact band, and white labels on dark primary buttons.
3. **Low-contrast step numerals:** The previous HTML reference used very light green step numbers (measured ~1.88:1 on sage). Changed to #45654e for improved large-text contrast.
4. **Booking form readability:** Standardized native date/time/select/textarea text and placeholder colour, border, padding, height, focus styles and control radius. Added a repeatable browser QA check with form-control measurements.
5. **Responsive breakpoints:** Baseline captures at 390px and 1440px show navigation toggles and no page overflow; 768px is also tested by the browser QA script.

## Acceptance criteria
- All important headings and visible field labels have contrast >= 4.5:1 on flat background colours; large/decorative text >= 3:1.
- Text/date/time/select/textarea corners have >= 6 px radius and consistent 44px+ tap height (target 50px).
- All pages load with no uncaught browser errors, no missing images and no horizontal overflow at 390, 768 and 1440px.
- All service enquiry routes display correct fields and booking forms never claim confirmed appointments until VoxelBooking validates the booking.
- Recheck exact Figma image crops, typography and spacing at identical viewport sizes before final sign-off.

## Notes
- The 4x4 contact sheets show 12 primary route first-fold captures plus 4 form-detail repeats; the ZIP also contains individual full-page snapshots from the HTML reference.
- Visual testing of a development preview does not test real Neon submission or VoxelBooking booking calendar.
- Production release remains blocked on genuine booking integration, privacy review, and Figma sign-off.

## Automated screenshot audit finding, v1.3 first pass
On the first GitHub Actions browser run (13 routes × 3 viewports = 39), there were **21 failures**, all on form screens where text inputs retained 2 px corners and 49 px height; headings/labels showed no sub-threshold contrast warnings and no route overflow or missing images. The cause was CSS specificity: the original `.field input:not(...)` selector outweighed the new low-specificity `:where()` declaration. An explicit `.form-page .form-card .field input:not(...)` override now sets 8 px corners and a minimum 52 px field height. This requires a second browser run before acceptance.