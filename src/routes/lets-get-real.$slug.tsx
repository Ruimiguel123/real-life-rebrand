import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE_URL, KELLY_EMAIL } from "@/config/simplepractice";
import { fetchPostBySlug } from "@/blog/server-fns";
import { BeginYourCare } from "@/components/BeginYourCare";

export const Route = createFileRoute("/lets-get-real/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPostBySlug({ data: params.slug });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData: post }) => {
    if (!post) return {};
    const url = `${SITE_URL}/lets-get-real/${post.slug}`;
    const image = post.cover_url
      ? `${SITE_URL}${post.cover_url}`
      : `${SITE_URL}/og-image.jpg`;
    return {
      meta: [
        { title: `${post.title} | Real. Life Healing` },
        { name: "description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:image", content: image },
        ...(post.published_at
          ? [{ property: "article:published_time", content: post.published_at }]
          : []),
        { property: "article:modified_time", content: post.updated_at },
        { property: "article:author", content: "Kelly Day" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PostNotFound() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-display text-base uppercase tracking-[0.32em] text-honey">
          Let's get real
        </p>
        <h1 className="mt-6 font-serif text-4xl text-evergreen">
          That article isn't here.
        </h1>
        <p className="mt-4 text-forest">
          It may have been moved or unpublished.
        </p>
        <Link
          to="/lets-get-real"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-honey px-6 py-3 text-sm font-medium text-accent-foreground transition hover:brightness-95"
        >
          Back to all articles
        </Link>
      </div>
    </section>
  );
}

function PostPage() {
  const post = Route.useLoaderData();
  const url = `${SITE_URL}/lets-get-real/${post.slug}`;

  const articleJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    ...(post.cover_url ? { image: `${SITE_URL}${post.cover_url}` } : {}),
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: "Kelly Day",
      jobTitle: "Licensed Mental Health Counselor (LMHC, NCC)",
      email: KELLY_EMAIL,
    },
    publisher: { "@id": `${SITE_URL}/#practice` },
    isPartOf: { "@type": "Blog", name: "Let's Get Real", url: `${SITE_URL}/lets-get-real` },
    mainEntityOfPage: url,
  });

  return (
    <>
      <article className="bg-cream">
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-8 md:pt-24">
          <Link
            to="/lets-get-real"
            className="text-xs uppercase tracking-[0.22em] text-forest/70 hover:text-honey"
          >
            ← Let's get real
          </Link>
          <p className="mt-8 font-display text-[0.7rem] uppercase tracking-[0.28em] text-honey">
            {formatDate(post.published_at)} · Kelly Day, LMHC, NCC
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-evergreen md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-6 font-serif text-xl italic leading-relaxed text-forest">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        {post.cover_url ? (
          <div className="mx-auto max-w-5xl px-6">
            <img
              src={post.cover_url}
              alt={post.cover_alt ?? ""}
              width={1600}
              height={900}
              className="h-64 w-full rounded-3xl object-cover shadow-sm md:h-[26rem]"
            />
          </div>
        ) : null}

        {/* body_html is sanitized server-side on save (src/blog/sanitize.ts)
            to a small allow-list of tags, so rendering it here is safe. */}
        <div
          className="prose-rlh mx-auto max-w-3xl px-6 py-12 md:py-16"
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />

        <div className="mx-auto max-w-3xl px-6 pb-20">
          <div className="rounded-3xl bg-sand/60 p-8 text-evergreen">
            <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-honey">
              About the author
            </p>
            <p className="mt-3 font-serif text-lg leading-relaxed">
              Kelly Day, LMHC, NCC, is a licensed mental health counselor and
              the founder of Real. Life Healing. Nothing here is a substitute
              for care; if something in this article lands close to home,{" "}
              <Link to="/getting-started" hash="begin" className="text-honey hover:underline">
                reach out
              </Link>
              . If you are in crisis, call or text <strong>988</strong>, or{" "}
              <strong>911</strong> in an emergency.
            </p>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: articleJsonLd }}
        />
      </article>

      <BeginYourCare />
    </>
  );
}
