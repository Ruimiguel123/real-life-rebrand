/**
 * Server functions the public blog routes call. They run inside the Worker
 * (during SSR, and via an RPC call on client-side navigation) and read
 * from D1 through the env stashed by server.ts.
 *
 * If the DB binding is missing (local dev, or before Cloudflare setup) they
 * return empty results rather than throwing, so the site still renders.
 */
import { createServerFn } from "@tanstack/react-start";
import { getEnv } from "./env";
import { listPublished, getPublishedBySlug, type Post, type PostSummary } from "./db";

export const fetchPublishedPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<PostSummary[]> => {
    const db = getEnv().DB;
    if (!db) return [];
    try {
      return await listPublished(db);
    } catch (err) {
      console.error("blog: listPublished failed", err);
      return [];
    }
  },
);

export const fetchPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,80}$/.test(slug))
      throw new Error("invalid slug");
    return slug;
  })
  .handler(async ({ data: slug }): Promise<Post | null> => {
    const db = getEnv().DB;
    if (!db) return null;
    try {
      return await getPublishedBySlug(db, slug);
    } catch (err) {
      console.error("blog: getPublishedBySlug failed", err);
      return null;
    }
  });
