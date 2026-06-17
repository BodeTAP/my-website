type JsonLdObject = Record<string, unknown>;

export type JsonLdValue = JsonLdObject | JsonLdObject[];

export function serializeJsonLd(data: JsonLdValue) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data, id }: { data: JsonLdValue; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function getPublicSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
    return "https://mfweb.maffisorp.id";
  }
  return trimmed;
}

export function buildPublicBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  const siteUrl = getPublicSiteUrl();
  return buildBreadcrumbJsonLd(items.map((item) => ({
    name: item.name,
    item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
  })));
}
