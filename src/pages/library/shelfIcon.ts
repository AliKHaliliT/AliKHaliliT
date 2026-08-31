import { BookOpen, Clapperboard, Gamepad2, Library, MonitorPlay, Sparkles, type LucideIcon } from "lucide-react";

/**
 * The glyph a shelf wears, keyed by its URL slug. Mediums are open strings,
 * so unknown shelves fall back to the library mark rather than breaking.
 */
export const shelfIcon = (slug: string): LucideIcon =>
  ({
    books: BookOpen,
    film: Clapperboard,
    series: MonitorPlay,
    anime: Sparkles,
    game: Gamepad2,
  })[slug] ?? Library;
