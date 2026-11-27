import type { DataSource } from "./adapters/types";
import { parseOrThrow } from "./parse";
import { articleListSchema } from "./schemas";
import type { Article } from "./types";

export function createArticleService(source: DataSource) {
  return {
    async latest(limit: number): Promise<Article[]> {
      const articles = parseOrThrow(articleListSchema, await source.articles(limit), "articles");
      return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
    },
  };
}
