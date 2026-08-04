import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Trip } from "../model";

/** A city tile in the atlas: photo, name, date. Links to the city's own page. */
export const CityCard = ({ city }: { city: Trip }) => {
  return (
    <Link
      to={`/travel/city/${city.slug}`}
      className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-ctl bg-surface text-left"
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
    </Link>
  );
};
