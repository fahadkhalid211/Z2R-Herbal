import Link from "next/link";
import { User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CartLink } from "@/components/cart/CartWidgets";
import { WishlistLink } from "@/components/cart/Wishlist";
import { cn } from "@/lib/cn";
import type { HeaderMenus, SearchItem } from "@/lib/menu";
import type { SiteConfig } from "@/services/types";
import { MobileNav } from "./MobileNav";
import { NavMenu } from "./NavMenu";
import { NavLink } from "./NavLink";
import { SearchDialog } from "./SearchDialog";

interface HeaderProps {
  nav: SiteConfig["nav"];
  menus: HeaderMenus;
  search: SearchItem[];
}

const SECTION_PATHS: Record<
  "shop" | "ingredients" | "help",
  (site: SiteConfig["nav"][number], menus: HeaderMenus) => string[]
> = {
  shop: (item) => [item.href, "/collections", "/products"],
  ingredients: (item) => [item.href],
  help: (item, menus) => [item.href, ...menus.help.flatMap((g) => g.links.map((l) => l.href))],
};

const iconButton =
  "grid size-10 place-items-center rounded-full text-[#1d1a16] xl:size-[clamp(40px,2.75vw,48px)] transition-[color,background-color,scale] duration-(--dur-fast) hover:bg-forest-600/10 hover:text-forest-600 active:scale-95";

const navLink =
  "flex items-center rounded-full px-[1.3em] py-[0.42em] leading-[1.5] whitespace-nowrap transition-colors duration-(--dur-fast)";
const navActive =
  "bg-[linear-gradient(180deg,#257a0f,#1a5e07)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_14px_-8px_rgb(26_94_7/0.9)]";
const navIdle = "text-[#2a241d] hover:text-forest-600";

export function Header({ nav, menus, search }: HeaderProps) {
  return (
    <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="nav-shell pointer-events-auto relative h-14 xl:h-[4.25vw] xl:max-h-[82px] xl:min-h-[56px]">
        <span aria-hidden="true" className="nav-bg absolute inset-0">
          <span className="nav-pill absolute inset-0" />
          <span className="nav-tab absolute left-0" />
          <span className="nav-fillet nav-fillet--top absolute" />
          <span className="nav-fillet nav-fillet--bottom absolute" />
        </span>

        <div className="relative flex h-full items-center pr-2 xl:pr-[2.9%]">
          <Link
            href="/"
            aria-label="Z2R Herbal, home"
            className="relative z-10 flex w-[104px] shrink-0 justify-center self-start pt-1 xl:w-[18%] xl:pt-0"
          >
            <Logo alt="" className="logo-img h-[60px] xl:h-[5.44vw] xl:max-h-[104px]" />
          </Link>

          <nav aria-label="Main" className="ml-[6.6%] hidden shrink-0 xl:block">
            <ul className="flex items-center gap-[0.3vw] text-[clamp(13px,0.94vw,18px)] font-medium">
              {nav.map((item) =>
                item.menu === "shop" && menus.shop.groups.length > 0 ? (
                  <NavMenu
                    key={item.href}
                    label={item.label}
                    size="wide"
                    activePrefixes={SECTION_PATHS.shop(item, menus)}
                    groups={menus.shop.groups}
                    feature={menus.shop.feature}
                  />
                ) : item.menu === "ingredients" && menus.ingredients.length > 0 ? (
                  <NavMenu
                    key={item.href}
                    label={item.label}
                    activePrefixes={SECTION_PATHS.ingredients(item, menus)}
                    groups={menus.ingredients}
                    lead={{
                      title: "Our Ingredients",
                      text: "Every oil in our range is built around one botanical ingredient.",
                      link: { label: "All ingredients", href: item.href },
                    }}
                  />
                ) : item.menu === "help" && menus.help.length > 0 ? (
                  <NavMenu
                    key={item.href}
                    label={item.label}
                    activePrefixes={SECTION_PATHS.help(item, menus)}
                    groups={menus.help}
                  />
                ) : (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      className={navLink}
                      activeClassName={navActive}
                      inactiveClassName={navIdle}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <span aria-hidden="true" className="ml-[3.9%] hidden h-[38%] w-px shrink-0 bg-[#564c42] xl:block" />

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5 xl:ml-[4%] xl:gap-[0.6vw]">
            <SearchDialog items={search} buttonClass={iconButton} />
            <Link
              href="/account"
              prefetch={false}
              aria-label="Account"
              className={cn(iconButton, "hidden sm:grid")}
            >
              <User className="nav-icon" strokeWidth={1.7} />
            </Link>
            <WishlistLink className={cn(iconButton, "hidden sm:grid")} />
            <CartLink className={iconButton} />
            <MobileNav nav={nav} menus={menus} />
          </div>
        </div>
      </div>
    </header>
  );
}
