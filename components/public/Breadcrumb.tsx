import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol
        className="flex items-center gap-1 flex-wrap text-sm"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Home */}
        <li
          className="flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            itemProp="item"
            className="text-blue-400/55 hover:text-blue-300 transition-colors flex items-center"
            aria-label="Beranda"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only" itemProp="name">Beranda</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          const pos    = i + 2;
          return (
            <li
              key={i}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronRight className="w-3.5 h-3.5 text-blue-200/20 shrink-0" />
              {isLast ? (
                <span
                  className="text-blue-200/55 truncate max-w-[240px] sm:max-w-none"
                  aria-current="page"
                  itemProp="name"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href!}
                  itemProp="item"
                  className="text-blue-400/55 hover:text-blue-300 transition-colors"
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(pos)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
