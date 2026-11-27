export const FAQS = [
  {
    question: "What makes Z2R hair oils different from other hair oils?",
    answer:
      "Z2R hair oils are made with carefully selected natural oils and herbal ingredients. Our products are designed to nourish your hair and support a healthy hair-care routine.",
  },
  {
    question: "Are Z2R products 100% herbal?",
    answer:
      "Yes! Our hair oils are made using natural oils and selected herbal ingredients, without unnecessary chemical additives.",
  },
  {
    question: "Can Z2R hair oils help reduce hair fall?",
    answer:
      "Our hair oils help nourish the scalp and condition the hair, supporting healthier-looking and stronger hair.",
  },
  {
    question: "Can I use Z2R hair oils on a daily basis?",
    answer:
      "Usage depends on your hair type and personal preference. We recommend following the usage instructions provided with each product.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Results may vary depending on individual hair condition, hair type, and consistency of use. Regular hair care is important for maintaining healthy hair.",
  },
  {
    question: "Are Z2R hair oils suitable for all hair types?",
    answer:
      "Our products are formulated for different hair-care needs. Please check the individual product description to find the best option for your hair.",
  },
  {
    question: "How can I place an order?",
    answer:
      "You can easily place your order through our website by selecting your desired product and completing the checkout process.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Please check the available payment options at checkout for the latest payment methods.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery usually takes 3–5 working days, depending on your location.",
  },
  {
    question: "Can I return or exchange my order?",
    answer:
      "If you receive a damaged, defective, or incorrect product, please contact our customer support team for assistance.",
  },
  {
    question: "How can I contact Z2R customer support?",
    answer:
      "You can contact us through our WhatsApp, social media pages, or the contact details provided on our website. We will be happy to assist you.",
  },
] as const;

export type Faq = { question: string; answer: string };

const COD_QUESTION = "Do you offer Cash on Delivery (COD)?";
const joinNames = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`;

export function faqsWithPayments(methods: string[]): Faq[] {
  const offered = methods.length > 0 ? methods : ["Cash on Delivery"];
  const cod = offered.some((m) => /\bcod\b|on\s*delivery/i.test(m));
  return FAQS.map((faq) =>
    faq.question === COD_QUESTION && cod
      ? {
          question: faq.question,
          answer: `Yes. Cash on Delivery is available across Pakistan: you pay when your order arrives. ${
            offered.length > 1 ? `At checkout you can choose ${joinNames(offered)}.` : ""
          }`.trim(),
        }
      : { question: faq.question, answer: faq.answer },
  );
}
