"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavLinkProps {
  href: string;
  className?: string;
  activeClassName: string;
  inactiveClassName: string;
  children: React.ReactNode;
}

export function NavLink({ href, className, activeClassName, inactiveClassName, children }: NavLinkProps) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={clsx(className, active ? activeClassName : inactiveClassName)}
    >
      {children}
    </Link>
  );
}
