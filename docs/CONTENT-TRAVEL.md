# Content Model: Travel Ledgers

The travel ledgers of the record, carved from the content model's door. Field semantics and shared rules live in [CONTENT-MODEL.md](CONTENT-MODEL.md).

## `trips`: City-level travel entries

Folder: `src/content/travel/cities/`

```yaml
---
city: Tokyo
country: Japan # must match a country entry's `name` field exactly
flag: 🇯🇵 # data only; not rendered (flag emoji fail on Windows, code chips were retired)
image: https://...
coordinates: "35.6762° N, 139.6503° E"
---
Travel notes in Markdown.
```

---

## `countries`: Country-level travel entries

Folder: `src/content/travel/countries/`

```yaml
---
name: Japan
code: JP # data only; kept for future use, not rendered
flag: 🇯🇵 # data only; not rendered (flag emoji fail on Windows, code chips were retired)
image: https://...
years: "2023, 2024"
visited: true
---
Country notes in Markdown.
```

---
