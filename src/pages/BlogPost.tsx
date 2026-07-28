import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Markdown } from "@/components/ui/Markdown";
import { formatFullDate } from "@/lib/dates";
import { hostLabel } from "@/lib/text";
import { useSiteIdentity } from "@/lib/site";

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { blog } = useContent();
  const site = useSiteIdentity();

  const post = blog.find((p) => p.slug === slug || String(p.id) === slug);

  // The post's own name in the tab; runs after TitleSync's route pass.
  useEffect(() => {
    if (post?.title) document.title = `${post.title} · ${site.title}`;
  }, [post?.title, site]);

  const index = post ? blog.findIndex((p) => p.id === post.id) : -1;
  const newer = index > 0 ? blog[index - 1] : null;
  const older = index >= 0 && index < blog.length - 1 ? blog[index + 1] : null;

  const formatDate = formatFullDate;

  if (!post) {
    return (
      <div className="space-y-8 pb-12">
        <EmptyState
          icon={BookOpen}
          title="Post not found"
          hint="The post you're looking for doesn't exist."
        />
        <div className="flex justify-center">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
          >
            <ArrowLeft size={16} />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      <m.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl mx-auto"
      >
        <Link
          to="/blog"
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150 mb-8 group w-fit"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to blog
        </Link>

        {post.cover && (
          <div className="aspect-[2/1] rounded-card overflow-hidden mb-8 border border-[var(--color-border)]">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          {post.series && <Badge className="mb-4">{post.series}</Badge>}
          <h1 className="text-3xl md:text-[2.5rem] md:leading-[1.15] font-serif font-semibold text-[var(--color-text-primary)] mb-4 leading-tight tracking-[-0.015em]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="font-serif italic text-lg text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
            {formatDate(post.date)}
            {post.readingTime && <> · {post.readingTime} min read</>}
          </p>
        </header>

        <div className="h-px bg-[var(--color-border)] w-full mb-10" />

        {post.externalUrl ? (
          // The piece's canonical home is elsewhere: show the summary if one
          // exists, then hand the reader off instead of mirroring the text.
          <div className="space-y-8">
            {post.body?.trim() && (
              <div className="prose dark:prose-invert prose-essay mx-auto">
                <Markdown>{post.body}</Markdown>
              </div>
            )}
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="group/out flex items-center justify-between gap-4 rounded-card border border-dashed border-[var(--color-border-strong)] p-5 transition-colors hover:border-signal"
            >
              <span>
                <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  Off-site
                </span>
                <span className="font-serif text-lg leading-snug transition-colors group-hover/out:text-signal">
                  This piece lives on {hostLabel(post.externalUrl) ?? "another site"}. Read it there.
                </span>
              </span>
              <ArrowUpRight
                size={20}
                className="shrink-0 text-[var(--color-text-secondary)] transition-transform group-hover/out:-translate-y-0.5 group-hover/out:translate-x-0.5 group-hover/out:text-signal"
              />
            </a>
          </div>
        ) : (
          <div className="prose dark:prose-invert prose-essay mx-auto">
            <Markdown>
              {post.body || ""}
            </Markdown>
          </div>
        )}

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <footer className="mt-12 pt-6 border-t border-[var(--color-border)]">
            <TagList tags={post.tags} />
          </footer>
        )}

        {(newer || older) && (
          <nav
            aria-label="More writing"
            className="mt-10 grid gap-3 border-t border-dashed border-[var(--color-border)] pt-6 sm:grid-cols-2"
          >
            {newer && (
              <Link
                to={`/blog/${newer.slug}`}
                className="group rounded-card border border-[var(--color-border)] p-4 transition-colors hover:border-signal"
              >
                <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
                  Newer
                </p>
                <p className="font-serif text-base leading-snug transition-colors group-hover:text-signal">
                  {newer.title}
                </p>
              </Link>
            )}
            {older && (
              <Link
                to={`/blog/${older.slug}`}
                className="group rounded-card border border-[var(--color-border)] p-4 text-right transition-colors hover:border-signal sm:col-start-2"
              >
                <p className="mb-1.5 flex items-center justify-end gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  Older
                  <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="font-serif text-base leading-snug transition-colors group-hover:text-signal">
                  {older.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </m.article>
    </div>
  );
};
