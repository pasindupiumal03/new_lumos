import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true,
  trimValues: true,
});

export function toISODate(input?: string): string {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function extractThumbnail(item: any): string | null {
  const media = item["media:content"] || item.media || item["media:thumbnail"];
  if (media && typeof media === "object") {
    if (Array.isArray(media)) {
      const first = media.find((m: any) => m.url) || media[0];
      if (first?.url) return first.url;
    } else if (media.url) {
      return media.url;
    }
  }

  const enclosure = item.enclosure;
  if (enclosure?.url && typeof enclosure.url === "string") {
    const t = (enclosure.type || "").toLowerCase();
    if (t.startsWith("image/")) return enclosure.url;
    if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(enclosure.url)) return enclosure.url;
  }

  const content = item["content:encoded"] || item.content || item.summary || "";
  if (typeof content === "string") {
    const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function mapFeedItem(raw: any) {
  const link =
    (typeof raw.link === "string" ? raw.link : raw.link?.href) ||
    raw.guid?.["#text"] ||
    raw.guid ||
    "";

  const title = raw.title?.["#text"] || raw.title || "Untitled";
  const description =
    raw.description?.["#text"] ||
    raw.description ||
    raw.summary ||
    raw["content:encoded"] ||
    "";

  const pub =
    raw.pubDate || raw.published || raw.updated || raw["dc:date"] || raw.date || "";

  let domain = "";
  try {
    domain = new URL(link).hostname.replace(/^www\./, "");
  } catch {}

  return {
    id: (raw.guid?.["#text"] || raw.guid || link || title) as string,
    title,
    description,
    link,
    publishedAt: toISODate(pub),
    domain,
    thumbnail: extractThumbnail(raw),
  };
}

export function parseRssXml(xml: string) {
  const data = parser.parse(xml);
  if (data?.rss?.channel?.item) {
    const items = Array.isArray(data.rss.channel.item) ? data.rss.channel.item : [data.rss.channel.item];
    return items.map(mapFeedItem);
  }
  if (data?.feed?.entry) {
    const entries = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];
    return entries.map(mapFeedItem);
  }
  if (Array.isArray(data?.channel?.item)) return data.channel.item.map(mapFeedItem);
  return [];
}
