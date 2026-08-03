import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Navigation, Plane } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Markdown } from "@/components/ui/Markdown";
import { StoryLink } from "@/components/ui/StoryLink";
import { CityCard } from "@/components/travel/CityCard";
import { useSiteIdentity } from "@/lib/site";

/**
 * The atlas detail pages. Countries and cities are real routes
 * (/travel/country/:slug, /travel/city/:slug), so opening one scrolls to the
 * top like any navigation and the browser's back button closes exactly one
 * step. The city page's back link climbs to its country when the country has
 * an entry of its own, and to the travel log otherwise.
 */

const BackLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="group flex w-fit items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-signal"
  >
    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
    {children}
  </Link>
);

const TravelNotFound = ({ what }: { what: string }) => (
  <div className="space-y-8 pb-12">
    <EmptyState
      icon={Plane}
      title={`${what} not found`}
      hint="This entry doesn't exist in the travel log."
    />
    <div className="flex justify-center">
      <BackLink to="/travel">Back to travel log</BackLink>
    </div>
  </div>
);

export const TravelCountry = () => {
  const { slug } = useParams<{ slug: string }>();
  const { countries, trips } = useContent();
  const site = useSiteIdentity();

  const country = countries.find((c) => c.slug === slug || String(c.id) === slug);
  const cities = trips
    .filter((t) => t.country === country?.name)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  // The country's own name in the tab; runs after TitleSync's route pass.
  useEffect(() => {
    if (country?.name) document.title = `${country.name} · ${site.title}`;
  }, [country?.name, site]);

  if (!country) return <TravelNotFound what="Country" />;

  return (
    <div className="space-y-8 pb-12">
      <BackLink to="/travel">Back to travel log</BackLink>

      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-8"
      >
        {country.image && (
          <div className="aspect-[3/1] rounded-card overflow-hidden">
            <img
              src={country.image}
              alt={country.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-display font-serif font-semibold text-[var(--color-text-primary)]">
                {country.name}
              </h1>
              {country.years && (
                <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-1">
                  Visited {country.years}
                </p>
              )}
            </div>
          </div>
          <div className="prose dark:prose-invert prose-essay">
            <Markdown>{country.body || ""}</Markdown>
          </div>
        </div>

        {cities.length > 0 && (
          <div>
            <h2 className="font-mono text-eyebrow uppercase text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
              <MapPin size={13} />
              Cities in {country.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </div>
          </div>
        )}
      </m.div>
    </div>
  );
};

export const TravelCity = () => {
  const { slug } = useParams<{ slug: string }>();
  const { trips, countries } = useContent();
  const site = useSiteIdentity();

  const city = trips.find((t) => t.slug === slug || String(t.id) === slug);
  const countryEntry = countries.find((c) => c.name === city?.country);

  // The city's own name in the tab; runs after TitleSync's route pass.
  useEffect(() => {
    if (city?.city) document.title = `${city.city} · ${site.title}`;
  }, [city?.city, site]);

  if (!city) return <TravelNotFound what="City" />;

  return (
    <div className="space-y-8 pb-12">
      <BackLink to={countryEntry ? `/travel/country/${countryEntry.slug}` : "/travel"}>
        {countryEntry ? `Back to ${countryEntry.name}` : "Back to travel log"}
      </BackLink>

      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-8 max-w-3xl mx-auto"
      >
        {city.image ? (
          <div className="aspect-[2/1] rounded-card overflow-hidden relative">
            <img
              src={city.image}
              alt={city.city}
              className="w-full h-full object-cover"
            />
            {/* Legibility gradient over the photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-serif font-semibold mb-2">{city.city}</h1>
              <CityMeta city={city.country} date={city.date} tone="light" />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-display font-serif font-semibold text-[var(--color-text-primary)] mb-2">
              {city.city}
            </h1>
            <CityMeta city={city.country} date={city.date} tone="muted" />
          </div>
        )}

        {city.coordinates && (
          <p className="font-mono text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
            <Navigation size={13} />
            {city.coordinates}
          </p>
        )}

        <div className="prose dark:prose-invert prose-essay">
          <Markdown>{city.body || city.highlights || ""}</Markdown>
        </div>
        {city.story && <StoryLink to={city.story}>Read the full story</StoryLink>}
      </m.div>
    </div>
  );
};

function CityMeta({ city, date, tone }: { city?: string; date?: string; tone: "light" | "muted" }) {
  return (
    <div
      className={`flex items-center gap-4 text-sm ${
        tone === "light" ? "text-white/80" : "text-[var(--color-text-secondary)]"
      }`}
    >
      {city && (
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {city}
        </span>
      )}
      {date && (
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {date}
        </span>
      )}
    </div>
  );
}
