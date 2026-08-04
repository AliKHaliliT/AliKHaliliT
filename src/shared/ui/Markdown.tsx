import { lazy, Suspense } from "react";

// react-markdown + remark-gfm are the heaviest main-chunk dependencies, used
// only to render body text. Loading them lazily moves them into their own
// chunk; the body pops in once the chunk arrives (cached thereafter).
const LazyMarkdown = lazy(async () => {
  const [{ default: ReactMarkdown }, { default: remarkGfm }] =
    await Promise.all([import("react-markdown"), import("remark-gfm")]);
  const Renderer = ({ children }: { children: string }) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
  );
  return { default: Renderer };
});

/** GFM markdown body renderer (code-split). */
export const Markdown = ({ children }: { children: string }) => (
  <Suspense fallback={null}>
    <LazyMarkdown>{children}</LazyMarkdown>
  </Suspense>
);
