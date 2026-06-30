export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BlogToc from "@/components/store/BlogToc";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function extractH2s(html: string): { id: string; text: string }[] {
  const matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches.map((m) => {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return { id, text };
  });
}

function addIdsToH2s(html: string): string {
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (attrs.includes("id=")) return `<h2${attrs}>${content}</h2>`;
    return `<h2${attrs} id="${id}">${content}</h2>`;
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug } });
  if (!post) return { title: "Blog", robots: { index: false } };

  const p = post as unknown as Record<string, string>;
  return {
    title: p.seoTitle || post.title,
    description: p.seoDescription || post.excerpt || `Read ${post.title} on the Kentelle Skincare blog.`,
    openGraph: {
      title: p.seoTitle || post.title,
      description: p.seoDescription || post.excerpt || "",
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug } });
  if (!post || (!post.published && (post as unknown as Record<string, string>).status !== "published")) notFound();

  const p = post as unknown as Record<string, unknown>;
  const authorName = (p.authorName as string) || null;
  const authorAvatarUrl = (p.authorAvatarUrl as string) || null;
  const authorBio = (p.authorBio as string) || null;
  const readingTime = (p.readingTime as number) || null;
  const tags = (p.tags as string[]) || [];
  const body = post.body ?? "";
  const headings = extractH2s(body);
  const bodyWithIds = addIdsToH2s(body);

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* ── Hero: breadcrumbs + title + author LEFT / image RIGHT ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-start">

          {/* Left — 3 cols */}
          <div className="lg:col-span-3">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-[11px] font-body text-brand-contrast mb-6">
              <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-brand-navy transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-brand-accent truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Title */}
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-brand-navy leading-[1.1] tracking-tight mb-8">
              {post.title}
            </h1>

            {/* Author row */}
            <div className="flex flex-wrap items-center gap-4">
              {authorAvatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={authorAvatarUrl} alt={authorName ?? "Author"} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-contrast/10" />
              ) : authorName ? (
                <div className="w-12 h-12 rounded-full bg-brand-accent/30 flex items-center justify-center text-brand-navy font-heading font-bold text-lg">
                  {authorName[0]}
                </div>
              ) : null}

              {(authorName || authorBio) && (
                <div>
                  {authorName && <p className="text-sm font-heading font-bold text-brand-navy">{authorName}</p>}
                  {authorBio && <p className="text-[11px] font-body text-brand-contrast">{authorBio}</p>}
                </div>
              )}

              {(authorName || authorBio) && (publishedDate || readingTime) && (
                <span className="w-px h-8 bg-brand-contrast/20" />
              )}

              {publishedDate && (
                <span className="text-sm font-body text-brand-contrast">{publishedDate}</span>
              )}

              {publishedDate && readingTime && (
                <span className="w-px h-5 bg-brand-contrast/20" />
              )}

              {readingTime && (
                <span className="text-sm font-body text-brand-contrast">
                  {String(readingTime).padStart(2, "0")} Mins read
                </span>
              )}
            </div>
          </div>

          {/* Right — 2 cols: featured image */}
          <div className="lg:col-span-2">
            {post.coverImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-brand-contrast/8 rounded-2xl" />
            )}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-brand-contrast/10" />
      </div>

      {/* ── Body: TOC LEFT / content RIGHT ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-16 items-start">

          {/* TOC — 1 col sticky */}
          {headings.length > 0 && (
            <div className="lg:col-span-1 hidden lg:block">
              <BlogToc headings={headings} />
            </div>
          )}

          {/* Body content — 3 cols (or full width if no TOC) */}
          <div className={headings.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
            <div
              className="prose prose-lg max-w-none font-body text-brand-navy/85 leading-relaxed
                prose-headings:font-heading prose-headings:font-bold prose-headings:text-brand-navy prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:mb-5 prose-p:leading-relaxed
                prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-brand-navy prose-strong:font-bold
                prose-ul:pl-5 prose-ul:space-y-1.5
                prose-ol:pl-5 prose-ol:space-y-1.5
                prose-li:text-brand-navy/80
                prose-blockquote:border-l-4 prose-blockquote:border-brand-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-brand-contrast
                prose-img:rounded-xl prose-img:my-8
                prose-hr:border-brand-contrast/15"
              dangerouslySetInnerHTML={{ __html: bodyWithIds }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-brand-contrast/10">
                <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-body text-brand-contrast bg-brand-contrast/8 rounded-full hover:bg-brand-navy hover:text-white transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author card at bottom */}
            {authorName && (
              <div className="mt-12 p-6 bg-white border border-brand-contrast/10 rounded-xl flex gap-4 items-start">
                {authorAvatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={authorAvatarUrl} alt={authorName} className="w-14 h-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-brand-accent/30 flex items-center justify-center text-brand-navy font-heading font-bold text-xl shrink-0">
                    {authorName[0]}
                  </div>
                )}
                <div>
                  <p className="font-heading font-bold text-brand-navy">{authorName}</p>
                  {authorBio && <p className="text-sm font-body text-brand-contrast mt-1 leading-relaxed">{authorBio}</p>}
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[11px] font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
