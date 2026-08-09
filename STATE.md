# State

Current status of this deployment (Ali's personal VITA site). Read this before starting
work. Format and rules: see [docs/CONVENTIONS.md](docs/CONVENTIONS.md).

## Now

- CI greps every tracked byte for an em dash before anything installs, so the prose ban
  is checked rather than remembered (2026-08-08).
- The style's test contract is adopted, and the suites already satisfied it. Suites mirror
  `src/`, collaborators are substituted only at a seam, no coverage threshold is imposed, and a
  check found no module mocking anywhere here (2026-08-05). The fifth command is now a named
  `typecheck` script rather than a bare `tsc -b`, so CI and the guide run the same thing.
  Decision 0007 carries the reasoning, and two details of this project's CI travelled
  upstream into the style in exchange.
- The deployment is level with the refactored template: sliced layers with the layer rule
  checked by ESLint, semantic design tokens behind a `data-theme` attribute, both record
  doors checked against a contract, the style-owned rulebook, and a doc comment on every
  export (2026-08-04). Decision 0006 carries the reasoning and names the one adaptation
  that must survive every future copy.
- The profile page got its poster: an animated hand-built SVG wall (pixel tag, crew
  stickers, marquee) that points every click at the site, replacing the placeholder and
  its third-party typing service (2026-08-01).
- The docs baseline synced with the 2026-08-01 My-Styles changes, adopting the sharpened
  human-prose rule and the public-audience rule with the untracked LOCAL.md ledger; the
  sensitive specifics this file used to carry moved there (2026-08-01).
- The real record moved in: this repo carries the VITA app with Ali's content as the seed,
  replacing the untracked store that used to live beside the template (2026-07-28).

## Next

- Ali supplies: real author lists for the two Iranian conference papers (currently
  "et al."), two pending experience entries when they turn official (details local), any
  competition wins, a rating for The Gambler, and bodies for the anime and movies
  interests (2026-07-28). The Turkey, Toronto, and Calgary dates all landed as April
  2026, month precision by the privacy rule (2026-08-01), and the atlas plus the book
  cover got real, permissively licensed images (2026-08-02).
- Owner-voice drafts: site description and tagline; the bio is done (2026-07-28).

## Deferred

- A skills addition waits on a publication going public; details local (2026-07-28).
- The `/skills` setup notes stay empty until wanted; hardware is deliberately excluded
  (2026-07-28).

## Blocked

- Nothing blocked.
