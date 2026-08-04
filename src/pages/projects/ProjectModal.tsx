import { X, ExternalLink, FolderOpen } from "lucide-react";
import { Modal, SafeImage, TagList, Markdown } from "@/shared/ui";
import { Project } from "@/entities/record";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

/** One project in detail, with its long-form description. */
export const ProjectModal = ({
  project,
  isOpen,
  onClose,
}: ProjectModalProps) => {
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={project.title}>
      {/* The close control gets its own strip so it never sits on the image. */}
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

      {/* Hero Image: only when the entry has one; broken hot-links fall back
          to a quiet glyph instead of a browser broken-image icon. */}
      {project.image && (
        <div className="h-64 sm:h-80 w-full flex-shrink-0 bg-surface">
          <SafeImage
            src={project.image}
            alt={project.title}
            fallback={
              <div className="flex h-full w-full items-center justify-center text-muted">
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
            <h2 className="text-2xl font-serif font-semibold text-ink mb-1">
              {project.title}
            </h2>
            <p className="text-muted font-medium">
              {project.role}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 text-sm">
            <span className="font-mono text-[11px] text-muted">
              {project.year}
            </span>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-muted hover:text-signal transition-colors duration-150"
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
          <p className="mb-6 rounded-ctl border border-line px-4 py-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
            {project.stats}
          </p>
        )}

        {/* Markdown Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted leading-relaxed prose-headings:font-serif prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-base">
          <Markdown>
            {project.body || project.fullDesc || ""}
          </Markdown>
        </div>
      </div>
    </Modal>
  );
};
