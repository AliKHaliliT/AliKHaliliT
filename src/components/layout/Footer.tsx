import { Link } from "react-router-dom";
import { useVisibleNav } from "@/lib/useVisibleNav";
import { useContent } from "@/context/ContentContext";
import { searchShortcutLabel } from "@/lib/platform";
import { parseProfileLinks } from "@/lib/text";
import { useSiteIdentity } from "@/lib/site";
import { ObfuscatedEmail } from "@/components/ui/ObfuscatedEmail";
import { PixelBand } from "@/components/ui/PixelBand";

const openSearch = () => document.dispatchEvent(new Event("open-search"));

const chipClass =
  "rounded-ctl border border-[color-mix(in_srgb,var(--color-footer-ink)_35%,transparent)] px-2 py-[3px] font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] text-[var(--color-footer-ink)] transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-field hover:text-field active:scale-95";

const colHead =
  "mb-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-footer-ink)_55%,transparent)]";

const colLink =
  "block py-[5px] text-sm text-[color-mix(in_srgb,var(--color-footer-ink)_82%,transparent)] transition-[color,transform] duration-150 hover:translate-x-0.5 hover:text-field";

/**
 * The dossier back cover: sign-off, socials, and the complete site map -
 * every route on the site is reachable from here.
 */
export const Footer = () => {
  const { settings } = useContent();
  const site = useSiteIdentity();
  const owner = settings.name || site.author;
  const year = new Date().getFullYear();
  // Owner-voice lines are editable via the site identity; empty falls back to
  // the house wording so a fresh deployment still signs off properly.
  const taglineLines = (site.tagline ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const colophon = site.colophon?.trim() || (owner ? `A dossier by ${owner}` : site.name);
  const visibleNav = useVisibleNav();
  const [career, writing, personal] = [
    visibleNav.find((g) => g.label === "Career"),
    visibleNav.find((g) => g.label === "Writing"),
    visibleNav.find((g) => g.label === "Life"),
  ];

  const socials = [
    { label: "GitHub", url: settings.github },
    { label: "LinkedIn", url: settings.linkedin },
    { label: "Twitter", url: settings.twitter },
    { label: "Scholar", url: settings.scholar },
    { label: "Medium", url: settings.medium },
    { label: "ORCID", url: settings.orcid },
    { label: "Website", url: settings.website },
    // Owner-defined links join the fixed set: any platform belongs here.
    // Email addresses (the profile's and any mailto custom link) render as
    // obfuscated copy-chips instead of scrapeable mailto anchors.
    ...parseProfileLinks(settings.links),
    { label: "Email", url: settings.email ? `mailto:${settings.email}` : undefined },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer id="site-footer" className="relative mt-20">
      <PixelBand offset={7} />
      <div className="bg-[var(--color-footer)] text-[var(--color-footer-ink)]">
        <div className="mx-auto max-w-[1180px] px-5 pb-10 pt-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="m-0 font-serif text-[clamp(1.8rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                {taglineLines.length > 0 ? (
                  taglineLines.map((line, i) =>
                    i === taglineLines.length - 1 && taglineLines.length > 1 ? (
                      <em key={line} className="font-normal not-italic text-field">
                        <i className="font-serif italic">{line}</i>
                      </em>
                    ) : (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    )
                  )
                ) : (
                  <>
                    Built from {settings.location?.split(",")[0].trim() || "here"},
                    <br />
                    <em className="font-normal not-italic text-field">
                      <i className="font-serif italic">logged everywhere.</i>
                    </em>
                  </>
                )}
              </p>
              {socials.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {socials.map((s) =>
                    s.url.startsWith("mailto:") ? (
                      <ObfuscatedEmail
                        key={`${s.label}-${s.url}`}
                        email={s.url.slice(7)}
                        title={`${s.label} · click to copy`}
                        className={chipClass}
                      />
                    ) : (
                      <a
                        key={`${s.label}-${s.url}`}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={chipClass}
                      >
                        {s.label}
                      </a>
                    )
                  )}
                </div>
              )}
            </div>

            <nav aria-label="Career pages">
              {career && (
                <>
                  <h4 className={colHead}>Career</h4>
                  {career.items.map((i) => (
                    <Link key={i.path} to={i.path} className={colLink}>
                      {i.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <nav aria-label="Writing and life pages">
              {writing && (
                <>
                  <h4 className={colHead}>Writing</h4>
                  {writing.items.map((i) => (
                    <Link key={i.path} to={i.path} className={colLink}>
                      {i.label}
                    </Link>
                  ))}
                </>
              )}
              {personal && (
                <>
                  <h4 className={`${colHead} ${writing ? "mt-7" : ""}`}>Life</h4>
                  {personal.items.map((i) => (
                    <Link key={i.path} to={i.path} className={colLink}>
                      {i.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <nav aria-label="System pages">
              <h4 className={colHead}>System</h4>
              <button onClick={openSearch} className={`${colLink} text-left`}>
                Search · {searchShortcutLabel()}
              </button>
            </nav>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[color-mix(in_srgb,var(--color-footer-ink)_25%,transparent)] pt-5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--color-footer-ink)_55%,transparent)]">
            <span>
              {colophon} · {year}
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="uppercase tracking-[0.1em] transition-[color,transform] duration-150 hover:-translate-y-px hover:text-field active:scale-95"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
