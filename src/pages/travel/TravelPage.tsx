import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import {
  Plane,
  MapPin,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useContent, Country, Trip, CityCard } from "@/entities/record";
import { PageHeader, EmptyState, TagList } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

/**
 * The travel map: countries with their cities nested underneath.
 *
 * Countries and cities are separate collections joined here on an exact country
 * name match, so a city whose country has no entry renders under an orphan group
 * rather than disappearing.
 */
export const TravelPage = () => {
  const { trips, countries } = useContent();
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
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
          <div className="rounded-card border border-line bg-card p-5">
            <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-muted mb-2">
              <Globe size={12} className="shrink-0" />
              Countries
            </p>
            <p className="text-2xl font-serif font-semibold text-ink">
              {stats.countries}
            </p>
          </div>
          <div className="rounded-card border border-line bg-card p-5">
            <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-muted mb-2">
              <MapPin size={12} className="shrink-0" />
              Cities
            </p>
            <p className="text-2xl font-serif font-semibold text-ink">
              {stats.cities}
            </p>
          </div>
        </div>

        {/* Country list (with entries), grouped by last visited year */}
        <div className="space-y-8">
          {groupedCountries.map(([year, group]) => (
            <section key={year}>
              <h2 className="mb-2 flex items-baseline gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
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
                className="bg-card border border-line rounded-card overflow-hidden"
              >
                {/* Country header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-surface/60 transition-colors duration-150"
                  onClick={() =>
                    setExpandedCountry(isExpanded ? null : country.name)
                  }
                >
                  {country.image && (
                    <div className="w-20 h-14 rounded-ctl overflow-hidden flex-shrink-0 bg-surface">
                      <img
                        src={country.image}
                        alt={country.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-serif font-semibold text-ink">
                        {country.name}
                      </h2>
                      {country.years && (
                        <span className="font-mono text-[11px] text-muted">
                          {country.years}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {cities.length} {cities.length === 1 ? "city" : "cities"}
                      </span>
                      <TagList tags={country.tags?.slice(0, 3)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {country.body && (
                      <Link
                        to={`/travel/country/${country.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium text-muted hover:text-signal px-2 py-1 rounded-ctl transition-colors duration-150"
                      >
                        Notes
                      </Link>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-muted" />
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
                      className="overflow-hidden border-t border-line"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        {cities.map((city) => (
                          <CityCard key={city.id} city={city} />
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
                className="bg-card border border-line rounded-card overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-surface/60 transition-colors duration-150"
                  onClick={() => setExpandedCountry(isExpanded ? null : name)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-serif font-semibold text-ink">
                        {name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted flex items-center gap-1">
                      <MapPin size={12} />
                      {cities.length} {cities.length === 1 ? "city" : "cities"}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-muted" />
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-line"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        {cities.map((city) => (
                          <CityCard key={city.id} city={city} />
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
