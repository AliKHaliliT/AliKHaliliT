import { useState, useMemo } from "react";
import { m } from "framer-motion";
import { BookOpen, Star, Book } from "lucide-react";
import { BookModal } from "./BookModal";
import { useContent, Book as BookItem } from "@/entities/record";
import { PageHeader, FilterBar, EmptyState, Badge } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

/** The library: every book, filterable by reading status. */
export const LibraryPage = () => {
  const { books } = useContent();
  const [filter, setFilter] = useState("All Books");
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  const stats = useMemo(() => {
    if (!books) return { reading: 0, read: 0, toRead: 0 };
    return {
      reading: books.filter((b) => b.status === "Reading").length,
      read: books.filter((b) => b.status === "Read").length,
      toRead: books.filter((b) => b.status === "To Read").length,
    };
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    if (filter === "All Books") return books;
    return books.filter((b) => b.status === filter);
  }, [filter, books]);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Life"
          title="Library"
          meta={`${books?.length ?? 0} book${books?.length !== 1 ? "s" : ""}`}
          description={usePageDescription("library")}
        />

        {/* Status grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "To Read", value: stats.toRead },
            { label: "Reading", value: stats.reading },
            { label: "Read", value: stats.read },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-line bg-card p-5"
            >
              <p className="font-mono text-eyebrow uppercase text-muted">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-serif font-semibold text-ink">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Books Section: pills only for shelves that have books */}
        {[stats.reading, stats.read, stats.toRead].filter(Boolean).length > 1 && (
          <FilterBar
            className="mb-6"
            value={filter}
            onChange={setFilter}
            options={[
              "All Books",
              ...["To Read", "Reading", "Read"].filter(
                (s) => (books ?? []).some((b) => b.status === s)
              ),
            ].map((t) => ({ value: t, label: t }))}
          />
        )}

        {filteredBooks.length === 0 ? (
          <EmptyState
            icon={Book}
            title="No books found."
            hint={
              filter !== "All Books"
                ? "Try a different filter."
                : "The shelves are still being stocked."
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <m.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className="aspect-[2/3] rounded-ctl overflow-hidden border border-line bg-surface">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <BookOpen size={32} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div>
                  <Badge tone={book.status === "Reading" ? "canopy" : "neutral"}>
                    {book.status}
                  </Badge>
                  <h3 className="mt-2 font-semibold text-ink line-clamp-1 group-hover:text-signal transition-colors duration-150">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {book.author}
                  </p>

                  {book.rating && book.rating > 0 && (
                    <div className="flex gap-0.5 mt-1 text-signal">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < (book.rating || 0) ? "currentColor" : "none"}
                          className={
                            i >= (book.rating || 0)
                              ? "text-line-strong"
                              : ""
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </m.div>
            ))}
          </div>
        )}

      </m.div>

      <BookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
};
