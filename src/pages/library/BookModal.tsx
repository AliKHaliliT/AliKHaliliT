import { X, BookOpen, Star } from "lucide-react";
import { Modal, Badge, Markdown, StoryLink } from "@/shared/ui";
import { Book } from "@/entities/record";

interface BookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

/** One book in detail, including the notes kept on it. */
export const BookModal = ({ book, isOpen, onClose }: BookModalProps) => {
  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={book.title}>
      {/* The close control gets its own strip so it never sits on content. */}
      <div className="flex items-center justify-end border-b border-line px-3 py-2">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-8">

        {/* Book Cover */}
        <div className="w-full md:w-1/3 flex-shrink-0">
          <div className="aspect-[2/3] rounded-ctl overflow-hidden border border-line bg-surface">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <BookOpen size={40} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Badge
            tone={book.status === "Reading" ? "canopy" : "neutral"}
            className="mb-4"
          >
            {book.status === "Reading" ? "Currently reading" : book.status}
          </Badge>

          <h2 className="text-2xl font-serif font-semibold text-ink mb-1">
            {book.title}
          </h2>
          <p className="text-muted mb-4 text-lg">
            {book.author}
          </p>

          {book.rating != null && (
            <div className="flex items-center gap-1.5 mb-6 text-signal">
              <Star size={15} className="fill-current" />
              <span className="font-mono text-[11px]">{book.rating}/5</span>
            </div>
          )}

          <div>
            <p className="font-mono text-eyebrow uppercase text-muted mb-2">
              My notes
            </p>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted leading-relaxed prose-headings:font-serif prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-base">
              <Markdown>
                {book.body || book.notes || "No notes yet."}
              </Markdown>
            </div>
            {book.story && (
              <StoryLink to={book.story} className="mt-4">
                Read the full piece
              </StoryLink>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
