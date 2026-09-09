# 0005. One genome, three marks: the sister pixel-marks

Status: Accepted
Date: 2026-07-29

## Context

VITA's brand mark is a 3×2 mosaic of square cells: four ink cells that flip with the
theme (near-black on light, bone-white on dark), the orange "pulse" cell in the top
middle, and the blue "field" cell in the bottom right, both fixed by the Rangefinder
seed. It appears as the favicon and as the PixelMark in the top bar.

When the admin panel (TABULARIUM) and the resume builder (EPITOMA) became standalone
sister repositories, both initially shipped VITA's favicon verbatim. The owner asked
for marks of their own, derived "by expanding or adding" to VITA's icon, so the three
apps read as one family while staying tellable apart in a browser tab strip.

## Options considered

- **Unrelated icons per app.** Rejected: the kinship is the point; three arbitrary
  marks would hide that the apps share one record and one design language.
- **Keep VITA's mark everywhere.** Rejected: three identical favicons make the tabs
  indistinguishable, and each app has its own identity to carry.
- **A shared genome with one functional mutation per sister.** Chosen.

## Decision

The mosaic is treated as shared DNA with fixed rules: the same 3×2 grid, cell size,
and spacing; the pulse and field accents in the same positions; the same
theme-flipping ink. Each sister earns exactly one mutation, and that mutation must
name the app's function and change the mark's silhouette, because at favicon size
(16px) only silhouette survives; fine detail does not.

- **TABULARIUM** adds a lintel: a single bar laid across the top of the mosaic. Under
  a roof, the six cells read as the columns of a records hall, after the Roman
  Tabularium where the state archive lived. The admin panel is the building that
  keeps the record.
- **EPITOMA** cuts: the top-right cell loses its outer half along the diagonal,
  leaving a dog-eared page corner. An epitoma is an abridgment, a document distilled
  from a larger record, which is what a resume is to the portfolio. It is the one
  mark whose mutation subtracts, echoing what the app does to the record.

The family reads: VITA is the record, TABULARIUM is the building that keeps it,
EPITOMA is the page taken from it.

## Consequences

Each repo carries its mark twice, in `public/favicon.svg` and in an in-app BrandMark
component, and the two must stay in sync by hand. Any future sister follows the same
rules: one silhouette-level mutation tied to its function, accents untouched, ink
flip preserved in every new rendering surface. The seed colors in the marks do not
follow a custom palette; they are the family's fixed signature.
