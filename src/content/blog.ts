export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "prices" }
  | { type: "directions" }
  | { type: "recommended" }
  | { type: "faq"; items: { question: string; answer: string }[] };

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  blocks: BlogBlock[];
}

const PATCH = "/blog/patch-test-before-using-hair-oil";
const HOW_TO = "/blog/how-to-oil-your-hair";
const HOW_OFTEN = "/blog/how-often-should-you-oil-your-hair";
const BEST = "/blog/best-hair-oil-in-pakistan";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-hair-oil-in-pakistan",
    title: "Best Hair Oil in Pakistan: How to Choose the Right One",
    seoTitle: "Best Hair Oil in Pakistan: A Buyer's Guide | Z2R Herbal",
    description:
      "How to choose the best hair oil in Pakistan: herbal blend or pure oil, what to check on the label, live prices, a patch test and Cash on Delivery.",
    publishedAt: "2026-11-24",
    updatedAt: "2026-11-24",
    blocks: [
      {
        type: "p",
        text: "Search for the best hair oil in Pakistan and you will find long lists of brands. The honest answer is that there is no single best hair oil for everyone: the right one depends on your hair, your routine and the ingredients you prefer. This guide explains the main kinds of hair oil, what to check before you buy and how to compare prices, so you can choose with confidence.",
      },
      { type: "h2", text: "The short answer" },
      {
        type: "ul",
        items: [
          "Want several traditional herbs in one oil? Choose a herbal blend, such as our [Signature Hair Oil]({product:blend}) with 10 herbs in 6 natural oils.",
          "Prefer one familiar ingredient? Choose a pure oil: almond (roghan badam), mustard (sarson ka tel), olive (zaitoon ka tel) or sesame (til ka tel). See our [pure hair oils](/collections/pure-oils).",
          "Want rosemary without mixing an essential oil yourself? Choose an oil with rosemary already blended in. See our [rosemary hair oils](/collections/with-rosemary).",
        ],
      },
      { type: "h2", text: "1. Herbal blend or pure oil?" },
      {
        type: "p",
        text: "A herbal blend combines herbs and oils in one bottle. The best-known herbs in South Asian hair oils include [amla]({ingredient:amla}), [reetha]({ingredient:reetha}) and [shikakai]({ingredient:shikakai}), often joined by [kalonji]({ingredient:kalonji}), [methi]({ingredient:fenugreek}) and [curry leaves]({ingredient:curry leaves}). A blend suits you if you like a traditional, all-in-one oil.",
      },
      {
        type: "p",
        text: "A pure oil is a single oil and nothing else. It is the simplest choice: you always know exactly what you are putting on your hair and scalp, and it suits people who already have a favourite oil, such as sarson ka tel for champi.",
      },
      { type: "h2", text: "2. Know the common hair oils" },
      {
        type: "ul",
        items: [
          "[Mustard oil]({ingredient:mustard}) (sarson ka tel): a strong, pungent aroma, and the classic oil for champi in Pakistan.",
          "[Coconut oil]({ingredient:coconut}) (nariyal ka tel): one of the most widely used hair oils in South Asia. It turns solid in cold weather, which is normal.",
          "[Almond oil]({ingredient:almond}) (roghan badam): a light oil pressed from sweet almonds, used in hair and skin care. Avoid it if you have a nut allergy.",
          "[Olive oil]({ingredient:olive}) (zaitoon ka tel): used around the world in hair and skin care.",
          "[Sesame oil]({ingredient:sesame}) (til ka tel): a traditional massage oil for the scalp and body.",
          "[Pumpkin seed oil]({ingredient:pumpkin}): a newer hair-care oil, used as a source of natural fatty acids.",
          "[Rosemary]({ingredient:rosemary}): a popular herb in scalp-care routines. Look for oils in which it is already diluted in a carrier oil.",
        ],
      },
      { type: "h2", text: "3. Read the label before you buy" },
      {
        type: "ul",
        items: [
          "The full ingredient list, so you know whether it is a pure oil or a blend.",
          "What it leaves out, such as mineral oil, added fragrance or preservatives, if that matters to you.",
          "The size in ml, so you can compare prices fairly.",
          "The directions and recommended use: how much to apply, how long to leave it on and how often to use it.",
          "The warnings: for external use only, keep it away from the eyes, and do a patch test first.",
        ],
      },
      { type: "h2", text: "4. Be realistic about results" },
      {
        type: "p",
        text: "Hair oils are cosmetic products. Used regularly, an oil can condition your hair, help it feel softer and add shine, and a gentle scalp massage is a relaxing part of many routines. No oil can promise to stop hair fall or regrow hair. If you have sudden, patchy or heavy hair loss, or a scalp problem that does not settle, please see a dermatologist.",
      },
      { type: "h2", text: "5. Compare prices" },
      {
        type: "p",
        text: "These are our current prices, read live from our store. Every bottle is the same size, so you can compare them directly.",
      },
      { type: "prices" },
      { type: "h2", text: "6. Do a patch test first" },
      {
        type: "p",
        text: `Whichever oil you choose, test it on a small patch of skin before the first full use. Our guide shows [how to do a patch test](${PATCH}) in a few simple steps.`,
      },
      { type: "h2", text: "How to use your new oil" },
      {
        type: "p",
        text: `Apply a small amount to the scalp and hair, massage gently, leave it on as the label directs, then wash it out with a gentle shampoo. Our step-by-step [champi routine](${HOW_TO}) and our guide to [how often to oil your hair](${HOW_OFTEN}) explain the details.`,
      },
      { type: "h2", text: "Frequently asked questions" },
      {
        type: "faq",
        items: [
          {
            question: "Which hair oil is best in Pakistan?",
            answer:
              "There is no single best hair oil for everyone. A herbal blend suits you if you want several traditional herbs in one oil; a pure oil such as almond, mustard, olive or sesame suits you if you prefer one familiar ingredient. Choose the one that suits your hair and routine, and do a patch test first.",
          },
          {
            question: "Which oil is best for hair growth?",
            answer:
              "No hair oil can guarantee hair growth or stop hair fall. Oils condition the hair and scalp as part of a care routine. If you are worried about hair loss, see a dermatologist.",
          },
          {
            question: "Is mustard oil or coconut oil better for hair?",
            answer:
              "Both are traditional hair oils in Pakistan. Mustard oil (sarson ka tel) has a strong aroma and is the classic champi oil; coconut oil is milder and turns solid in cold weather. Choose the one you prefer to use.",
          },
          {
            question: "Where can I buy hair oil online in Pakistan with Cash on Delivery?",
            answer:
              "You can order Z2R Herbal hair oils on z2rherbal.com. We deliver across Pakistan in 3–5 working days, and you can pay with Cash on Delivery.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-to-oil-your-hair",
    title: "How to Oil Your Hair: A Simple Champi Routine",
    seoTitle: "How to Oil Your Hair: A Simple Champi Routine",
    description:
      "A simple, step-by-step champi routine: how much oil to use, how to massage your scalp, how long to keep oil in your hair and how to wash it out.",
    publishedAt: "2026-11-24",
    updatedAt: "2026-11-24",
    blocks: [
      {
        type: "p",
        text: "Champi, the traditional head massage with oil, is part of hair care in many Pakistani homes. Done gently, it is an easy routine to keep. Here is a simple way to do it with any hair oil.",
      },
      { type: "h2", text: "Before you start" },
      {
        type: "ul",
        items: [
          `Do a [patch test](${PATCH}) before you use a new oil for the first time.`,
          "Read the directions on your oil's label or product page: each oil has its own recommended use.",
          "If your oil has turned solid in cold weather (coconut oil does), stand the bottle in lukewarm water for a few minutes.",
        ],
      },
      { type: "h2", text: "Step by step" },
      {
        type: "ol",
        items: [
          "Pour a small amount of oil into your palm. You can always add a little more.",
          "Part your hair into sections and apply the oil to the scalp along each parting.",
          "Massage gently with your fingertips, in small circles, for a few minutes. Do not rub hard or scratch the scalp.",
          "Smooth what is left on your hands through the lengths and ends of your hair.",
          "Leave the oil on for the time your product's directions give.",
          "Wash it out with a gentle shampoo. If your hair still feels oily, shampoo once more.",
        ],
      },
      { type: "h2", text: "How long should you keep oil in your hair?" },
      {
        type: "p",
        text: "Follow your oil's directions. These are the directions for each of our oils, read live from our product pages. If you leave oil in overnight, cover your pillow with an old towel.",
      },
      { type: "directions" },
      { type: "h2", text: "Safety tips" },
      {
        type: "ul",
        items: [
          "Hair oils are for external use only.",
          "Keep oil away from your eyes. If it gets in, rinse with clean water.",
          "Stop using an oil if it causes itching, redness or irritation.",
          "See a dermatologist for persistent or excessive hair loss, or a scalp problem that does not settle.",
        ],
      },
      {
        type: "p",
        text: `Ready to choose an oil? Compare our [hair oils and prices](/shop), read our guide to the [best hair oil in Pakistan](${BEST}), or see [how often to oil your hair](${HOW_OFTEN}).`,
      },
    ],
  },
  {
    slug: "how-often-should-you-oil-your-hair",
    title: "How Often Should You Oil Your Hair?",
    seoTitle: "How Often Should You Oil Your Hair?",
    description:
      "How often to oil your hair depends on the oil and your routine. See each Z2R oil's recommended use, signs you are using too much, and simple tips.",
    publishedAt: "2026-11-24",
    updatedAt: "2026-11-24",
    blocks: [
      {
        type: "p",
        text: "There is no single rule for how often to oil your hair. It depends on the oil, your hair and how often you wash it. The simplest guide is the oil's own label: each of our products gives its recommended use.",
      },
      { type: "h2", text: "Recommended use for each Z2R oil" },
      { type: "p", text: "Read live from our product pages:" },
      { type: "recommended" },
      { type: "h2", text: "Signs you are using too much" },
      {
        type: "ul",
        items: [
          "Your hair still feels greasy after washing.",
          "Oil runs onto your forehead or neck.",
          "Your hair looks flat or weighed down.",
        ],
      },
      { type: "p", text: "If this happens, use a smaller amount, or oil your hair less often." },
      { type: "h2", text: "Fit oiling around your wash days" },
      {
        type: "p",
        text: "Many people oil their hair a few hours before washing it, so the oil is shampooed out the same day. If you prefer to leave it on overnight, plan it for the night before a wash day.",
      },
      { type: "h2", text: "Be gentle" },
      {
        type: "p",
        text: "A light massage with your fingertips is enough. There is no need to rub hard, and more oil does not mean better results.",
      },
      {
        type: "p",
        text: `See also: [how to oil your hair](${HOW_TO}) step by step, [how to do a patch test](${PATCH}), and our guide to the [best hair oil in Pakistan](${BEST}).`,
      },
    ],
  },
  {
    slug: "patch-test-before-using-hair-oil",
    title: "How to Do a Patch Test Before Using a New Hair Oil",
    seoTitle: "How to Do a Patch Test for Hair Oil",
    description:
      "A patch test takes a few minutes and a day or two of waiting. Here is how to patch test a new hair oil, what to look for and what to do next.",
    publishedAt: "2026-11-24",
    updatedAt: "2026-11-24",
    blocks: [
      {
        type: "p",
        text: "Natural ingredients can still irritate sensitive skin. A patch test lets you check how your skin reacts to a new hair oil before you put it all over your scalp. Every Z2R Herbal product asks you to do one before first use.",
      },
      { type: "h2", text: "What you need" },
      {
        type: "ul",
        items: [
          "The new oil.",
          "A clean area of skin: the inside of your forearm or the skin behind your ear.",
          "A day or two in which you will not wash that area.",
        ],
      },
      { type: "h2", text: "How to do it" },
      {
        type: "ol",
        items: [
          "Wash and dry the area of skin.",
          "Apply a small drop of the oil and spread it over a coin-sized patch.",
          "Leave it on, without washing it off, for 24 to 48 hours.",
          "Check the patch a few times during that time.",
        ],
      },
      { type: "h2", text: "What to look for" },
      {
        type: "p",
        text: "Look for redness, itching, burning, swelling, a rash or any other irritation. If you notice any of these, wash the oil off with mild soap and water and do not use it. If the reaction is strong or does not settle, see a doctor.",
      },
      {
        type: "p",
        text: "If there is no reaction after 48 hours, you can start using the oil on your scalp as its label directs. Start with a small amount.",
      },
      { type: "h2", text: "Good to know" },
      {
        type: "ul",
        items: [
          "A patch test lowers the risk of a reaction, but it cannot rule out every reaction.",
          "If you have a nut allergy, check the ingredients: our [almond oil]({product:almond}) is made from almonds.",
          "Do a new patch test whenever you try a new oil, even from the same brand.",
          "Keep oils away from the eyes, and do not use them on broken or irritated skin.",
        ],
      },
      {
        type: "p",
        text: `Next: learn [how to oil your hair](${HOW_TO}), or compare our [hair oils](/shop).`,
      },
    ],
  },
];

export const blogPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
