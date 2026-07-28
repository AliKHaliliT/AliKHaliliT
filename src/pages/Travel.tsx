import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Plane,
  MapPin,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { Country, Trip } from "@/types/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { TagList } from "@/components/ui/TagList";
import { Markdown } from "@/components/ui/Markdown";
import { StoryLink } from "@/components/ui/StoryLink";
import { usePageDescription } from "@/lib/pageCopy";

type DetailView =
  | { kind: "country"; data: Country }
  | { kind: "city"; data: Trip };

export const Travel = () => {
  const { trips, countries } = useContent();
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailView | null>(null);
  // Hoisted above the detail-view early return (hooks must run every render).
  const pageDescription = usePageDescription("travel");

  const stats = useMemo(() => {
    const visitedCountries = countries.filter((c) => c.visited !== false).length;
    // Count countries from trips that have no matching country entry too
    const tripCountries = new Set(trips.map((t) => t.country));
    const countryNames = new Set(countries.map((c) => c.name));
    const orphanCountries = [...tripCountries].filter(
      (c) => c && !countryNames.has(c)
    ).length;
    return {
      countries: visitedCountries + orphanCountries,
      cities: trips.length,
    };
  }, [countries, trips]);

  // Cities grouped by country name, newest trip first (undated last).
  const citiesByCountry = useMemo(() => {
    const map: Record<string, Trip[]> = {};
    trips.forEach((t) => {
      const key = t.country || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
    );
    return map;
  }, [trips]);

  // Countries with no entry in the countries list (inferred from trips)
  const orphanCountries = useMemo(() => {
    const knownNames = new Set(countries.map((c) => c.name));
    const seen = new Set<string>();
    const result: { name: string; cities: Trip[] }[] = [];
    trips.forEach((t) => {
      if (!t.country || knownNames.has(t.country) || seen.has(t.country))
        return;
      seen.add(t.country);
      result.push({
        name: t.country,
        cities: citiesByCountry[t.country] || [],
      });
    });
    return result;
  }, [countries, trips, citiesByCountry]);

  // The atlas reads like the projects record: countries grouped by the last
  // visited year (from `years`, else the newest dated city), newest first,
  // with undated countries closing the list.
  const groupedCountries = useMemo(() => {
    const yearOf = (c: Country): string => {
      const inYears = (c.years ?? "").match(/\d{4}/g);
      if (inYears?.length) return String(Math.max(...inYears.map(Number)));
      const cityDates = (citiesByCountry[c.name] ?? [])
        .map((t) => t.date)
        .filter((d): d is string => Boolean(d))
        .sort();
      return cityDates.length ? cityDates[cityDates.length - 1].slice(0, 4) : "Undated";
    };
    const groups = new Map<string, Country[]>();
    countries.forEach((c) => {
      const y = yearOf(c);
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(c);
    });
    return [...groups.entries()].sort((a, b) => {
      if (a[0] === "Undated") return 1;
      if (b[0] === "Undated") return -1;
      return b[0].localeCompare(a[0]);
    });
  }, [countries, citiesByCountry]);

  if (detail) {
    return (
      <div className="space-y-8 pb-12">
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to travel log
        </button>

        {detail.kind === "country" && (
          <CountryDetail
            country={detail.data}
            cities={citiesByCountry[detail.data.name] || []}
            onCityClick={(city) => setDetail({ kind: "city", data: city })}
          />
        )}
        {detail.kind === "city" && <CityDetail city={detail.data} />}
      </div>
    );
  }

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Life"
          title="Travel log"
          meta={`${stats.countries} countries · ${stats.cities} cities`}
          description={pageDescription}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-[var(--color-text-secondary)] mb-2">
              <Globe size={12} className="shrink-0" />
              Countries
            </p>
            <p className="text-2xl font-serif font-semibold text-[var(--color-text-primary)]">
              {stats.countries}
            </p>
          </div>
          <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-[var(--color-text-secondary)] mb-2">
              <MapPin size={12} className="shrink-0" />
              Cities
            </p>
            <p className="text-2xl font-serif font-semibold text-[var(--color-text-primary)]">
              {stats.cities}
            </p>
          </div>
        </div>

        {/* Country list (with entries), grouped by last visited year */}
        <div className="space-y-8">
          {groupedCountries.map(([year, group]) => (
            <section key={year}>
              <h2 className="mb-2 flex items-baseline gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                {year}
                <span className="text-[10px] normal-case tracking-normal opacity-70">
                  {group.length} {group.length === 1 ? "country" : "countries"}
                </span>
              </h2>
              <div className="space-y-4">
              {group.map((country) => {
            const cities = citiesByCountry[country.name] || [];
            const isExpanded = expandedCountry === country.name;

            return (
              <m.div
                key={country.id}
                layout
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-card overflow-hidden"
              >
                {/* Country header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[var(--color-background)]/60 transition-colors duration-150"
                  onClick={() =>
                    setExpandedCountry(isExpanded ? null : country.name)
                  }
                >
                  {country.image && (
                    <div className="w-20 h-14 rounded-ctl overflow-hidden flex-shrink-0 bg-[var(--color-background)]">
                      <img
                        src={country.image}
                        alt={country.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-serif font-semibold text-[var(--color-text-primary)]">
                        {country.name}
                      </h2>
                      {country.years && (
                        <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                          {country.years}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {cities.length} {cities.length === 1 ? "city" : "cities"}
                      </span>
                      <TagList tags={country.tags?.slice(0, 3)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {country.body && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetail({ kind: "country", data: country });
                        }}
                        className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-signal px-2 py-1 rounded-ctl transition-colors duration-150"
                      >
                        Notes
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-[var(--color-text-secondary)]" />
                    ) : (
                      <ChevronDown size={18} className="text-[var(--color-text-secondary)]" />
                    )}
                  </div>
                </div>

                {/* Cities accordion */}
                <AnimatePresence>
                  {isExpanded && cities.length > 0 && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[var(--color-border)]"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        {cities.map((city) => (
                          <CityCard
                            key={city.id}
                            city={city}
                            onClick={() =>
                              setDetail({ kind: "city", data: city })
                            }
                          />
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
              </div>
            </section>
          ))}

          {/* Orphan countries (trips without a countries entry) */}
          {orphanCountries.map(({ name, cities }) => {
            const isExpanded = expandedCountry === name;
            return (
              <m.div
                key={name}
                layout
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-card overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[var(--color-background)]/60 transition-colors duration-150"
                  onClick={() => setExpandedCountry(isExpanded ? null : name)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-serif font-semibold text-[var(--color-text-primary)]">
                        {name}
                      </h2>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                      <MapPin size={12} />
                      {cities.length} {cities.length === 1 ? "city" : "cities"}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-[var(--color-text-secondary)]" />
                  ) : (
                    <ChevronDown size={18} className="text-[var(--color-text-secondary)]" />
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[var(--color-border)]"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        {cities.map((city) => (
                          <CityCard
                            key={city.id}
                            city={city}
                            onClick={() =>
                              setDetail({ kind: "city", data: city })
                            }
                          />
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>

        {countries.length === 0 && trips.length === 0 && (
          <EmptyState icon={Plane} title="No travels logged yet." />
        )}
      </m.div>
    </div>
  );
};

/* ── Sub-components ── */

function CityCard({
  city,
  onClick,
}: {
  city: Trip;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group cursor-pointer rounded-ctl overflow-hidden relative aspect-[4/3] bg-[var(--color-background)] text-left w-full"
    >
      {city.image && (
        <img
          src={city.image}
          alt={city.city}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
        />
      )}
      {/* Legibility gradient over the photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-3 left-3 text-white">
        <p className="font-serif font-semibold text-base leading-tight">{city.city}</p>
        {city.date && (
          <p className="font-mono text-[10px] text-white/70 mt-1 flex items-center gap-1">
            <Calendar size={10} />
            {city.date}
          </p>
        )}
      </div>
    </button>
  );
}

function CountryDetail({
  country,
  cities,
  onCityClick,
}: {
  country: Country;
  cities: Trip[];
  onCityClick: (city: Trip) => void;
}) {
  return (
    <div className="space-y-8">
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
          <Markdown>
            {country.body || ""}
          </Markdown>
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
              <CityCard key={city.id} city={city} onClick={() => onCityClick(city)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CityDetail({ city }: { city: Trip }) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {city.image && (
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
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {city.country}
              </span>
              {city.date && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {city.date}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {city.coordinates && (
        <p className="font-mono text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
          <Navigation size={13} />
          {city.coordinates}
        </p>
      )}

      <div className="prose dark:prose-invert prose-essay">
        <Markdown>
          {city.body || city.highlights || ""}
        </Markdown>
      </div>
      {city.story && <StoryLink to={city.story}>Read the full story</StoryLink>}
    </div>
  );
}
