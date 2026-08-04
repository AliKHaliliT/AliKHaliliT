import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowLeft, Sprout } from "lucide-react";
import { useContent } from "@/entities/record";
import { Badge, TagList, EmptyState, Markdown } from "@/shared/ui";
import { useSiteIdentity } from "@/entities/site";

/** One garden note. */
export const GardenPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts } = useContent();
  const site = useSiteIdentity();

  const post = posts?.find((p) => p.slug === slug || String(p.id) === slug);

  // The note's own name in the tab; runs after TitleSync's route pass.
  useEffect(() => {
    if (post?.title) document.title = `${post.title} · ${site.title}`;
  }, [post?.title, site]);

  if (!post) {
    return (
      <div className="space-y-8 pb-12">
        <EmptyState
          icon={Sprout}
          title="Note not found"
          hint="This note doesn't exist in the garden."
        />
        <div className="flex justify-center">
          <Link
            to="/garden"
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-signal transition-colors duration-150"
          >
            <ArrowLeft size={16} />
            Back to garden
          </Link>
        </div>
      </div>
    );
  }

  const evergreen = post.postType === "Evergreen";

  return (
    <div className="space-y-8 pb-12">

      <m.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl mx-auto"
      >
        <Link
          to="/garden"
          className="flex items-center gap-2 text-sm text-muted hover:text-signal transition-colors duration-150 mb-8 group w-fit"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to garden
        </Link>

        <header className="mb-8">
          <Badge tone={evergreen ? "canopy" : "neutral"} className="mb-4">
            {post.postType || "Seedling"}
          </Badge>

          <h1 className="text-3xl md:text-[2.5rem] md:leading-[1.15] font-serif font-semibold text-ink mb-4 leading-tight tracking-[-0.015em]">
            {post.title}
          </h1>
          {post.desc && (
            <p className="font-serif italic text-lg text-muted mb-4 leading-relaxed">
              {post.desc}
            </p>
          )}
          {post.date && (
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
              {post.date}
            </p>
          )}
        </header>

        <div className="h-px bg-line w-full mb-10" />

        <div className="prose dark:prose-invert prose-essay mx-auto">
          <Markdown>
            {post.body || ""}
          </Markdown>
        </div>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <footer className="mt-12 pt-6 border-t border-line">
            <TagList tags={post.tags} />
          </footer>
        )}
      </m.article>
    </div>
  );
};
