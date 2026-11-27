
export const siteConfig = {
  brandName: "Z2R Herbal",
  blurb:
    "A Pakistani herbal hair care brand offering a premium range of natural oils for healthier, stronger and more manageable hair.",
  nav: [
    { label: "Shop", href: "/shop", menu: "shop" as const },
    { label: "Ingredients", href: "/ingredients", menu: "ingredients" as const },
    { label: "Our Story", href: "/our-story" },
    { label: "Help", href: "/help", menu: "help" as const },
  ],
  help: [
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Return & Refund Policy", href: "/returns" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    legal: [
      { label: "Our Story", href: "/our-story" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Hair Care Guides", href: "/blog" },
      { label: "My Account", href: "/account" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
  contact: {
    phone: "+92-313-8149292",
    phoneHref: "tel:+923138149292",
    email: "support@z2rherbal.com",
    location: "Pakistan",
    whatsapp: {
      number: "923138149292",
      greeting: "Assalam o Alaikum! I'd like to know more about Z2R Herbal hair oils.",
    },
  },
  socials: [
    { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/share/19vEDa73dZ/" },
    { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/z2rherbal" },
    { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@z2rherbal" },
  ],
  copyright: "© 2026 Z2R Herbal. All Rights Reserved.",
};

export const activeOffer = {
  id: "welcome-10",
  title: "Special Offer",
  headline: "on Your First Order",
  highlight: "10% OFF",
  code: "ZR2WELCOME",
  discountPercent: 10,
  cta: { label: "Shop Now", href: "/shop" },
};
