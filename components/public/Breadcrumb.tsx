import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1 flex-wrap text-sm">
        {/* Home */}
        <li className="flex items-center">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-200 transition-colors flex items-center"
            aria-label="Beranda"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Beranda</span>
          </Link>
        </li>

        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={i}
              className="flex items-center gap-1"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {isLast ? (
                <span
                  className="text-slate-300 font-medium truncate max-w-[240px] sm:max-w-none"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href!}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
