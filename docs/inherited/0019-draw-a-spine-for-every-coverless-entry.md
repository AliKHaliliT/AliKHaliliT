# 0019. Draw a spine for every coverless entry

Status: Accepted
Date: 2026-09-01

## Context

The library's cards are portrait frames, and an entry without an image showed
the shelf's glyph centered in an empty frame. The owner's deployment carries
49 games and no covers, and asked for freely available images of the content.
Game cover art is copyrighted everywhere; Wikipedia's covers are fair-use, not
free. A probe of Wikimedia Commons over eight of the games found public-domain
wordmarks for five and nothing for three, and a wordmark is a wide black
vector that a portrait frame crops and a dark theme swallows.

## Evidence

Commons search over eight titles returned free-licensed files for Cyberpunk
2077, Elden Ring, Hades, The Witcher 3, and Horizon Zero Dawn, all logos, and
only unrelated scanned books for Stronghold Crusader, Bayonetta, and Mafia II.
Extrapolated, roughly half the shelf would have carried a logo plate beside
the other half's glyph.

## Options considered

- Public-domain logos where they exist, glyphs elsewhere. Lost because the
  result is a patchwork of wordmarks and glyphs, the logos need a padded light
  plate and a new fit mode to survive the frame and the dark theme, and half
  the shelf gains nothing.
- Copyrighted covers from a store or database under fair use. Lost because the
  record's rule is permissive licenses only, and a personal site's fair-use
  claim over 49 covers is a bet the owner never agreed to.
- Keep the glyph. Acceptable and honest, but it leaves the shelf looking
  unfinished for the one collection the owner most wanted filled.

## Decision

Draw a spine for every coverless library entry, the way the home page already
draws schematic art for a featured project without an image. `SpineArt` in
the shared UI composes the drawing from the entry's slug through a small hash,
so the same entry always looks the same and no two look alike: a seeded band
carrying the brand mosaic, ribs across the lower half, a catalogue number, the
title in the display face, the byline in mono, and the shelf's glyph as a small
stamp. Every color is a palette token. The shelf cards and the detail view use
it as the image fallback, and a real image still wins whenever one is set.

## Consequences

Every shelf reads finished with nothing licensed, and a deployment gains the
art with no content change. An owner who later adds a real cover to an entry
replaces the spine for that entry alone. The art is static by design, since a
shelf may hold dozens at once, and it is marked decorative because the card's
own text already carries the title.
