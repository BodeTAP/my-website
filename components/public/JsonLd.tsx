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
