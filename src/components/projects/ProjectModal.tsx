import { X, ExternalLink, FolderOpen } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { SafeImage } from "@/components/ui/SafeImage";
import { TagList } from "@/components/ui/TagList";
import { Project } from "@/types/content";
import { Markdown } from "@/components/ui/Markdown";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal = ({
  project,
  isOpen,
  onClose,
}: ProjectModalProps) => {
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={project.title}>
      {/* The close control gets its own strip so it never sits on the image. */}
      <div className="flex items-center justify-end border-b border-[var(--color-border)] px-3 py-2">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]"
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Hero Image: only when the entry has one; broken hot-links fall back
          to a quiet glyph instead of a browser broken-image icon. */}
      {project.image && (
        <div className="h-64 sm:h-80 w-full flex-shrink-0 bg-[var(--color-background)]">
          <SafeImage
            src={project.image}
            alt={project.title}
            fallback={
              <div className="flex h-full w-full items-center justify-center text-[var(--color-text-secondary)]">
                <FolderOpen size={40} strokeWidth={1.25} />
              </div>
            }
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-serif font-semibold text-[var(--color-text-primary)] mb-1">
              {project.title}
            </h2>
            <p className="text-[var(--color-text-secondary)] font-medium">
              {project.role}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 text-sm">
            <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
              {project.year}
            </span>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
              >
                <ExternalLink size={15} />
                Visit
              </a>
            )}
          </div>
        </div>

        <TagList tags={project.tags} className="mb-6" />

        {/* Stats readout */}
        {project.stats && (
          <p className="mb-6 rounded-ctl border border-[var(--color-border)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
            {project.stats}
          </p>
        )}

        {/* Markdown Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed prose-headings:font-serif prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-base">
          <Markdown>
            {project.body || project.fullDesc || ""}
          </Markdown>
        </div>
      </div>
    </Modal>
  );
};
