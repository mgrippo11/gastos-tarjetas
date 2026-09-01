"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  ReceiptIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  TagIcon,
  UploadSimpleIcon,
  UsersIcon,
} from "@phosphor-icons/react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: ChartBarIcon },
  { href: "/expenses", label: "Gastos", Icon: ReceiptIcon },
  { href: "/income", label: "Ingresos", Icon: CurrencyDollarIcon },
  { href: "/cards", label: "Tarjetas", Icon: CreditCardIcon },
  { href: "/categories", label: "Categorías", Icon: TagIcon },
  { href: "/import", label: "Importar PDF", Icon: UploadSimpleIcon },
];

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const links = isAdmin ? [...LINKS, { href: "/admin/users", label: "Usuarios", Icon: UsersIcon }] : LINKS;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {links.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
