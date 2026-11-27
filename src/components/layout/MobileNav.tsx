"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ChevronDown, Heart, Menu, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cssVars } from "@/lib/css-vars";
import type { HeaderMenus, MenuGroup } from "@/lib/menu";
import clsx from "clsx";
import type { SiteConfig } from "@/services/types";

interface MobileNavProps {
  nav: SiteConfig["nav"];
  menus: HeaderMenus;
}

const VIEW_ALL = {
  shop: "Shop all products",
  ingredients: "All ingredients",
  help: "All help topics",
} as const;

const itemClass =
  "flex w-full items-center justify-between border-b border-cream-50/10 py-4 font-display text-3xl transition-colors duration-(--dur-fast) hover:text-lime-300";

export function MobileNav({ nav, menus }: MobileNavProps) {
  const currentPath = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();
  const groupsFor = (menu: SiteConfig["nav"][number]["menu"]): MenuGroup[] =>
    menu === "shop"
      ? menus.shop.groups
      : menu === "ingredients"
        ? menus.ingredients
        : menu === "help"
          ? menus.help
          : [];

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="grid size-10 place-items-center rounded-full text-[#1d1a16] transition-[color,background-color,scale] duration-(--dur-fast) hover:bg-forest-600/10 hover:text-forest-600 active:scale-95 xl:hidden"
      >
        <Menu className="size-6" strokeWidth={1.7} />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="drawer m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-forest-900 p-0 text-cream-50 xl:hidden"
      >
        <div className="container-page flex h-16 items-center justify-between">
          <Logo variant="mark" tone="cream" loading="lazy" className="h-11" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="grid size-10 place-items-center rounded-full transition-colors duration-(--dur-fast) hover:bg-cream-50/10"
          >
            <X className="size-6" strokeWidth={1.7} />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-page mt-6 pb-10">
          <ul>
            {nav.map((item, i) => {
              const groups = groupsFor(item.menu);
              const current = item.href === currentPath;
              return (
                <li key={item.href} className="drawer-item" style={cssVars({ "--i": i })}>
                  {groups.length === 0 ? (
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={close}
                      aria-current={current ? "page" : undefined}
                      className={clsx(itemClass, current ? "text-lime-300" : "text-cream-50")}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <details className="group/acc">
                      <summary
                        className={clsx(
                          itemClass,
                          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden="true"
                          className="size-6 text-cream-50/60 transition-transform group-open/acc:rotate-180"
                        />
                      </summary>
                      <div className="space-y-5 py-5">
                        <Link
                          href={item.href}
                          prefetch={false}
                          onClick={close}
                          className="inline-flex text-[0.95rem] font-semibold text-lime-300"
                        >
                          {VIEW_ALL[item.menu ?? "shop"]}
                        </Link>
                        {groups.map((group) => (
                          <div key={group.id}>
                            <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-cream-50/50 uppercase">
                              {group.title}
                            </p>
                            <ul className="mt-2 grid grid-cols-2 gap-x-4">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    prefetch={false}
                                    onClick={close}
                                    className="block py-1.5 text-[0.98rem] text-cream-50/85 transition-colors hover:text-lime-300"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
          <ul className="drawer-item mt-8 grid grid-cols-2 gap-3" style={cssVars({ "--i": nav.length })}>
            {[
              { href: "/account", label: "Account", Icon: User },
              { href: "/wishlist", label: "Wishlist", Icon: Heart },
            ].map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  prefetch={false}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-2xl border border-cream-50/15 px-4 py-3.5 text-[0.95rem] transition-colors duration-(--dur-fast) hover:border-lime-300/50 hover:text-lime-300"
                >
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
